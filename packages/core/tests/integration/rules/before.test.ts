import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

const iso = (offsetDays: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

describe('before', () => {
  it('should pass when the date is before the given date', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'before:2020-01-01',
          default: '2019-06-15',
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
          rules: 'before:2020-01-01',
          default: '2021-01-01',
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
          rules: 'before:2020-01-01',
          default: '2020-01-01',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should support the yesterday keyword', async () => {
    const { past, future } = createForm({
      schema: defineSchema({
        past: { type: 'text', rules: 'before:yesterday', default: iso(-10) },
        future: { type: 'text', rules: 'before:yesterday', default: iso(10) },
      }),
    })
    await past.validate()
    await future.validate()
    expect(past.invalid).toBe(false)
    expect(future.invalid).toBe(true)
  })

  it('should compare against another element by path', async () => {
    const { earlier, later } = createForm({
      schema: defineSchema({
        end: { type: 'text', default: '2020-06-01' },
        earlier: { type: 'text', rules: 'before:end', default: '2020-05-01' },
        later: { type: 'text', rules: 'before:end', default: '2020-07-01' },
      }),
    })
    await earlier.validate()
    await later.validate()
    expect(earlier.invalid).toBe(false)
    expect(later.invalid).toBe(true)
  })
})
