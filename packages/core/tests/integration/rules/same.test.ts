import { defineSchema } from '#core'

import { createForm } from '../../helpers'

describe('same', () => {
  it('should pass when values match', async () => {
    const { confirm } = createForm({
      schema: defineSchema({
        password: { type: 'text', default: 'secret123' },
        confirm: { type: 'text', rules: 'same:password', default: 'secret123' },
      }),
    })
    await confirm.validate()
    expect(confirm.invalid).toBe(false)
  })

  it('should fail when values differ', async () => {
    const { confirm } = createForm({
      schema: defineSchema({
        password: { type: 'text', default: 'secret123' },
        confirm: { type: 'text', rules: 'same:password', default: 'different' },
      }),
    })
    await confirm.validate()
    expect(confirm.invalid).toBe(true)
  })

  it('should use loose equality', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: '1' },
        b: { type: 'text', rules: 'same:a', default: 1 as any },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })

  it('should pass after updating to matching value', async () => {
    const { confirm } = createForm({
      schema: defineSchema({
        password: { type: 'text', default: 'secret' },
        confirm: { type: 'text', rules: 'same:password', default: 'wrong' },
      }),
    })
    await confirm.validate()
    expect(confirm.invalid).toBe(true)

    confirm.update('secret')
    await confirm.validate()
    expect(confirm.invalid).toBe(false)
  })

  it('should pass when both fields are empty and other is not validated', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text' },
        b: { type: 'text', rules: 'same:a' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })
})
