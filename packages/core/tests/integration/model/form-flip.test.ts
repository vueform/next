import { defineSchema, useModel, type ModelInstance } from '@vueform/core'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { createForm, flushPromises, mountApp } from '../../helpers'

/**
 * Runs a factory inside a mounted component's setup (so `useConfig()` resolves)
 * and returns its result.
 */
const inSetup = <T>(fn: () => T): T => {
  let result!: T
  mountApp(
    defineComponent({
      template: '<div />',
      setup() {
        result = fn()
        return {}
      },
    }) as any
  )
  return result
}

const schema = defineSchema({
  name: { type: 'text', rules: 'required' },
  email: { type: 'text', rules: 'email' },
})

const createModel = (data?: Record<string, any>): ModelInstance<any> =>
  inSetup(() => useModel(schema, data as any)) as any

describe('Form flip: mounted registration claims index nodes', () => {
  it('resolves instance.find to the mounted context while adopted', async () => {
    const model$ = createModel({ name: 'John' })

    const mounted = createForm({ schema, modelValue: model$ })
    await nextTick()

    // The mounted element context claims the walk node — single authority.
    expect(model$.find('name')).toBe(mounted.name)
    expect(model$.index.nodes.get('name')!.el$).toBe(mounted.name)
  })

  it('reflects mounted validation in instance aggregates without validate()', async () => {
    const model$ = createModel({ email: 'not-an-email' })

    const mounted = createForm({ schema, modelValue: model$ })
    await nextTick()

    await mounted.form$.validate()
    await flushPromises()

    // Mounted validation lives on the nodes, so the instance sees it directly.
    expect(model$.invalid).toBe(true)
    expect(model$.errors).toEqual([
      ...mounted.name.errors,
      ...mounted.email.errors,
    ])
  })

  it('validates through the mounted validators when adopted', async () => {
    const model$ = createModel({ name: 'John', email: 'john@example.com' })

    createForm({ schema, modelValue: model$ })
    await nextTick()

    expect(await model$.validate()).toBe(true)

    model$.set('email', 'nope')
    expect(await model$.validate()).toBe(false)
  })

  it('releases claims on unmount and falls back to headless engines', async () => {
    const model$ = createModel({ name: 'John' })

    const mounted = createForm({ schema, modelValue: model$ })
    await nextTick()

    expect(model$.find('name')).toBe(mounted.name)

    mounted.form.unmount()

    // Claims are gone — virtual contexts take over, data stays.
    expect(model$.index.nodes.get('name')!.el$).toBeUndefined()
    expect(model$.index.nodes.get('email')!.el$).toBeUndefined()
    expect(model$.find('name')!.value).toBe('John')

    model$.set('email', 'still-not-an-email')
    expect(await model$.validate()).toBe(false)
    expect(model$.errors).toHaveLength(1)
  })

  it('fills a plain form’s index entirely by registration', async () => {
    const mounted = createForm({
      schema: defineSchema({
        name: { type: 'text' },
        address: {
          type: 'group',
          schema: { city: { type: 'text' } },
        },
      }),
    })
    await nextTick()

    const index = mounted.form$.index

    expect(index.nodes.get('name')!.el$).toBe(mounted.name)
    expect(index.nodes.get('address.city')!.el$).toBe(mounted['address.city'])

    mounted.form.unmount()

    // Registration-created nodes are removed with their elements.
    expect(index.nodes.size).toBe(0)
  })
})
