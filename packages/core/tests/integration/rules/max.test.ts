import { defineSchema } from '#core'

import { createForm } from '../../helpers'

describe('max', () => {
  it('should pass when string length is below max', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'max:5', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass when string length equals max', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'max:5', default: 'abcde' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when string length exceeds max', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'max:5', default: 'abcdef' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should pass for empty string with max:0', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'max:0', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass after updating to shorter string', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'max:3', default: 'abcde' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    field.update('ab')
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
