import { defineSchema } from '@vueform/primevue'

import { createForm } from '../../helpers'

// =============================================================================
// MODIFIER MIRROR
// =============================================================================
// Adapter components mirror the core modifier contract (part-keyed `data-*`
// state/variant attributes, derived only from Vueform-resolved props) on the
// Prime host root, alongside whatever `data-p-*` attributes the host renders
// itself. ARIA stays a separate aspect: paired states emit both attributes
// from the same source.
describe('Modifiers (PrimeVue mirror)', () => {
  test('mirrors button variants as data attributes on the host root', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'button',
          text: 'Go',
          align: 'right',
          severity: 'danger',
        },
      }),
    })

    const btn = form.find('button')
    expect(btn.attributes('data-align')).toBe('right')
    expect(btn.attributes('data-severity')).toBe('danger')
    expect(btn.attributes('data-loading')).toBeUndefined()
  })

  test('emits aria-invalid and data-invalid together after validation', async () => {
    const { form, form$ } = createForm({
      schema: defineSchema({
        el: { type: 'input-text', label: 'Name', rules: 'required' },
      }),
    })

    const input = form.find('input')
    expect(input.attributes('data-invalid')).toBeUndefined()

    await form$.validate()
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('data-invalid')).toBe('')
  })

  test('exposes group layout state as data attributes', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkbox-group',
          label: 'Choices',
          items: { a: 'A', b: 'B' },
          stacked: true,
        },
      }),
    })

    const group = form.find('[role="group"]')
    expect(group.attributes('data-stacked')).toBe('')
  })

  test('never renders a data attribute with the literal value "false"', () => {
    const { form } = createForm({
      schema: defineSchema({
        btn: { type: 'button', text: 'Go' },
        name: { type: 'input-text', label: 'Name' },
        choices: {
          type: 'radio-button-group',
          label: 'Choices',
          items: { a: 'A', b: 'B' },
        },
      }),
    })

    const elements: Element[] = Array.from(form.element.querySelectorAll('*'))
    const offenders = elements.flatMap((el) =>
      Array.from(el.attributes)
        .filter(
          (attr) =>
            attr.name.startsWith('data-') &&
            // `data-p-*` is the Prime host's own namespace with its own
            // conventions (it does render `"false"`) — the invariant covers
            // only the Vueform modifier contract.
            !attr.name.startsWith('data-p-') &&
            attr.value === 'false'
        )
        .map((attr) => `${el.tagName}[${attr.name}]`)
    )
    expect(offenders).toEqual([])
  })
})
