import { useModel, type ModelInstance } from '@vueform/core'
import { describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, isReactive, ref } from 'vue'

import { mountApp } from '../../helpers'

/**
 * Runs a factory inside a mounted component's setup (so `useConfig()` resolves)
 * and returns its result.
 */
const inSetup = <T>(fn: () => T, config: Record<string, any> = {}): T => {
  let result!: T
  mountApp(
    defineComponent({
      template: '<div />',
      setup() {
        result = fn()
        return {}
      },
    }) as any,
    {},
    config
  )
  return result
}

describe('useModel building', () => {
  it('builds the full model shape from element null values', () => {
    const model$ = inSetup(() =>
      useModel({
        name: { type: 'text' },
        bio: { type: 'textarea' },
        subscribe: { type: 'checkbox' },
        interests: { type: 'checkboxes' },
        color: { type: 'radios' },
        country: { type: 'select' },
        tags: { type: 'select', multiple: true },
        avatar: { type: 'file' },
      })
    )

    expect(model$.model).toEqual({
      name: null,
      bio: null,
      subscribe: false,
      interests: [],
      color: null,
      country: null,
      tags: [],
      avatar: null,
    })
  })

  it('skips non-data elements', () => {
    const model$ = inSetup(() =>
      useModel({
        name: { type: 'text' },
        submit: { type: 'button', buttonLabel: 'Submit' },
        info: { type: 'content', content: 'hello' },
      } as any)
    )

    expect(Object.keys(model$.model)).toEqual(['name'])
  })

  it('respects element-specific null values', () => {
    const model$ = inSetup(() =>
      useModel({
        agree: { type: 'checkbox', falseValue: 'no' },
        custom: { type: 'field', nullValue: 0 },
      } as any)
    )

    expect(model$.model).toEqual({ agree: 'no', custom: 0 })
  })

  it('applies value precedence: modelValue > default > nullValue', () => {
    const model$ = inSetup(() =>
      useModel({
        a: { type: 'text' },
        b: { type: 'text', default: 'def' },
        c: { type: 'text', default: 'def', modelValue: 'mv' },
      })
    )

    expect(model$.model).toEqual({ a: null, b: 'def', c: 'mv' })
  })

  it('applies the passed model over schema values', () => {
    const model$ = inSetup(() =>
      useModel(
        {
          a: { type: 'text', default: 'def' },
          b: { type: 'text' },
        },
        { a: 'arg' }
      )
    )

    expect(model$.model).toEqual({ a: 'arg', b: null })
    expect(model$.dirty).toBe(false)
  })

  it('rejects a Vue ref seed and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const model$ = inSetup(() =>
      useModel({ text: { type: 'text' } }, ref({ text: 'foo' }) as any)
    )

    expect(model$.model).toEqual({ text: null })
    expect(model$.model).not.toHaveProperty('_value')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Vue ref was passed as the model seed')
    )

    warn.mockRestore()
  })

  it('flattens group children unless nested', () => {
    const model$ = inSetup(() =>
      useModel({
        address: {
          type: 'group',
          schema: {
            city: { type: 'text' },
            zip: { type: 'text', default: '1234' },
          },
        },
        billing: {
          type: 'group',
          nested: true,
          schema: { iban: { type: 'text' } },
        },
      })
    )

    expect(model$.model).toEqual({
      city: null,
      zip: '1234',
      billing: { iban: null },
    })
  })

  it('builds list rows from initial and the prototype', () => {
    const model$ = inSetup(() =>
      useModel({
        contacts: {
          type: 'list',
          initial: 2,
          schema: {
            name: { type: 'text' },
            email: { type: 'text' },
          },
        },
        domains: {
          type: 'list',
          flat: true,
          initial: 1,
          schema: { domain: { type: 'text' } },
        },
      } as any)
    )

    expect(model$.model).toEqual({
      contacts: [
        { name: null, email: null },
        { name: null, email: null },
      ],
      domains: [null],
    })
  })

  it('builds grid cells flattened with auto names', () => {
    const model$ = inSetup(() =>
      useModel({
        info: {
          type: 'grid',
          grid: [[{ type: 'text', name: 'a' }, { type: 'text' }, 'label']],
        },
      } as any)
    )

    expect(model$.model).toEqual({ a: null, info_0_1: null })
  })

  it('builds matrix shapes per mode', () => {
    const model$ = inSetup(() =>
      useModel({
        single: {
          type: 'matrix',
          mode: 'single',
          rows: ['r1', 'r2'],
          cols: ['c1', 'c2'],
        },
        multiple: {
          type: 'matrix',
          mode: 'multiple',
          rows: ['r1'],
          cols: ['c1', 'c2'],
        },
        auto: {
          type: 'matrix',
          rows: ['r1'],
          cols: ['c1', 'c2'],
        },
        dynamic: {
          type: 'matrix',
          mode: 'single',
          rows: 2,
          cols: ['c1'],
        },
      } as any)
    )

    expect(model$.model).toEqual({
      single: { r1: null, r2: null },
      multiple: { r1: [] },
      auto: { r1: { c1: null, c2: null } },
      dynamic: [null, null],
    })
  })

  it('expands translatable values into locale-keyed objects', () => {
    const model$ = inSetup(
      () =>
        useModel({
          title: { type: 'text', translate: true },
          desc: { type: 'text', translate: true, default: 'foo' },
        } as any),
      { languages: { en_US: 'English', de_DE: 'German' } }
    )

    expect(model$.model).toEqual({
      title: { en_US: null, de_DE: null },
      desc: { en_US: 'foo', de_DE: 'foo' },
    })
  })
})

