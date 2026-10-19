import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

// Local date string offset by whole days — keeps keyword comparisons far from
// any timezone boundary.
const iso = (offsetDays: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

describe('after', () => {
  it('should pass when the date is after the given date', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'after:2020-01-01',
          default: '2021-06-15',
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
          rules: 'after:2020-01-01',
          default: '2019-01-01',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail when the date equals the given date', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'after:2020-01-01',
          default: '2020-01-01',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should support the today keyword', async () => {
    const { future, past } = createForm({
      schema: defineSchema({
        future: { type: 'text', rules: 'after:today', default: iso(10) },
        past: { type: 'text', rules: 'after:today', default: iso(-10) },
      }),
    })
    await future.validate()
    await past.validate()
    expect(future.invalid).toBe(false)
    expect(past.invalid).toBe(true)
  })

  it('should compare against another element by path', async () => {
    const { later, earlier } = createForm({
      schema: defineSchema({
        start: { type: 'text', default: '2020-06-01' },
        later: { type: 'text', rules: 'after:start', default: '2020-07-01' },
        earlier: { type: 'text', rules: 'after:start', default: '2020-05-01' },
      }),
    })
    await later.validate()
    await earlier.validate()
    expect(later.invalid).toBe(false)
    expect(earlier.invalid).toBe(true)
  })
})
