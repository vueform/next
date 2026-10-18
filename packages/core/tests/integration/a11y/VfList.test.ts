import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'

import { createForm, expectNoA11yViolations } from '../../helpers'

// Built dynamically, so it stays a plain object (defineSchema's exact-typed
// inference needs literals).
const listSchema = (extra: Record<string, any> = {}) => ({
  list: {
    type: 'list',
    flat: true,
    modelValue: ['foo', 'bar'],
    schema: { text: { type: 'text' } },
    ...extra,
  },
})

// =============================================================================
// LIST SEMANTICS
// =============================================================================
describe('VfList a11y', () => {
  it('should expose list/listitem roles and index-based control labels', async () => {
    const { form } = createForm({
      schema: listSchema({ sort: true }),
    })

    await nextTick()

    expect(form.find('.vf-list-items').attributes('role')).toBe('list')

    const items = form.findAll('.vf-list-item')
    expect(items).toHaveLength(2)
    items.forEach((item) => {
      expect(item.attributes('role')).toBe('listitem')
    })

    // 1-based index labels from the en_US locale.
    const sortButtons = form.findAll('.vf-list-sort')
    expect(sortButtons).toHaveLength(2)
    expect(sortButtons[0].attributes('aria-label')).toBe('Reorder item 1')
    expect(sortButtons[1].attributes('aria-label')).toBe('Reorder item 2')

    const removeButtons = form.findAll('.vf-list-remove')
    expect(removeButtons).toHaveLength(2)
    expect(removeButtons[0].attributes('aria-label')).toBe('Remove item 1')
    expect(removeButtons[1].attributes('aria-label')).toBe('Remove item 2')
  })

  it('should announce an empty list placeholder as status', async () => {
    const { form } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          flat: true,
          initial: 0,
          placeholder: 'No items yet',
          schema: { text: { type: 'text' } },
        },
      }),
    })

    await nextTick()

    const status = form.find('[role="status"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toBe('No items yet')
  })

  it('should have no axe violations', async () => {
    const { form } = createForm({
      schema: listSchema({ sort: true, label: 'The list' }),
    })

    await nextTick()
    await expectNoA11yViolations(form.element)
  })
})
