import { defineSchema } from '@vueform/core'

import { createForm, flushPromises } from '../../helpers'

describe('in_array', () => {
  const listSchema = (fieldDefault: string, rule = 'in_array:tags.*') =>
    defineSchema({
      tags: {
        type: 'list',
        flat: true,
        schema: { tag: { type: 'text' } },
        modelValue: ['vue', 'form'],
      },
      field: { type: 'text', rules: rule, default: fieldDefault },
    })

  it('should pass when the value exists in the referenced array (wildcard syntax)', async () => {
    const { field } = createForm({ schema: listSchema('vue') })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when the value does not exist in the referenced array (wildcard syntax)', async () => {
    const { field } = createForm({ schema: listSchema('react') })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should pass with a plain path param (no trailing wildcard)', async () => {
    const { field } = createForm({
      schema: listSchema('form', 'in_array:tags'),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when the referenced element value is not an array', async () => {
    const { field } = createForm({
      schema: defineSchema({
        other: { type: 'text', default: 'apple' },
        field: { type: 'text', rules: 'in_array:other', default: 'apple' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail when the referenced element does not exist', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'in_array:nonexistent', default: 'test' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should revalidate when the referenced array changes after validation', async () => {
    const { tags, field } = createForm({ schema: listSchema('react') })

    await field.validate()
    expect(field.invalid).toBe(true)

    tags.update(['react', 'vue'])
    await flushPromises()
    expect(field.invalid).toBe(false)
  })
})
