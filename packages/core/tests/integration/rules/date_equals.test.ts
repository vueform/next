import { createForm } from '../../helpers'
import { defineSchema } from '#core'

describe('date_equals', () => {
  it('should pass when value equals the date parameter', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'date_equals:2024-01-15',
          default: '2024-01-15',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when value does not equal the date parameter', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'date_equals:2024-01-15',
          default: '2024-01-16',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'date_equals:2024-01-15', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for completely different value', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'date_equals:2024-01-15',
          default: 'not-a-date',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should pass after updating to matching date', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'date_equals:2024-06-01',
          default: '2024-05-01',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    field.update('2024-06-01')
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
