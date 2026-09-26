import { createForm } from '../../helpers'
import { defineSchema } from '#core'

describe('ipv4', () => {
  it('should pass for valid IPv4 address', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv4', default: '192.168.1.1' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for 0.0.0.0', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv4', default: '0.0.0.0' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for 255.255.255.255', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv4', default: '255.255.255.255' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for IPv4 with CIDR', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv4', default: '192.168.1.0/24' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for IPv4 with octet > 255', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv4', default: '256.1.1.1' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for incomplete IPv4', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv4', default: '192.168.1' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for IPv6 address', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv4', default: '::1' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for random string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv4', default: 'not-an-ip' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'ipv4', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
