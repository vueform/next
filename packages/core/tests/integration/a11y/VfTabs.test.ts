import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'

import { createForm, expectNoA11yViolations } from '../../helpers'

const tabbedForm = () =>
  createForm({
    tabbed: true,
    schema: defineSchema({
      tab1: {
        type: 'group',
        page: 'Tab 1',
        schema: { name: { type: 'text', label: 'Name' } },
      },
      tab2: {
        type: 'group',
        page: 'Tab 2',
        schema: { email: { type: 'text', label: 'Email' } },
      },
    }),
  })

// =============================================================================
// TABLIST SEMANTICS
// =============================================================================
describe('VfTabs a11y', () => {
  it('should render a tablist of tabs controlling existing tabpanels', () => {
    const { form } = tabbedForm()

    expect(form.find('[role="tablist"]').exists()).toBe(true)

    const tabs = form.findAll('[role="tab"]')
    expect(tabs).toHaveLength(2)

    expect(tabs[0].attributes('aria-selected')).toBe('true')
    expect(tabs[1].attributes('aria-selected')).toBe('false')

    tabs.forEach((tab) => {
      // Tabs express selection with aria-selected, never aria-current.
      expect(tab.attributes('aria-current')).toBeUndefined()

      const panelId = tab.attributes('aria-controls')!
      expect(panelId).toBeTruthy()

      const panel = form.find(`[id="${panelId}"]`)
      expect(panel.exists()).toBe(true)
      expect(panel.attributes('role')).toBe('tabpanel')
      expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))
    })
  })

  it('should move aria-selected when another tab is activated', async () => {
    const { form, form$ } = tabbedForm()

    await form$.tabs.select('tab2')
    await nextTick()

    const tabs = form.findAll('[role="tab"]')
    expect(tabs[0].attributes('aria-selected')).toBe('false')
    expect(tabs[1].attributes('aria-selected')).toBe('true')
  })

  it('should have no axe violations', async () => {
    const { form } = tabbedForm()

    await nextTick()
    await expectNoA11yViolations(form.element)
  })
})
