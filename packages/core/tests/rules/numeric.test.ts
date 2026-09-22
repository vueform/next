import { defineSchema } from '@vueform/core'
import { createForm } from '../helpers'

describe('numeric', () => {
  it('should pass for integer string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'numeric', default: '42' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for float string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'numeric', default: '3.14' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for negative number string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'numeric', default: '-7' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for zero', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'numeric', default: '0' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for non-numeric string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'numeric', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for hex string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'numeric', default: '0xFF' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string with spaces', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'numeric', default: '4 2' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'numeric', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for mixed alpha-numeric', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'numeric', default: '12abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
