import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('not_regex', () => {
  it('should pass when the value does not match the pattern', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'not_regex:/^[0-9]+$/', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })

  it('should fail when the value matches the pattern', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'not_regex:/^[0-9]+$/', default: '123' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should respect pattern flags', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'not_regex:/^abc$/i', default: 'ABC' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)
  })

  it('should fail closed on a malformed pattern', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { field } = createForm({
      schema: defineSchema({
        // Malformed param: the value may never pass because of a bad pattern.
        field: { type: 'text', rules: 'not_regex:^[0-9]+$', default: 'abc' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(true)

    warnSpy.mockRestore()
  })
})
