import { createForm } from '../../helpers'
import { defineSchema } from '#core'

describe('filled', () => {
  it('should pass for non-empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'filled', default: 'hello' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail for empty string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'filled' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should pass after updating from empty to filled', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'filled' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    field.update('now filled')
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail after updating from filled to empty', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'filled', default: 'content' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)

    field.update('')
    await field.validate()
    expect(field.invalid).toBe(true)
  })
})
