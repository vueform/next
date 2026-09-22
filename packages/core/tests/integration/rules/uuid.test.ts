import { defineSchema } from '@vueform/core'
import { createForm } from '../../helpers'

describe('uuid', () => {
  it('should pass for valid UUID v4', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'uuid',
          default: '550e8400-e29b-41d4-a716-446655440000',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for uppercase UUID', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'uuid',
          default: '550E8400-E29B-41D4-A716-446655440000',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for mixed case UUID', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'uuid',
          default: '550e8400-E29B-41d4-A716-446655440000',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for invalid format (missing dashes)', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'uuid',
          default: '550e8400e29b41d4a716446655440000',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for too short', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'uuid', default: '550e8400-e29b-41d4' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for random string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'uuid', default: 'not-a-uuid' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'uuid', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for UUID with invalid characters', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'uuid',
          default: '550g8400-e29b-41d4-a716-446655440000',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