describe('useModel store API', () => {
  const create = (model?: Record<string, any>): ModelInstance<any> =>
    inSetup(() =>
      useModel(
        {
          name: { type: 'text' },
          address: {
            type: 'group',
            nested: true,
            schema: { city: { type: 'text' } },
          },
          tags: { type: 'checkboxes' },
        },
        model as any
      )
    ) as any

  it('gets and sets values by path', () => {
    const model$ = create()

    model$.set('name', 'John')
    model$.set('address.city', 'Berlin')

    expect(model$.get('name')).toBe('John')
    expect(model$.get('address.city')).toBe('Berlin')
    expect(model$.get()).toEqual({
      name: 'John',
      address: { city: 'Berlin' },
      tags: [],
    })
  })

  it('update deep-merges objects and replaces arrays', () => {
    const model$ = create({ name: 'John', tags: ['a'] })

    model$.update({ address: { city: 'Berlin' }, tags: ['b', 'c'] })

    expect(model$.model).toEqual({
      name: 'John',
      address: { city: 'Berlin' },
      tags: ['b', 'c'],
    })
  })

  it('load updates and fires the load event', () => {
    const model$ = create()
    const onLoad = vi.fn()

    model$.on('load', onLoad)
    model$.load({ name: 'John' })

    expect(model$.model.name).toBe('John')
    expect(onLoad).toHaveBeenCalledTimes(1)
  })

  it('tracks dirty and supports clean and reset', () => {
    const model$ = create({ name: 'John' })

    expect(model$.dirty).toBe(false)

    model$.set('name', 'Jane')
    expect(model$.dirty).toBe(true)

    model$.reset()
    expect(model$.model.name).toBe('John')
    expect(model$.dirty).toBe(false)

    model$.set('name', 'Jane')
    model$.clean()
    expect(model$.dirty).toBe(false)
    expect(model$.model.name).toBe('Jane')
  })

  it('tracks empty and supports clear', () => {
    const model$ = create()

    expect(model$.empty).toBe(true)

    model$.set('name', 'John')
    model$.set('tags', ['a'])
    expect(model$.empty).toBe(false)

    model$.clear()
    expect(model$.model).toEqual({
      name: null,
      address: { city: null },
      tags: [],
    })
    expect(model$.empty).toBe(true)
  })

  it('clears dynamic container arrays to empty', () => {
    const model$ = inSetup(() =>
      useModel({
        items: {
          type: 'list',
          initial: 1,
          schema: { name: { type: 'text' } },
        },
      } as any)
    )

    expect(model$.model).toEqual({ items: [{ name: null }] })

    model$.clear()
    expect(model$.model).toEqual({ items: [] })
  })

  it('serializes to JSON and FormData', () => {
    const model$ = create({ name: 'John' })

    expect(JSON.parse(model$.toJSON())).toEqual({
      name: 'John',
      address: { city: null },
      tags: [],
    })

    const formData = model$.toFormData()
    expect(formData).toBeInstanceOf(FormData)
    expect(formData.get('name')).toBe('John')
  })

  it('warns when submitting while not attached', async () => {
    const model$ = create()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const result = await model$.submit()

    expect(result).toBeUndefined()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('not attached by any form')
    )
    expect(model$.attached).toBe(false)

    warn.mockRestore()
  })
})

describe('useModel destructuring', () => {
  it('keeps a destructured model reference live and reactive', async () => {
    const { model, data, set, get, update, clear, reset, clean } = inSetup(() =>
      useModel({
        name: { type: 'text' },
        tags: { type: 'select', multiple: true },
      })
    )

    expect(isReactive(model)).toBe(true)

    // `data` is the same reactive object as `model` — a conflict-free alias
    // for destructuring.
    expect(data).toBe(model)

    // The destructured reference tracks in computeds.
    const upper = computed(() => String(model.name ?? '').toUpperCase())
    expect(upper.value).toBe('')

    set('name', 'john')
    expect(model.name).toBe('john')
    expect(get('name')).toBe('john')
    expect(upper.value).toBe('JOHN')

    // Every store operation mutates the same object — the reference never
    // goes stale.
    update({ tags: ['a'] })
    expect(model.tags).toEqual(['a'])

    clean()
    set('name', 'jane')
    reset()
    expect(model.name).toBe('john')

    clear()
    expect(model.name).toBe(null)
    expect(upper.value).toBe('')
  })
})
