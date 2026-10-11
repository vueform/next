import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('alpha', () => {
  it('should pass for alphabetic string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha', default: 'hello' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for uppercase letters', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha', default: 'HELLO' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for mixed case letters', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha', default: 'HeLLo' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for unicode letters', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha', default: 'café' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for string with numbers', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha', default: 'hello123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string with spaces', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha', default: 'hello world' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string with special characters', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha', default: 'hello!' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for string with dashes', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha', default: 'hello-world' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'alpha', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
