import { defineSchema } from '@vueform/core'
import { createForm } from '../../helpers'

describe('nullable', () => {
  it('should always pass (returns true)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'nullable', default: 'anything' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'nullable' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should skip subsequent rules when value is empty', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'nullable|email' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should still validate subsequent rules when value is present', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'nullable|email',
          default: 'not-an-email',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should allow valid subsequent rules when value is present', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'nullable|email',
          default: 'test@example.com',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
