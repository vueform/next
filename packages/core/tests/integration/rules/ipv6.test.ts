import { defineSchema } from '@vueform/core'
import { createForm } from '../../helpers'

describe('ipv6', () => {
  it('should pass for full IPv6 address', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'ipv6',
          default: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for shortened IPv6 (::1)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv6', default: '::1' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for :: (all zeros)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv6', default: '::' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for IPv6 with CIDR', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv6', default: '2001:db8::/32' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for IPv4 address', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv6', default: '192.168.1.1' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for random string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv6', default: 'not-an-ip' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv6', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
