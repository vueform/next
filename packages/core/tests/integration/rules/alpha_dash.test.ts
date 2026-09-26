import { createForm } from '../../helpers'
import { defineSchema } from '#core'

describe('alpha_dash', () => {
  it('should pass for alphabetic string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_dash', default: 'hello' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for string with dashes', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_dash', default: 'hello-world' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for string with underscores', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_dash', default: 'hello_world' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for string with numbers', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_dash', default: 'hello123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for mixed alphanumeric with dashes and underscores', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_dash', default: 'my-var_name123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for unicode letters with dashes', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_dash', default: 'café-latte' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for string with spaces', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_dash', default: 'hello world' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string with special characters', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_dash', default: 'hello@world' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string with dots', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_dash', default: 'hello.world' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha_dash', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
