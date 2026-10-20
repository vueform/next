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
  // SLOT CONTRACT (bindings)
  // ===========================================================================
  describe('default slot', () => {
    it('should expose the wrapper bindings bag that lands on a custom wrapper', async () => {
      const slot = defineSlot('VfRadio.default', {
        props: ['bindings', 'id', 'inputName'],
        template:
          '<div class="slot-wrapper" v-bind="bindings">' +
          '<input type="radio" class="slot-radio" :id="id" :name="inputName" />' +
          '</div>',
      })

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'radio',
            label: 'The label',
            align: 'right',
            aligned: true,
            slots: { default: slot },
          },
        }),
      })

      await nextTick()

      const wrapper = form.find('.slot-wrapper')
      expect(wrapper.exists()).toBe(true)

      // The wrapper bag carries the alignment modifiers of the slot's own
      // part. Classes are NOT part of binding bags — slot consumers read them
      // via `context.classes` when they want them.
      expect(wrapper.classes()).not.toContain('vf-choice-wrapper')
      expect(wrapper.attributes('data-align')).toBe('right')
      expect(wrapper.attributes('data-aligned')).toBe('')
    })
  })
})
