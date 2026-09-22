import { defineSchema } from '@vueform/core'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { createForm, flushPromises } from '../helpers'

/**
 * Mounts a form and creates a headless model from the same schema on the form's
 * Vueform instance.
 */
const mountAndModel = (schema: any, data?: Record<string, any>) => {
  const mounted = createForm({
    schema,
    ...(data !== undefined ? { modelValue: data } : {}),
  })
  const model$ = mounted.vueform.useModel(schema, data)
  return { mounted, model$ }
}

/**
 * Asserts that the mounted element and the headless virtual context agree on
 * availability, validity, and error messages.
 */
const expectElementParity = (mountedEl: any, virtualEl: any) => {
  expect(virtualEl).toBeDefined()
  expect(virtualEl.available).toBe(mountedEl.available)
  expect(virtualEl.invalid).toBe(mountedEl.invalid)
  expect(virtualEl.errors).toEqual(mountedEl.errors)
}

describe('Headless model engine parity', () => {
  it('agrees with the mounted form on failing validation', async () => {
    const schema = defineSchema({
      name: { type: 'text', rules: 'required' },
      email: { type: 'text', rules: 'email', default: 'not-an-email' },
      age: { type: 'text', rules: 'numeric', default: 'abc' },
    })

    const { mounted, model$ } = mountAndModel(schema)

    await mounted.form$.validate()
    const headlessValid = await model$.validate()
    await flushPromises()

    expect(headlessValid).toBe(false)
    expect(model$.invalid).toBe(true)

    for (const path of ['name', 'email', 'age']) {
      expectElementParity(mounted[path], model$.find(path))
    }

    expect([...model$.errors].sort()).toEqual(
      [
        ...mounted.name.errors,
        ...mounted.email.errors,
        ...mounted.age.errors,
      ].sort()
    )
  })

  it('agrees with the mounted form on passing validation', async () => {
    const schema = defineSchema({
      name: { type: 'text', rules: 'required', default: 'John' },
      email: {
        type: 'text',
        rules: 'required|email',
        default: 'john@example.com',
      },
    })

    const { mounted, model$ } = mountAndModel(schema)

    await mounted.form$.validate()
    const headlessValid = await model$.validate()
    await flushPromises()

    expect(headlessValid).toBe(true)
    expect(model$.invalid).toBe(false)
    expect(model$.errors).toEqual([])
    expect(mounted.form$.invalid).toBe(false)
  })

  it('resolves conditions and skips unavailable elements like a mounted form', async () => {
    const schema = defineSchema({
      subscribe: { type: 'checkbox' },
      frequency: {
        type: 'text',
        rules: 'required',
        conditions: [['subscribe', '==', true]],
      },
    })

    const { mounted, model$ } = mountAndModel(schema)

    // Unavailable on both sides — required rule must not block validity.
    expectElementParity(mounted.frequency, model$.find('frequency'))
    expect(model$.find('frequency')!.available).toBe(false)

    expect(await model$.validate()).toBe(true)
    expect(model$.invalid).toBe(false)

    // Meet the condition on both sides.
    mounted.subscribe.update(true)
    model$.set('subscribe', true)
    await nextTick()

    expectElementParity(mounted.frequency, model$.find('frequency'))
    expect(model$.find('frequency')!.available).toBe(true)

    await mounted.form$.validate()
    expect(await model$.validate()).toBe(false)
    await flushPromises()

    expectElementParity(mounted.frequency, model$.find('frequency'))
    expect(model$.invalid).toBe(true)
  })

  it('excludes unavailable elements from the payload but keeps them in data', async () => {
    const schema = defineSchema({
      subscribe: { type: 'checkbox' },
      frequency: {
        type: 'text',
        default: 'weekly',
        conditions: [['subscribe', '==', true]],
      },
      internal: { type: 'text', submit: false, default: 'x' },
    })

    const { model$ } = mountAndModel(schema)

    expect(model$.data).toEqual({
      subscribe: false,
      frequency: 'weekly',
      internal: 'x',
    })
    expect(model$.payload).toEqual({ subscribe: false })

    model$.set('subscribe', true)
    await nextTick()

    expect(model$.payload).toEqual({ subscribe: true, frequency: 'weekly' })
  })

  it('agrees with the mounted form on nested and flat container paths', async () => {
    const schema = defineSchema({
      address: {
        type: 'group',
        schema: {
          city: { type: 'text', rules: 'required' },
        },
      },
      billing: {
        type: 'group',
        nested: true,
        schema: {
          iban: { type: 'text', rules: 'required', default: 'DE123' },
        },
      },
    })

    const { mounted, model$ } = mountAndModel(schema)

    await mounted.form$.validate()
    await model$.validate()
    await flushPromises()

    // Flat group child: element path includes the container, data path not.
    const city$ = model$.find('address.city')!
    expect(city$.dataPath).toBe('city')
    expectElementParity(mounted['address.city'], city$)
    expect(city$.invalid).toBe(true)

    const iban$ = model$.find('billing.iban')!
    expect(iban$.dataPath).toBe('billing.iban')
    expectElementParity(mounted['billing.iban'], iban$)
    expect(iban$.invalid).toBe(false)
  })

  it('agrees with the mounted form on structured conditions targeting nested elements', async () => {
    const schema = defineSchema({
      address: {
        type: 'group',
        schema: {
          city: { type: 'text' },
        },
      },
      shipping: {
        type: 'text',
        conditions: [['address.city', 'not_empty']],
      },
    })

    const { mounted, model$ } = mountAndModel(schema)

    expectElementParity(mounted.shipping, model$.find('shipping'))
    expect(model$.find('shipping')!.available).toBe(false)

    mounted['address.city'].update('Berlin')
    model$.set('city', 'Berlin')
    await nextTick()

    expectElementParity(mounted.shipping, model$.find('shipping'))
    expect(model$.find('shipping')!.available).toBe(true)
  })

  it('cascades availability from unavailable parents to children', async () => {
    const schema = defineSchema({
      toggle: { type: 'checkbox' },
      details: {
        type: 'group',
        nested: true,
        conditions: [['toggle', '==', true]],
        schema: {
          note: { type: 'text', rules: 'required' },
        },
      },
    })

    const { mounted, model$ } = mountAndModel(schema)

    expectElementParity(mounted['details.note'], model$.find('details.note'))
    expect(model$.find('details.note')!.available).toBe(false)

    // Required child of an unavailable group must not fail validation.
    expect(await model$.validate()).toBe(true)

    model$.set('toggle', true)
    mounted.toggle.update(true)
    await nextTick()

    expectElementParity(mounted['details.note'], model$.find('details.note'))
    expect(await model$.validate()).toBe(false)
  })

  it('validates translatable elements per language', async () => {
    const { vueform } = createForm(
      { schema: defineSchema({ noop: { type: 'text' } }) },
      { languages: { en: 'English', de: 'German' } }
    )

    const translated$ = vueform.useModel(
      {
        title: { type: 'text', translate: true, rules: 'required' },
      } as any,
      { title: { en: 'Hello' } }
    )

    expect(translated$.model).toEqual({ title: { en: 'Hello', de: null } })

    expect(await translated$.validate()).toBe(false)
    expect(translated$.errors).toHaveLength(1)

    translated$.set('title.de', 'Hallo')
    expect(await translated$.validate()).toBe(true)
    expect(translated$.errors).toEqual([])
  })

  it('produces identical error messages to the mounted form', async () => {
    const schema = defineSchema({
      username: { type: 'text', rules: 'required|min:3', default: 'ab' },
    })

    const { mounted, model$ } = mountAndModel(schema)

    await mounted.username.validate()
    await model$.validate()
    await flushPromises()

    expect(model$.find('username')!.errors).toEqual(mounted.username.errors)
    expect(model$.find('username')!.errors.length).toBeGreaterThan(0)
  })

  it('uses labels in validation messages like the mounted form', async () => {
    const schema = defineSchema({
      email: { type: 'text', label: 'Email address', rules: 'required' },
      city: { type: 'text', placeholder: 'Your city', rules: 'required' },
      country: {
        type: 'text',
        label: { en_US: 'Country of residence' },
        rules: 'required',
      },
    } as any)

    const { mounted, model$ } = mountAndModel(schema)

    await mounted.form$.validate()
    await model$.validate()
    await flushPromises()

    expect(model$.find('email')!.errors).toEqual(mounted.email.errors)
    expect(model$.find('email')!.errors[0]).toContain('Email address')

    expect(model$.find('city')!.errors).toEqual(mounted.city.errors)
    expect(model$.find('city')!.errors[0]).toContain('Your city')

    expect(model$.find('country')!.errors[0]).toContain('Country of residence')
  })

  it('scopes the virtual context value to the first language', () => {
    const { vueform } = createForm(
      { schema: defineSchema({ _install: { type: 'text' } }) },
      { languages: { en: 'English', de: 'German' } }
    )

    const translated$ = vueform.useModel(
      {
        title: { type: 'text', translate: true },
      } as any,
      { title: { en: 'Hello', de: 'Hallo' } }
    )

    const title$ = translated$.find('title')! as any

    // value is language-scoped (first language by default), model is the full
    // locale object — mirroring the mounted semantics.
    expect(title$.value).toBe('Hello')
    expect(title$.model).toEqual({ en: 'Hello', de: 'Hallo' })

    // Scalar updates write to the active language only.
    title$.update('Hi')
    expect(translated$.model.title).toEqual({ en: 'Hi', de: 'Hallo' })
  })

  it('expands translatable elements with config languages', () => {
    const { vueform } = createForm(
      { schema: defineSchema({ _install: { type: 'text' } }) },
      {
        languages: { en: 'English', de: 'German' },
      }
    )

    const model$ = vueform.useModel(
      {
        title: { type: 'text', translate: true },
      } as any,
      { title: { en: 'Hello' } }
    )

    // Translatable expansion picked up config.languages.
    expect(model$.model).toEqual({ title: { en: 'Hello', de: null } })

    // Value is scoped to the first language key.
    expect((model$.find('title') as any).value).toBe('Hello')
  })

  it('stops engine effects on destroy', async () => {
    const schema = defineSchema({
      subscribe: { type: 'checkbox' },
      frequency: {
        type: 'text',
        rules: 'required',
        conditions: [['subscribe', '==', true]],
      },
    })

    const { model$ } = mountAndModel(schema)

    await model$.validate()
    model$.destroy()

    // Data stays readable after destroy.
    expect(model$.model.subscribe).toBe(false)
    expect(model$.get('frequency')).toBe(null)
  })
})
