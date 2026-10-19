import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

const iso = (offsetDays: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

describe('after_or_equal', () => {
  it('should pass when the date is after the given date', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'after_or_equal:2020-01-01',
          default: '2021-01-01',
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
          rules: 'after_or_equal:2020-01-01',
          default: '2020-01-01',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when the date is before the given date', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'after_or_equal:2020-01-01',
          default: '2019-12-31',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should support the tomorrow keyword', async () => {
    const { future, past } = createForm({
      schema: defineSchema({
        future: {
          type: 'text',
          rules: 'after_or_equal:tomorrow',
          default: iso(10),
        },
        past: {
          type: 'text',
          rules: 'after_or_equal:tomorrow',
          default: iso(-10),
        },
      }),
    })
    await future.validate()
    await past.validate()
    expect(future.invalid).toBe(false)
    expect(past.invalid).toBe(true)
  })
})
