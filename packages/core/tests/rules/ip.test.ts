import { defineSchema } from '@vueform/core'
import { createForm } from '../helpers'

describe('ip', () => {
  it('should pass for valid IPv4 address', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ip', default: '192.168.1.1' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for valid IPv6 address', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'ip',
          default: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for shortened IPv6 address', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ip', default: '::1' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for random string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ip', default: 'not-an-ip' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ip', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for incomplete IPv4', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ip', default: '192.168.1' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
