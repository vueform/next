import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'

import { createForm, expectNoA11yViolations } from '../../helpers'

// =============================================================================
// SELECT A11Y
// =============================================================================
describe('VfSelect a11y', () => {
  it('should label the select and keep aria state on the native element', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'select',
          label: 'The label',
          help: 'The help text',
          items: { a: 'Alpha', b: 'Beta' },
        },
      }),
    })

    const select = form.find('select')
    const id = select.attributes('id')!

    const label = form.find(`label[for="${id}"]`)
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('The label')

    const describedby = select.attributes('aria-describedby')!.split(' ')
    expect(describedby).toEqual([`${id}__help`])

    expect(select.attributes('aria-invalid')).toBeUndefined()
    expect(select.attributes('aria-busy')).toBeUndefined()
  })

  it('should have no axe violations with placeholder and grouped options', async () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'select',
          label: 'The label',
          placeholder: 'Pick one',
          groupLabel: 'label',
          groupChildren: 'items',
          items: [
            { label: 'Fruits', items: { a: 'Apple', b: 'Banana' } },
            { label: 'Veggies', items: { c: 'Carrot' } },
          ],
        },
      }),
    })

    await nextTick()
    await expectNoA11yViolations(form.element)
  })
})
