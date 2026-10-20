import { defineSchema } from '@vueform/core'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'

import { createForm, flushPromises } from '../../helpers'

/**
 * Installs a Vueform app (registering the model + expression modules with the
 * expr-eval adapter) by mounting a throwaway form, then creates a headless
 * model.
 */
const install = (config: Record<string, any> = {}) =>
  createForm({ schema: defineSchema({ _install: { type: 'text' } }) }, config)

describe('Headless model expressions', () => {
  it('resolves a model-provided template at creation and keeps it live', () => {
    const { vueform } = install()

    const { model, set, get } = vueform.useModel(
      {
        schema: defineSchema({
          text: { type: 'text' },
          text2: { type: 'text' },
        }),
      },
      {
        text: '{text2}',
        text2: 'foo',
      }
    )

    expect(model.text).toBe('foo')

    set('text2', 'bar')
    expect(get('text')).toBe('bar')
  })

  it('tracks template `default` props like a mounted form', async () => {
    const schema = defineSchema({
      a: { type: 'text', default: 'foo' },
      b: { type: 'text', default: '{a}' },
    })

    const mounted = install({ schema } as any)
    const { vueform } = mounted
    const model$ = vueform.useModel({ schema })

    await nextTick()

    expect(model$.get('b')).toBe('foo')

    model$.set('a', 'baz')
    expect(model$.get('b')).toBe('baz')

    // Mounted parity: the mounted tracker produces the same value.
    const form = createForm({ schema })
    await nextTick()
    expect(form.b.value).toBe('foo')

    void mounted
  })

  it('resolves dependency-free templates once without a tracker', () => {
    const { vueform } = install()

    const model$ = vueform.useModel({
      schema: defineSchema({
        sum: { type: 'text', default: '{1 + 1}' },
      }),
    })

    expect(model$.get('sum')).toBe(2)
  })

  it('untracks on user edits (`input`) by default', () => {
    const { vueform } = install()

    const model$ = vueform.useModel(
      {
        schema: defineSchema({
          a: { type: 'text' },
          b: { type: 'text', default: '{a}' },
        }),
      },
      { a: 'foo' }
    )

    // Programmatic writes never untrack — the expression overwrites them.
    model$.set('b', 'ignored')
    model$.set('a', 'bar')
    expect(model$.get('b')).toBe('bar')

    // `input()` is a user edit: default untrackOn is ['input', 'load'], so
    // the tracker unlinks.
    model$.input({ b: 'manual' })
    model$.set('a', 'baz')
    expect(model$.get('b')).toBe('manual')
  })

  it('keeps overwriting edits with untrackOn: []', () => {
    const { vueform } = install()

    const model$ = vueform.useModel(
      {
        schema: defineSchema({
          a: { type: 'text' },
          b: { type: 'text', default: '{a}', untrackOn: [] },
        }) as any,
      },
      { a: 'foo' }
    )

    // Explicitly opted out of untracking: even user edits don't unlink, so
    // the expression overwrites on the next dependency change.
    model$.input({ b: 'manual' })
    expect(model$.get('b')).toBe('manual')

    model$.set('a', 'bar')
    expect(model$.get('b')).toBe('bar')
  })

  it('untracks on direct edits with untrackOn: ["input"]', () => {
    const { vueform } = install()

    const model$ = vueform.useModel(
      {
        schema: defineSchema({
          a: { type: 'text' },
          b: { type: 'text', default: '{a}', untrackOn: ['input'] },
        }) as any,
      },
      { a: 'foo' }
    )

    expect(model$.get('b')).toBe('foo')

    // Dependency updates alone don't untrack.
    model$.set('a', 'bar')
    expect(model$.get('b')).toBe('bar')

    model$.input({ b: 'manual' })
    model$.set('a', 'baz')
    expect(model$.get('b')).toBe('manual')
  })

  it('untracks on load with untrackOn: ["load"]', () => {
    const { vueform } = install()

    const model$ = vueform.useModel(
      {
        schema: defineSchema({
          a: { type: 'text' },
          b: { type: 'text', default: '{a}', untrackOn: ['load'] },
        }) as any,
      },
      { a: 'foo' }
    )

    expect(model$.get('b')).toBe('foo')

    model$.load({ b: 'loaded' })
    model$.set('a', 'bar')
    expect(model$.get('b')).toBe('loaded')
  })

  it('tracks translatable templates per language', () => {
    const { vueform } = install({
      languages: { en_US: 'English', de_DE: 'German' },
    })

    const model$ = vueform.useModel(
      {
        schema: {
          title: { type: 'text' },
          copy: {
            type: 'text',
            translate: true,
            default: { en_US: '{title}!', de_DE: 'static' },
          },
        } as any,
      },
      { title: 'Hello' }
    )

    expect(model$.get('copy')).toEqual({ en_US: 'Hello!', de_DE: 'static' })

    model$.set('title', 'Hi')
    expect(model$.get('copy.en_US')).toBe('Hi!')
    expect(model$.get('copy.de_DE')).toBe('static')
  })

  it('resolves app-wide consts from $expression.consts', () => {
    const { vueform } = install({ $expression: { consts: { rate: 3 } } })

    const model$ = vueform.useModel(
      {
        schema: defineSchema({
          price: { type: 'text' },
          total: { type: 'text', default: '{price * rate}' },
        }),
      },
      { price: 10 }
    )

    // Config-level consts are registered into the expression parser by the
    // adapter — no instance consts needed.
    expect(model$.get('total')).toBe(30)
  })

  it('keeps templates literal when expressions are disabled', () => {
    const { vueform } = install({ $expression: { enabled: false } })

    const model$ = vueform.useModel(
      {
        schema: defineSchema({
          text: { type: 'text' },
          text2: { type: 'text' },
        }),
      },
      {
        text: '{text2}',
        text2: 'foo',
      }
    )

    expect(model$.get('text')).toBe('{text2}')
  })

  it('keeps tracking while attached and untracks on mounted edits', async () => {
    const { vueform } = install()

    const schema = defineSchema({
      text: { type: 'text', untrackOn: ['input'] },
      text2: { type: 'text' },
    } as any)

    const model$ = vueform.useModel(
      { schema },
      {
        text: '{text2}',
        text2: 'foo',
      }
    )

    const mounted = createForm({ schema, modelValue: model$ })
    await nextTick()

    expect(mounted.text.value).toBe('foo')

    // Dependency changes flow through the shared store into the mounted view.
    model$.set('text2', 'bar')
    await flushPromises()
    expect(mounted.text.value).toBe('bar')

    // A real user edit (the element's `input` event) unlinks the tracker;
    // programmatic `update` alone would not.
    mounted.text.handleInput('manual')
    await flushPromises()

    model$.set('text2', 'baz')
    expect(model$.get('text')).toBe('manual')
  })
})
