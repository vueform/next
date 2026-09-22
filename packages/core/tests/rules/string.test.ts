import { defineSchema } from '@vueform/core'
import { createForm } from '../helpers'

describe('string', () => {
  it('should pass for a string value', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'string', default: 'hello' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'string', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for numeric string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'string', default: '123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for a number', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'string', default: 123 as any },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for a boolean', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'checkbox', rules: 'string', default: true },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for an array', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'checkboxes', rules: 'string', default: [] },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for null', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'string', default: null },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
