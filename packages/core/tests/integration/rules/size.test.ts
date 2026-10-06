import { defineSchema } from '#core'

import { createForm } from '../../helpers'

describe('size', () => {
  it('should pass when string length equals size', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:5', default: 'abcde' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when string length is less than size', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:5', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail when string length is greater than size', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:5', default: 'abcdefg' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should pass for empty string with size:0', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:0', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass after updating to matching length', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'size:3', default: 'ab' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    field.update('abc')
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
