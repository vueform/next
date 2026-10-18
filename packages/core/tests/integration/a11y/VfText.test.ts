import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

// =============================================================================
// AUTOCOMPLETE / INPUTMODE
// =============================================================================
describe('VfText a11y', () => {
  describe('autocomplete', () => {
    it('should derive autocomplete from a token-valid name, skip invalid ones, and let the prop win', () => {
      const { form } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
          foo_bar: { type: 'text' },
          named: { type: 'text', autocomplete: 'given-name' },
        }),
      })

      const inputs = form.findAll('input[type="text"]')

      // `email` is a valid HTML autofill token → used as the default.
      expect(inputs[0].attributes('autocomplete')).toBe('email')

      // `foo_bar` is not a token → no autocomplete attribute at all.
      expect(inputs[1].attributes('autocomplete')).toBeUndefined()

      // An explicit prop always wins.
      expect(inputs[2].attributes('autocomplete')).toBe('given-name')
    })

    it('should let an explicit autocomplete prop override a token-valid name', () => {
      const { form } = createForm({
        schema: defineSchema({
          email: { type: 'text', autocomplete: 'given-name' },
        }),
      })

      expect(form.find('input[type="text"]').attributes('autocomplete')).toBe(
        'given-name'
      )
    })
  })

  describe('inputmode', () => {
    it('should render the inputmode prop and omit it by default', () => {
      const { form } = createForm({
        schema: defineSchema({
          amount: { type: 'text', inputmode: 'numeric' },
          plain: { type: 'text' },
        }),
      })

      const inputs = form.findAll('input[type="text"]')
      expect(inputs[0].attributes('inputmode')).toBe('numeric')
      expect(inputs[1].attributes('inputmode')).toBeUndefined()
    })
  })

  // ===========================================================================
  // TRANSLATABLE (makeTAria)
  // ===========================================================================
  describe('translatable', () => {
    it('should describe the input with the editing-language live region and set lang', async () => {
      const { form } = createForm({
        languages: { en: 'English', de: 'German' },
        schema: defineSchema({
          el: { type: 'text', translate: true, label: 'The label' },
        }),
      })

      await nextTick()

      const input = form.find('input[type="text"]')
      const id = input.attributes('id')!

      // The language live region exists under the derived id.
      const region = form.find(`[id="${id}__language"]`)
      expect(region.exists()).toBe(true)
      expect(region.attributes('aria-live')).toBe('polite')

      // aria-describedby references it, and the input carries lang.
      const describedby = input.attributes('aria-describedby')!.split(' ')
      expect(describedby).toContain(`${id}__language`)
      expect(input.attributes('lang')).toBe('en')
    })

    it('should not reference a language region on non-translatable inputs', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'The label', help: 'The help text' },
        }),
      })

      const input = form.find('input[type="text"]')
      const id = input.attributes('id')!
      const describedby = input.attributes('aria-describedby')!.split(' ')

      expect(describedby).toEqual([`${id}__help`])
      expect(input.attributes('lang')).toBeUndefined()
    })
  })
})
