import { defineSchema } from '@vueform/core'
import * as rules from '@vueform/core/rules'

import { createForm } from '../../helpers'

describe('regex', () => {
  it('should pass when the value matches the pattern', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'regex:/^[0-9]+$/', default: '12345' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when the value does not match the pattern', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'regex:/^[0-9]+$/', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should respect pattern flags', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'regex:/^abc$/i', default: 'ABC' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should support the pattern= prefix', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'regex:pattern=/^[a-z]+$/',
          default: 'abc',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should keep colons and commas inside the pattern', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: 'regex:/^[0-9]{2,3}:[0-9]{2}$/',
          default: '123:45',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail closed on a malformed pattern', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { field } = createForm({
      schema: defineSchema({
        // No `/pattern/flags` delimiters — invalid param.
        field: { type: 'text', rules: 'regex:^[0-9]+$', default: '123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    warnSpy.mockRestore()
  })

  it('should work as an imported rule definition', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: {
          type: 'text',
          rules: [rules.regex('/^[0-9]+$/')],
          default: 'abc',
        },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
    expect(field.errors[0]).toContain('format is invalid')
  })
})
