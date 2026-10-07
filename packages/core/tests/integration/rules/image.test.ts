import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('image', () => {
  it('should fail on a non-file element type', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'image', default: 'hello' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty text field', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'image' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
