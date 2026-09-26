import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { createForm, flushPromises } from '../../helpers'
import { defineSchema } from '#core'

/**
 * Installs a Vueform app (registering the model + expression modules with the
 * expr-eval adapter) by mounting a throwaway form.
 */
const install = (config: Record<string, any> = {}) =>
  createForm({ schema: defineSchema({ _install: { type: 'text' } }) }, config)

describe('Reactive schema (useModel with a ref)', () => {
  it('seeds added elements with their defaults and keeps existing values', async () => {
    const { vueform } = install()

    const schema = ref<any>({
      a: { type: 'text', default: 'foo' },
    })

    const model$ = vueform.useModel(schema)

    model$.set('a', 'edited')

    schema.value = {
      a: { type: 'text', default: 'foo' },
      b: { type: 'text', default: 'fresh' },
    }
    await nextTick()

    expect(model$.get('a')).toBe('edited')
    expect(model$.get('b')).toBe('fresh')
  })

  it('drops removed elements from data and payload', async () => {
    const { vueform } = install()

    const schema = ref<any>({
      a: { type: 'text', default: 'foo' },
      b: { type: 'text', default: 'bar' },
    })

    const model$ = vueform.useModel(schema)

    expect(model$.payload).toEqual({ a: 'foo', b: 'bar' })

    schema.value = {
      a: { type: 'text', default: 'foo' },
    }
    await nextTick()

    expect(model$.get('b')).toBeUndefined()
    expect(model$.model).toEqual({ a: 'foo' })
    expect(model$.payload).toEqual({ a: 'foo' })
    expect(model$.index.nodes.has('b')).toBe(false)
  })

  it('keeps dirty false across structural changes alone', async () => {
    const { vueform } = install()

    const schema = ref<any>({
      a: { type: 'text', default: 'foo' },
    })

    const model$ = vueform.useModel(schema)

    expect(model$.dirty).toBe(false)

    schema.value = {
      a: { type: 'text', default: 'foo' },
      b: { type: 'text', default: 'bar' },
    }
    await nextTick()

    expect(model$.dirty).toBe(false)

    schema.value = {
      a: { type: 'text', default: 'foo' },
    }
    await nextTick()

    expect(model$.dirty).toBe(false)

    // Value edits still register as dirty.
    model$.set('a', 'edited')
    expect(model$.dirty).toBe(true)
  })

  it('preserves node identity for surviving paths', async () => {
    const { vueform } = install()

    const schema = ref<any>({
      a: { type: 'text', label: 'One' },
    })

    const model$ = vueform.useModel(schema)
    const node = model$.index.nodes.get('a')!

    schema.value = {
      a: { type: 'text', label: 'Two' },
      b: { type: 'text' },
    }
    await nextTick()

    expect(model$.index.nodes.get('a')).toBe(node)
    expect(node.props.label).toBe('Two')
    expect(node.genericName).toBe('Two')
  })

  it('applies changed validation rules', async () => {
    const { vueform } = install()

    const schema = ref<any>({
      email: { type: 'text' },
    })

    const model$ = vueform.useModel(schema)

    expect(await model$.validate()).toBe(true)

    schema.value = {
      email: { type: 'text', label: 'Email', rules: 'required' },
    }
    await nextTick()

    expect(await model$.validate()).toBe(false)
    expect(model$.errors[0]).toContain('Email')

    schema.value = {
      email: { type: 'text' },
    }
    await nextTick()

    expect(await model$.validate()).toBe(true)
    expect(model$.errors).toEqual([])
  })

  it('applies changed conditions to availability and payload', async () => {
    const { vueform } = install()

    const schema = ref<any>({
      country: { type: 'text', default: 'de' },
      state: { type: 'text', default: 'CA' },
    })

    const model$ = vueform.useModel(schema)

    expect(model$.payload).toEqual({ country: 'de', state: 'CA' })

    schema.value = {
      country: { type: 'text', default: 'de' },
      state: {
        type: 'text',
        default: 'CA',
        conditions: [['country', '==', 'us']],
      },
    }
    await nextTick()

    expect(model$.find('state')!.available).toBe(false)
    expect(model$.payload).toEqual({ country: 'de' })

    model$.set('country', 'us')
    expect(model$.find('state')!.available).toBe(true)
    expect(model$.payload).toEqual({ country: 'us', state: 'CA' })
  })

  it('re-resolves changed expression templates', async () => {
    const { vueform } = install()

    const schema = ref<any>({
      a: { type: 'text', default: 'foo' },
      b: { type: 'text', default: '{a}' },
    })

    const model$ = vueform.useModel(schema)

    expect(model$.get('b')).toBe('foo')

    schema.value = {
      a: { type: 'text', default: 'foo' },
      b: { type: 'text', default: '{a}!' },
    }
    await nextTick()

    expect(model$.get('b')).toBe('foo!')

    model$.set('a', 'bar')
    expect(model$.get('b')).toBe('bar!')
  })

  it('re-resolves prop-referencing expressions with the new props', async () => {
    const { vueform } = install()

    const label = 'Foo'
    const schema = ref<any>({
      text: { type: 'text', label, default: '{@props.label}' },
    })

    const model$ = vueform.useModel(schema)

    expect(model$.get('text')).toBe('Foo')

    schema.value = {
      text: { type: 'text', label: 'Bar', default: '{@props.label}' },
    }
    await nextTick()

    expect(model$.get('text')).toBe('Bar')
  })

  it('preserves a user untrack across rebuilds', async () => {
    const { vueform } = install()

    const schema = ref<any>({
      a: { type: 'text' },
      b: { type: 'text', default: '{a}' },
    })

    const model$ = vueform.useModel(schema, { a: 'foo' })

    // User edit unlinks the tracker (default untrackOn includes 'input').
    model$.input({ b: 'manual' })

    schema.value = {
      a: { type: 'text', label: 'Changed' },
      b: { type: 'text', label: 'Changed', default: '{a}' },
    }
    await nextTick()

    // The rebuild must not resurrect the expression over the user's value.
    expect(model$.get('b')).toBe('manual')

    model$.set('a', 'bar')
    expect(model$.get('b')).toBe('manual')
  })

  it('keeps model-argument templates live across rebuilds', async () => {
    const { vueform } = install()

    const schema = ref<any>({
      a: { type: 'text' },
      b: { type: 'text' },
    })

    const model$ = vueform.useModel(schema, { a: 'foo', b: '{a}' })

    expect(model$.get('b')).toBe('foo')

    // The store no longer holds the template (already resolved) — the carried
    // sources keep the tracker alive through a props change on its node.
    schema.value = {
      a: { type: 'text' },
      b: { type: 'text', label: 'Changed' },
    }
    await nextTick()

    model$.set('a', 'bar')
    expect(model$.get('b')).toBe('bar')
  })

  it('clears added elements to their null values after a rebuild', async () => {
    const { vueform } = install()

    const schema = ref<any>({
      a: { type: 'text', default: 'foo' },
    })

    const model$ = vueform.useModel(schema)

    schema.value = {
      a: { type: 'text', default: 'foo' },
      tags: { type: 'checkboxes', default: ['x'] },
    }
    await nextTick()

    expect(model$.get('tags')).toEqual(['x'])

    model$.clear()

    expect(model$.get('a')).toBeNull()
    expect(model$.get('tags')).toEqual([])
  })

  it('skips rebuilds for structurally identical schemas', async () => {
    const { vueform } = install()

    const schema = ref<any>({
      a: { type: 'text', label: 'One' },
    })

    const model$ = vueform.useModel(schema)
    const version = model$.index.version.value

    schema.value = {
      a: { type: 'text', label: 'One' },
    }
    await nextTick()

    expect(model$.index.version.value).toBe(version)
  })

  it('follows schema changes while adopted by a mounted form', async () => {
    const { vueform } = install()
    const schema = ref<any>(
      defineSchema({
        a: { type: 'text', default: 'foo' },
        b: { type: 'text', default: 'bar' },
      })
    )

    const model$ = vueform.useModel(schema)
    const mounted = createForm({
      schema: schema.value,
      modelValue: model$,
    })
    await nextTick()

    expect(mounted.a.value).toBe('foo')

    const next = defineSchema({
      a: { type: 'text', default: 'foo' },
      c: { type: 'text', default: 'new' },
    })

    // The app binds the same computed to both — mirror it here.
    schema.value = next
    await mounted.form.setProps({ schema: next })
    await flushPromises()

    // Added element: seeded by the rebuild, claimed by the mounted component.
    expect(model$.get('c')).toBe('new')
    expect(mounted.form$.find('c')?.value).toBe('new')

    // Removed element: unmounted and dropped from the shared data.
    expect(mounted.form$.find('b')).toBeUndefined()
    expect(model$.get('b')).toBeUndefined()

    // Surviving element: still the mounted context, data intact.
    expect(mounted.form$.find('a')?.value).toBe('foo')
    mounted.form$.find('a')!.update('edited')
    expect(model$.get('a')).toBe('edited')
  })
})
