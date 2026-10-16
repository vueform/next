import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('digits_between', () => {
  it('should pass for digits with length at minimum', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits_between:2,5', default: '12' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for digits with length between min and max', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits_between:2,5', default: '1234' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for digits with length at maximum', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits_between:2,5', default: '12345' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for digits longer than max', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits_between:2,5', default: '123456' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for digits shorter than min', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits_between:3,5', default: '12' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for non-digit characters', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits_between:2,5', default: '12ab' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for alphabetic string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits_between:2,5', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'digits_between:2,5', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
