import { defineSchema } from '@vueform/core'
import { createForm } from '../helpers'

describe('distinct', () => {
  it('should pass when all primitive values are unique', async () => {
    const { items } = createForm({
      schema: defineSchema({
        items: {
          type: 'list',
          rules: 'distinct',
          flat: true,
          schema: { text: { type: 'text' } },
          modelValue: ['a', 'b', 'c'],
        },
      }),
    })
    await items.validate()
    expect(items.invalid).toBe(false)
  })

  it('should fail when primitive values have duplicates', async () => {
    const { items } = createForm({
      schema: defineSchema({
        items: {
          type: 'list',
          rules: 'distinct',
          flat: true,
          schema: { text: { type: 'text' } },
          modelValue: ['a', 'b', 'a'],
        },
      }),
    })
    await items.validate()
    expect(items.invalid).toBe(true)
  })

  it('should pass when all object values are unique', async () => {
    const { items } = createForm({
      schema: defineSchema({
        items: {
          type: 'list',
          rules: 'distinct',
          schema: { name: { type: 'text' } },
          modelValue: [{ name: 'a' }, { name: 'b' }],
        },
      }),
    })
    await items.validate()
    expect(items.invalid).toBe(false)
  })

  it('should fail when object values have duplicates', async () => {
    const { items } = createForm({
      schema: defineSchema({
        items: {
          type: 'list',
          rules: 'distinct',
          schema: { name: { type: 'text' } },
          modelValue: [{ name: 'a' }, { name: 'a' }],
        },
      }),
    })
    await items.validate()
    expect(items.invalid).toBe(true)
  })

  it('should pass for empty list', async () => {
    const { items } = createForm({
      schema: defineSchema({
        items: {
          type: 'list',
          rules: 'distinct',
          flat: true,
          schema: { text: { type: 'text' } },
          initial: 0,
        },
      }),
    })
    await items.validate()
    expect(items.invalid).toBe(false)
  })

  it('should pass for single item list', async () => {
    const { items } = createForm({
      schema: defineSchema({
        items: {
          type: 'list',
          rules: 'distinct',
          flat: true,
          schema: { text: { type: 'text' } },
          modelValue: ['only'],
        },
      }),
    })
    await items.validate()
    expect(items.invalid).toBe(false)
  })

  it('should pass on non-array value', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'distinct', default: 'hello' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass after removing a duplicate', async () => {
    const { items } = createForm({
      schema: defineSchema({
        items: {
          type: 'list',
          rules: 'distinct',
          flat: true,
          schema: { text: { type: 'text' } },
          modelValue: ['a', 'b', 'a'],
        },
      }),
    })
    await items.validate()
    expect(items.invalid).toBe(true)

    items.remove(2)
    await items.validate()
    expect(items.invalid).toBe(false)
  })
})
