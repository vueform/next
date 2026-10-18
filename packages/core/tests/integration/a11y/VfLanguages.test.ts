import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

const multilingualForm = () =>
  createForm({
    multilingual: true,
    languages: { en: 'English', de: 'German' },
    schema: defineSchema({
      el: { type: 'text', translate: true, label: 'The label' },
    }),
  })

// =============================================================================
// LANGUAGE SELECTOR SEMANTICS
// =============================================================================
describe('VfLanguages a11y', () => {
  it('should mark the active language with aria-current and avoid tab semantics', () => {
    const { form } = multilingualForm()

    const languages = form.find('.vf-languages')
    expect(languages.exists()).toBe(true)

    // Plain buttons on purpose: no tablist keyboard contract is implemented.
    expect(languages.find('[role="tablist"]').exists()).toBe(false)
    expect(languages.find('[role="tab"]').exists()).toBe(false)

    const buttons = languages.findAll('button')
    expect(buttons).toHaveLength(2)

    expect(buttons[0].attributes('aria-current')).toBe('true')
    expect(buttons[1].attributes('aria-current')).toBeUndefined()
  })

  it('should move aria-current when another language is selected', async () => {
    const { form } = multilingualForm()

    const buttons = form.find('.vf-languages').findAll('button')

    await buttons[1].trigger('click')
    await nextTick()

    expect(buttons[0].attributes('aria-current')).toBeUndefined()
    expect(buttons[1].attributes('aria-current')).toBe('true')
  })
})
