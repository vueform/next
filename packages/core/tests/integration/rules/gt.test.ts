import { createForm } from '../../helpers'
import { defineSchema } from '#core'

describe('gt', () => {
  it('should pass when string length is greater than other field', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'ab' },
        b: { type: 'text', rules: 'gt:a', default: 'abc' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })

  it('should fail when string length is equal to other field', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'abc' },
        b: { type: 'text', rules: 'gt:a', default: 'def' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(true)
  })

  it('should fail when string length is less than other field', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'abcde' },
        b: { type: 'text', rules: 'gt:a', default: 'ab' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(true)
  })

  it('should pass when other field is empty and not validated', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text' },
        b: { type: 'text', rules: 'gt:a', default: 'x' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })

  it('should pass after updating to longer string', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'abcde' },
        b: { type: 'text', rules: 'gt:a', default: 'ab' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(true)

    b.update('abcdef')
    await b.validate()
    expect(b.invalid).toBe(false)
  })
})
