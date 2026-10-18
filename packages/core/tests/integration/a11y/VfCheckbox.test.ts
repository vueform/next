import { defineSchema } from '@vueform/core'

import { createForm, expectNoA11yViolations } from '../../helpers'

// =============================================================================
// CHOICE TEXT LABELLING
// =============================================================================
describe('VfCheckbox a11y', () => {
  it('should label the input with its choice text', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox', text: 'I agree' },
      }),
    })

    const input = form.find('input[type="checkbox"]')
    const id = input.attributes('id')!

    const label = form.find(`label[for="${id}"]`)
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('I agree')
    expect(label.classes()).not.toContain('sr-only')
  })

  it('should fall back to a screen-reader-only label without text', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkbox' },
      }),
    })

    const input = form.find('input[type="checkbox"]')
    const id = input.attributes('id')!

    const label = form.find(`label[for="${id}"]`)
    expect(label.exists()).toBe(true)
    expect(label.classes()).toContain('sr-only')
    expect(label.text().length).toBeGreaterThan(0)
  })

  it('should have no axe violations', async () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox',
          text: 'I agree',
          label: 'The label',
          help: 'The help text',
        },
      }),
    })

    await expectNoA11yViolations(form.element)
  })
})
