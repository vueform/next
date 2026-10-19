import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('date', () => {
  it('should pass for a valid date string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'date', default: '2021-05-15' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for a valid datetime string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'date',
          default: '2021-05-15T10:30:00.000Z',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for a non-date string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'date', default: 'not-a-date' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
