import { flushPromises } from '@vue/test-utils'
import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'

import { createForm, expectNoA11yViolations } from '../../helpers'

const steppedForm = () =>
  createForm({
    stepped: true,
    schema: defineSchema({
      step1: {
        type: 'group',
        page: 'Step 1',
        schema: { name: { type: 'text', label: 'Name' } },
      },
      step2: {
        type: 'group',
        page: 'Step 2',
        schema: { email: { type: 'text', label: 'Email' } },
      },
    }),
  })

// =============================================================================
// STEP TABLIST SEMANTICS
// =============================================================================
describe('VfSteps a11y', () => {
  it('should render steps as tabs with aria-disabled on not-yet-enabled steps', () => {
    const { form } = steppedForm()

    expect(form.find('[role="tablist"]').exists()).toBe(true)

    const steps = form.findAll('[role="tab"]')
    expect(steps).toHaveLength(2)

    expect(steps[0].attributes('aria-selected')).toBe('true')
    expect(steps[1].attributes('aria-selected')).toBe('false')

    // Sequential progress: the first step is enabled, the second is not yet.
    expect(steps[0].attributes('aria-disabled')).toBe('false')
    expect(steps[1].attributes('aria-disabled')).toBe('true')

    steps.forEach((step) => {
      expect(step.attributes('aria-current')).toBeUndefined()

      const panelId = step.attributes('aria-controls')!
      const panel = form.find(`[id="${panelId}"]`)
      expect(panel.exists()).toBe(true)
      expect(panel.attributes('role')).toBe('tabpanel')
    })
  })

  it('should enable the next step after advancing', async () => {
    const { form, form$ } = steppedForm()

    // next() does not await the inner select(), whose beforeSelect hook
    // resolves a microtask later — flush everything before reading the DOM.
    await form$.steps.next()
    await flushPromises()

    const steps = form.findAll('[role="tab"]')
    expect(steps[1].attributes('aria-disabled')).toBe('false')
    expect(steps[1].attributes('aria-selected')).toBe('true')
  })

  it('should have no axe violations', async () => {
    const { form } = steppedForm()

    await nextTick()
    await expectNoA11yViolations(form.element)
  })
})
