import { defineSchema } from '@vueform/core'
import { createForm } from '../helpers'

describe('not_in', () => {
  it('should pass when value is not in the list', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'not_in:foo,bar,baz', default: 'qux' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass for empty string when not in list', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'not_in:foo,bar,baz', default: '' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when value is in the list', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'not_in:foo,bar,baz', default: 'foo' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail for another value in the list', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'not_in:foo,bar,baz', default: 'bar' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should be case sensitive', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'not_in:foo,bar,baz', default: 'Foo' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should pass after updating away from listed value', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'not_in:blocked,banned',
          default: 'blocked',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    field.update('allowed')
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
