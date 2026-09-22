import { defineSchema } from '@vueform/core'
import { createForm } from '../../helpers'

describe('between', () => {
  it('should pass when string length is within range', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'between:2,5', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass when string length equals min', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'between:3,5', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass when string length equals max', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'between:2,5', default: 'abcde' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when string length is below min', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'between:3,5', default: 'ab' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail when string length is above max', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'between:2,5', default: 'abcdef' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should pass after updating to value within range', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'between:2,5', default: 'a' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    field.update('abc')
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
