import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('integer', () => {
  it('should pass for positive integer string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'integer', default: '42' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for zero', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'integer', default: '0' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for negative integer string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'integer', default: '-5' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for float string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'integer', default: '3.14' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for non-numeric string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'integer', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'integer', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string with spaces', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'integer', default: '4 2' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
