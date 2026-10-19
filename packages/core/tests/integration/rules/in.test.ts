import { defineSchema } from '@vueform/core'
import * as rules from '@vueform/core/rules'

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

  it("should use the in rule's own message, not not_in's", async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'in:foo,bar', default: 'qux' },
      }),
    })
    await field.validate()
    // `rule_in_error` and `rule_not_in_error` share the same English text, so
    // assert the tag resolves (no default fallback) rather than exact wording.
    expect(field.errors[0]).toContain('is invalid')
    expect(field.errors[0]).not.toContain('Invalid field')
  })

  it('should resolve the same message when used as an imported definition', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: [rules.in('foo', 'bar')],
          default: 'qux',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
    expect(field.errors[0]).toContain('is invalid')
    expect(field.errors[0]).not.toContain('Invalid field')
  })

  it('should allow overriding the message via ruleMessages', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'in:foo,bar',
          default: 'qux',
          ruleMessages: { in: 'Pick foo or bar.' },
        },
      }),
    })
    await field.validate()
    expect(field.errors).toContain('Pick foo or bar.')
  })
})
