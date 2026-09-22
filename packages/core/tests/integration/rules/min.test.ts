import { defineSchema } from '@vueform/core'
import { createForm } from '../../helpers'

describe('min', () => {
  it('should pass when string length is above min', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'min:3', default: 'abcde' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass when string length equals min', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'min:3', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when string length is below min', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'min:3', default: 'ab' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string with min:1', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'min:1', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should pass after updating to longer string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'min:5', default: 'ab' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    field.update('abcdef')
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
