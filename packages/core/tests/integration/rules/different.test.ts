import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('different', () => {
  it('should pass when values differ', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'hello' },
        b: { type: 'text', rules: 'different:a', default: 'world' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })

  it('should fail when values are the same', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'same' },
        b: { type: 'text', rules: 'different:a', default: 'same' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(true)
  })

  it('should use loose inequality', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: '1' },
        b: { type: 'text', rules: 'different:a', default: 1 as any },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(true)
  })

  it('should pass after updating to different value', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: 'hello' },
        b: { type: 'text', rules: 'different:a', default: 'hello' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(true)

    b.update('world')
    await b.validate()
    expect(b.invalid).toBe(false)
  })

  it('should pass when other field is empty and not validated', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text' },
        b: { type: 'text', rules: 'different:a', default: '' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })
})
