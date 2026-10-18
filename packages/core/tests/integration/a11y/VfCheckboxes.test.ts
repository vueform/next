import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'

import { createForm, expectNoA11yViolations } from '../../helpers'

const items = { a: 'Alpha', b: 'Beta' }

// =============================================================================
// GROUP CONTAINER
// =============================================================================
describe('VfCheckboxes a11y', () => {
  it('should expose a labelled group whose children are layout-less labelled inputs', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkboxes', label: 'Group label', items },
      }),
    })

    const group = form.find('.vf-choices-group')
    expect(group.attributes('role')).toBe('group')

    const labelledby = group.attributes('aria-labelledby')!
    expect(labelledby).toBeTruthy()

    const label = form.find(`[id="${labelledby}"]`)
    expect(label.exists()).toBe(true)
    expect(label.element.tagName).not.toBe('LABEL')
    expect(label.text()).toBe('Group label')

    expect(group.attributes('aria-label')).toBeUndefined()

    const inputs = form.findAll('input[type="checkbox"]')
    expect(inputs).toHaveLength(2)

    inputs.forEach((input) => {
      const id = input.attributes('id')!
      expect(form.find(`label[for="${id}"]`).exists()).toBe(true)
      expect(input.attributes('aria-describedby')).toBeUndefined()
    })
  })

  it('should fall back to aria-label when the group has no label', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'checkboxes', items },
      }),
    })

    const group = form.find('.vf-choices-group')
    expect(group.attributes('aria-labelledby')).toBeUndefined()
    expect(group.attributes('aria-label')).toBeTruthy()
  })

  it('should carry required and error state on the group container', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkboxes',
          label: 'Group label',
          items,
          rules: 'required',
        },
      }),
    })

    const group = form.find('.vf-choices-group')
    expect(group.attributes('aria-required')).toBe('true')
    expect(group.attributes('aria-invalid')).toBeUndefined()

    await el.validate()
    await nextTick()

    expect(group.attributes('aria-invalid')).toBe('true')

    const describedby = group.attributes('aria-describedby')!.split(' ')
    const errorId = describedby[describedby.length - 1]
    const error = form.find(`[id="${errorId}"]`)
    expect(error.exists()).toBe(true)
    expect(error.attributes('role')).toBe('alert')
  })

  it('should have no axe violations', async () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkboxes',
          label: 'Group label',
          help: 'The help text',
          items,
        },
      }),
    })

    await nextTick()
    await expectNoA11yViolations(form.element)
  })
})
