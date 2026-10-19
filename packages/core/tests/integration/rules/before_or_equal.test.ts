import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('before_or_equal', () => {
  it('should pass when the date is before the given date', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'before_or_equal:2020-01-01',
          default: '2019-01-01',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass when the date equals the given date', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'before_or_equal:2020-01-01',
          default: '2020-01-01',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when the date is after the given date', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'before_or_equal:2020-01-01',
          default: '2020-01-02',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
