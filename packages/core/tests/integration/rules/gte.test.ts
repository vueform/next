import { defineSchema } from '@vueform/core'
import { createForm } from '../../helpers'

describe('gte', () => {
  it('should pass when string length is greater than other field', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'ab' },
        b: { type: 'text', rules: 'gte:a', default: 'abc' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })

  it('should pass when string length equals other field', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'abc' },
        b: { type: 'text', rules: 'gte:a', default: 'def' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })

  it('should fail when string length is less than other field', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'abcde' },
        b: { type: 'text', rules: 'gte:a', default: 'ab' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(true)
  })

  it('should pass when other field is empty and not validated', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text' },
        b: { type: 'text', rules: 'gte:a', default: 'x' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })

  it('should pass after updating to equal length string', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'abc' },
        b: { type: 'text', rules: 'gte:a', default: 'x' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(true)

    b.update('xyz')
    await b.validate()
    expect(b.invalid).toBe(false)
  })
})
