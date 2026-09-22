import { defineSchema, createRule } from '@vueform/core'
import { createForm } from '../helpers'

describe('in_array', () => {
  it('should fail when referenced element value is not an array', async () => {
    const inArrayRule = createRule(
      'in_array_custom',
      (value, { getOther$ }) => {
        const other$ = getOther$('other')
        return Array.isArray(other$?.value) && other$.value.includes(value)
      }
    )

    const { field } = createForm({
      schema: defineSchema({
        other: { type: 'text', default: 'apple' },
        field: { type: 'text', rules: [inArrayRule], default: 'apple' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail when referenced element does not exist', async () => {
    const inArrayRule = createRule(
      'in_array_custom',
      (value, { getOther$ }) => {
        const other$ = getOther$('nonexistent')
        return Array.isArray(other$?.value) && other$.value.includes(value)
      }
    )

    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: [inArrayRule], default: 'test' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
