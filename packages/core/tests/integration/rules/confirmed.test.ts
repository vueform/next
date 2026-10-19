import { defineSchema } from '@vueform/core'

import { createForm, flushPromises } from '../../helpers'

describe('confirmed', () => {
  it('should pass when the _confirmed field matches', async () => {
    const { password } = createForm({
      schema: defineSchema({
        password: { type: 'text', rules: 'confirmed', default: 'secret' },
        password_confirmed: { type: 'text', default: 'secret' },
      }),
    })
    await password.validate()
    expect(password.invalid).toBe(false)
  })

  it('should fail when the _confirmed field differs', async () => {
    const { password } = createForm({
      schema: defineSchema({
        password: { type: 'text', rules: 'confirmed', default: 'secret' },
        password_confirmed: { type: 'text', default: 'different' },
      }),
    })
    await password.validate()
    expect(password.invalid).toBe(true)
  })

  it('should fail when the _confirmed field does not exist', async () => {
    const { password } = createForm({
      schema: defineSchema({
        password: { type: 'text', rules: 'confirmed', default: 'secret' },
      }),
    })
    await password.validate()
    expect(password.invalid).toBe(true)
  })

  it('should use loose equality like same', async () => {
    const { amount } = createForm({
      schema: defineSchema({
        amount: { type: 'text', rules: 'confirmed', default: 1 as any },
        amount_confirmed: { type: 'text', default: '1' },
      }),
    })
    await amount.validate()
    expect(amount.invalid).toBe(false)
  })

  it('should pass after the confirmation is corrected', async () => {
    const { password, password_confirmed } = createForm({
      schema: defineSchema({
        password: { type: 'text', rules: 'confirmed', default: 'secret' },
        password_confirmed: { type: 'text', default: 'wrong' },
      }),
    })
    await password.validate()
    expect(password.invalid).toBe(true)

    password_confirmed.update('secret')
    await flushPromises()
    await password.validate()
    expect(password.invalid).toBe(false)
  })
})
