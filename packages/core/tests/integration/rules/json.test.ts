import { defineSchema } from '@vueform/core'
import { createForm } from '../../helpers'

describe('json', () => {
  it('should pass for valid JSON object', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'json',
          default: '{"key":"value"}',
          expressions: [],
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for valid JSON array', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'json', default: '[1,2,3]' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for JSON string value', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'json', default: '"hello"' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for JSON number', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'json', default: '42' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for JSON boolean', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'json', default: 'true' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for JSON null', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'json', default: 'null' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for invalid JSON', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'json', default: '{invalid}' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for plain string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'json', default: 'hello' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'json', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for single-quoted JSON', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'json', default: "{'key':'value'}" },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
