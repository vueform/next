import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('captcha', () => {
  it('should pass when the element has no verify method', async () => {
    const { field } = createForm({
      schema: defineSchema({
        field: { type: 'text', rules: 'captcha', default: 'anything' },
      }),
    })
    await field.validate()
    expect(field.invalid).toBe(false)
  })
})
