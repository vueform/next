import { nextTick } from 'vue'

import { createForm, expectNoA11yViolations } from '../../helpers'

// Schemas here are built dynamically per type, so they stay plain objects
// (defineSchema's exact-typed inference needs literals).

/**
 * The single-input element types sharing the aria / tInputAria input pattern
 * contract, with the selector locating their native input inside the form.
 */
const inputTypes = [
  { type: 'text', selector: 'input[type="text"]' },
  { type: 'textarea', selector: 'textarea' },
  { type: 'select', selector: 'select' },
  { type: 'file', selector: 'input[type="file"]' },
  { type: 'checkbox', selector: 'input[type="checkbox"]' },
  { type: 'radio', selector: 'input[type="radio"]' },
] as const

/**
 * Select needs items for a sensible render; the rest take the base schema.
 */
const extraProps = (type: string) =>
  type === 'select' ? { items: { a: 'A', b: 'B' } } : {}

// =============================================================================
// LABEL / HELP / DESCRIPTION WIRING
// =============================================================================
describe('a11y layout wiring', () => {
  inputTypes.forEach(({ type, selector }) => {
    it(`should wire label, help, and description ids for ${type}`, () => {
      const { form } = createForm({
        schema: {
          el: {
            type,
            label: 'The label',
            help: 'The help text',
            description: 'The description text',
            ...extraProps(type),
          },
        },
      })

      const input = form.find(selector)
      expect(input.exists()).toBe(true)

      const id = input.attributes('id')!
      expect(id).toBeTruthy()

      // A label[for] always points at the input: the layout `<label>` for
      // regular inputs, the choice-text / sr-only label for checkbox & radio.
      const forLabel = form.find(`label[for="${id}"]`)
      expect(forLabel.exists()).toBe(true)

      if (type !== 'checkbox' && type !== 'radio') {
        // The visible layout label is the <label> carrying labelId.
        expect(forLabel.attributes('id')).toBe(`${id}__label`)
        expect(forLabel.text()).toBe('The label')
      } else {
        // Checkbox/radio layouts render the element label as a non-<label>
        // node (the input is labelled by its own choice text instead).
        const layoutLabel = form.find(`[id="${id}__label"]`)
        expect(layoutLabel.exists()).toBe(true)
        expect(layoutLabel.element.tagName).not.toBe('LABEL')
      }

      // Help and description regions exist under their derived ids.
      const help = form.find(`[id="${id}__help"]`)
      expect(help.exists()).toBe(true)
      expect(help.text()).toBe('The help text')

      const description = form.find(`[id="${id}__description"]`)
      expect(description.exists()).toBe(true)
      expect(description.text()).toBe('The description text')

      // aria-describedby references help + description, never the label.
      const describedby = input.attributes('aria-describedby')!.split(' ')
      expect(describedby).toContain(`${id}__help`)
      expect(describedby).toContain(`${id}__description`)
      expect(describedby).not.toContain(`${id}__label`)
    })

    it(`should expose validation errors via aria for ${type}`, async () => {
      const { form, el } = createForm({
        schema: {
          el: { type, rules: 'required', ...extraProps(type) },
        },
      })

      await el.validate()
      await nextTick()

      const input = form.find(selector)
      const id = input.attributes('id')!

      expect(input.attributes('aria-invalid')).toBe('true')

      const describedby = input.attributes('aria-describedby')!.split(' ')
      expect(describedby).toContain(`${id}__error`)

      const error = form.find(`[id="${id}__error"]`)
      expect(error.exists()).toBe(true)
      expect(error.attributes('role')).toBe('alert')
      expect(error.text().length).toBeGreaterThan(0)
    })

    it(`should set aria-required only with a required rule for ${type}`, () => {
      const { form: requiredForm } = createForm({
        schema: {
          el: { type, rules: 'required', ...extraProps(type) },
        },
      })
      expect(requiredForm.find(selector).attributes('aria-required')).toBe(
        'true'
      )

      const { form: optionalForm } = createForm({
        schema: {
          el: { type, ...extraProps(type) },
        },
      })
      expect(
        optionalForm.find(selector).attributes('aria-required')
      ).toBeUndefined()
    })

    it(`should render no aria state by default for ${type}`, () => {
      const { form } = createForm({
        schema: {
          el: { type, ...extraProps(type) },
        },
      })

      const input = form.find(selector)
      expect(input.attributes('aria-describedby')).toBeUndefined()
      expect(input.attributes('aria-invalid')).toBeUndefined()
      expect(input.attributes('aria-busy')).toBeUndefined()
      expect(input.attributes('aria-required')).toBeUndefined()
    })

    it(`should have no axe violations for ${type}`, async () => {
      const { form } = createForm({
        schema: {
          el: {
            type,
            label: 'The label',
            help: 'The help text',
            description: 'The description text',
            ...extraProps(type),
          },
        },
      })

      await nextTick()
      await expectNoA11yViolations(form.element)
    })
  })
})
