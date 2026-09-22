import { defineSchema } from '@vueform/core'
import { createForm } from '../helpers'

describe('digits', () => {
  it('should pass for digits with exact length', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits:4', default: '1234' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for single digit', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits:1', default: '5' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when length does not match', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits:4', default: '123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail when length exceeds', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits:4', default: '12345' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for non-digit characters', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits:4', default: '12ab' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for floating point', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits:4', default: '12.4' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for negative number', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits:4', default: '-123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits:4', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
