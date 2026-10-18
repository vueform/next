import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

// =============================================================================
// AUTOCOMPLETE / INPUTMODE
// =============================================================================
describe('VfTextarea a11y', () => {
  it('should derive autocomplete from a token-valid name, skip invalid ones, and let the prop win', () => {
    const { form } = createForm({
      schema: defineSchema({
        email: { type: 'textarea' },
        foo_bar: { type: 'textarea' },
        named: { type: 'textarea', autocomplete: 'given-name' },
      }),
    })

    const areas = form.findAll('textarea')

    // `email` is a valid HTML autofill token → used as the default.
    expect(areas[0].attributes('autocomplete')).toBe('email')

    // `foo_bar` is not a token → no autocomplete attribute at all.
    expect(areas[1].attributes('autocomplete')).toBeUndefined()

    // An explicit prop always wins.
    expect(areas[2].attributes('autocomplete')).toBe('given-name')
  })

  it('should render the inputmode prop and omit it by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        amount: { type: 'textarea', inputmode: 'numeric' },
        plain: { type: 'textarea' },
      }),
    })

    const areas = form.findAll('textarea')
    expect(areas[0].attributes('inputmode')).toBe('numeric')
    expect(areas[1].attributes('inputmode')).toBeUndefined()
  })
})
