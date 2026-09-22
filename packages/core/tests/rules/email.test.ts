import { defineSchema } from '@vueform/core'
import { createForm } from '../helpers'

describe('email', () => {
  it('should pass for valid email', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'email', default: 'test@example.com' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for email with subdomain', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'email',
          default: 'user@mail.example.com',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for email with plus sign', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'email',
          default: 'user+tag@example.com',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for email with dots in local part', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'email',
          default: 'first.last@example.com',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for string without @', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'email', default: 'notanemail' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string without domain', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'email', default: 'user@' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string without local part', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'email', default: '@example.com' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string with spaces', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'email', default: 'user @example.com' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'email', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should pass after updating to valid email', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'email', default: 'invalid' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    field.update('valid@example.com')
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
