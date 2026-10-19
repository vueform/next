import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('size', () => {
  it('should pass when string length equals size', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:5', default: 'abcde' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when string length is less than size', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:5', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail when string length is greater than size', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:5', default: 'abcdefg' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should pass for empty string with size:0', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:0', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should use the numeric message for number values', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:5', default: 4 as any },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
    expect(field.errors[0]).toContain('must be 5')
    expect(field.errors[0]).not.toContain('Invalid field')
  })

  it('should treat a number value by magnitude, not length', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:5', default: 5 as any },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass after updating to matching length', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:3', default: 'ab' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    field.update('abc')
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
