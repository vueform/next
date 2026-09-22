import { defineSchema } from '@vueform/core'
import { createForm } from '../helpers'

describe('url', () => {
  it('should pass for http URL', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'url', default: 'http://example.com' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for https URL', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'url', default: 'https://example.com' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for URL with path', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'url',
          default: 'https://example.com/path/to/page',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for URL with query string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'url',
          default: 'https://example.com?key=value',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for URL with port', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'url',
          default: 'https://example.com:8080',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for ftp URL', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'url',
          default: 'ftp://files.example.com',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for protocol-relative URL', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'url', default: '//example.com' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for plain string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'url', default: 'not a url' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for missing protocol', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'url', default: 'example.com' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'url', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
