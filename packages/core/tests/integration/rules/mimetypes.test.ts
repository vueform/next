import { createForm } from '../../helpers'
import { defineSchema } from '#core'

describe('mimetypes', () => {
  it('should fail on a non-file element type', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'mimetypes:image/jpeg',
          default: 'hello',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty text field', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'mimetypes:image/jpeg' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
