import { defineSchema, defineSlot } from '@vueform/core'
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

// =============================================================================
// CHOICE TEXT LABELLING
// =============================================================================
describe('VfRadio a11y', () => {
  it('should label the input with its choice text, falling back to a sr-only label', () => {
    const { form } = createForm({
      schema: defineSchema({
        withText: { type: 'radio', text: 'Pick me' },
        bare: { type: 'radio' },
      }),
    })

    const inputs = form.findAll('input[type="radio"]')

    const textId = inputs[0].attributes('id')!
    const textLabel = form.find(`label[for="${textId}"]`)
    expect(textLabel.exists()).toBe(true)
    expect(textLabel.text()).toBe('Pick me')
    expect(textLabel.classes()).not.toContain('sr-only')

    const bareId = inputs[1].attributes('id')!
    const bareLabel = form.find(`label[for="${bareId}"]`)
    expect(bareLabel.exists()).toBe(true)
    expect(bareLabel.classes()).toContain('sr-only')
    expect(bareLabel.text().length).toBeGreaterThan(0)
  })

  // ===========================================================================
  // SLOT CONTRACT (a11yBindings)
  // ===========================================================================
  describe('default slot', () => {
    it('should expose part-keyed a11yBindings whose input bag lands on a custom input', async () => {
      const slot = defineSlot('VfRadio.default', {
        props: ['a11yBindings', 'id', 'inputName'],
        template:
          '<input type="radio" class="slot-radio" :id="id" :name="inputName" v-bind="a11yBindings.input" />',
      })

      const { form, el } = createForm({
        schema: defineSchema({
          el: {
            type: 'radio',
            label: 'The label',
            help: 'The help text',
            rules: 'required',
            slots: { default: slot },
          },
        }),
      })

      await nextTick()

      const input = form.find('.slot-radio')
      expect(input.exists()).toBe(true)

      const id = input.attributes('id')!

      // The help relationship from a11yBindings.input lands on the slot input.
      expect(input.attributes('aria-describedby')!.split(' ')).toContain(
        `${id}__help`
      )
      expect(input.attributes('aria-required')).toBe('true')
      expect(input.attributes('aria-invalid')).toBeUndefined()

      // Error state flows through the same bag after validation.
      await el.validate()
      await nextTick()

      expect(input.attributes('aria-invalid')).toBe('true')
      expect(input.attributes('aria-describedby')!.split(' ')).toContain(
        `${id}__error`
      )
    })
  })
})
