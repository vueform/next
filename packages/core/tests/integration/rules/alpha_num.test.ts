import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('alpha_num', () => {
  it('should pass for alphabetic string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_num', default: 'hello' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for numeric string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_num', default: '12345' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for alphanumeric string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_num', default: 'hello123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for unicode letters with digits', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_num', default: 'café123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for string with spaces', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_num', default: 'hello 123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string with dashes', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_num', default: 'hello-123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string with special characters', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_num', default: 'hello@123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_num', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
