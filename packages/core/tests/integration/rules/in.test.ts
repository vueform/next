import { defineSchema } from '@vueform/core'
import { createForm } from '../../helpers'

describe('in', () => {
  it('should pass when value is in the list', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'in:foo,bar,baz', default: 'foo' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for another value in the list', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'in:foo,bar,baz', default: 'baz' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when value is not in the list', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'in:foo,bar,baz', default: 'qux' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for empty string when not in list', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'in:foo,bar,baz', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should be case sensitive', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'in:foo,bar,baz', default: 'Foo' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should pass after updating to a value in the list', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'in:apple,banana', default: 'orange' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    field.update('apple')
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
