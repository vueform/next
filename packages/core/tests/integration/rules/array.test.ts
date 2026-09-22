import { defineSchema } from '@vueform/core'
import { createForm } from '../../helpers'

describe('array', () => {
  it('should pass for an empty array', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'array', default: [] as any },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for a non-empty array', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'array', default: [1, 2, 3] as any },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for a string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'array', default: 'hello' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for a number', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'array', default: 123 as any },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for an object', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'array', default: {} as any },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for null', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'array', default: null as any },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
