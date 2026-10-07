import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('lt', () => {
  it('should pass when string length is less than other field', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'abcde' },
        b: { type: 'text', rules: 'lt:a', default: 'ab' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })

  it('should fail when string length equals other field', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'abc' },
        b: { type: 'text', rules: 'lt:a', default: 'def' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(true)
  })

  it('should fail when string length is greater than other field', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'ab' },
        b: { type: 'text', rules: 'lt:a', default: 'abcde' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(true)
  })

  it('should pass after updating to shorter string', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'abc' },
        b: { type: 'text', rules: 'lt:a', default: 'abcde' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(true)

    b.update('ab')
    await b.validate()
    expect(b.invalid).toBe(false)
  })
})
