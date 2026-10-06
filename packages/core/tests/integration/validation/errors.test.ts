import { defineSchema } from '#core'

import { createForm, flushPromises } from '../../helpers'

/**
 * Returns error message texts rendered in the DOM for a specific element,
 * scoped to its unique error container (identified by errorId).
 */
function errorsOf(form: any, el: any): string[] {
  const container = form.find(`#${el.errorId}`)
  if (!container.exists()) return []
  return container.findAll('.vf-error').map((node: any) => node.text())
}

/**
 * Returns form-level (aggregated) error messages from the form's error list.
 */
function formErrors(form: any): string[] {
  return form.findAll('.vf-form-error').map((node: any) => node.text())
}

describe('Errors', () => {
  // ============ Leaf element errors ============

  describe('leaf element', () => {
    it('should render a validation error under itself', async () => {
      const { form, field } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required' },
        }),
      })

      await field.validate()
      await flushPromises()

      const errors = errorsOf(form, field)
      expect(errors.length).toBe(1)
      expect(errors[0]).toContain('required')
    })

    it('should render a messageBag error under itself', async () => {
      const { form, field } = createForm({
        schema: defineSchema({
          field: { type: 'text' },
        }),
      })

      field.messageBag.append('Custom error', 'error')
      await flushPromises()

      const errors = errorsOf(form, field)
      expect(errors).toContain('Custom error')
    })

    it('should limit the number of rendered errors by maxErrors', async () => {
      const { form, field } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required|min:5', maxErrors: 1 },
        }),
      })

      await field.validate()
      await flushPromises()

      expect(errorsOf(form, field).length).toBe(1)
    })

    it('should NOT render errors when hideErrors is true', async () => {
      const { form, field } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required', hideErrors: true },
        }),
      })

      await field.validate()
      await flushPromises()

      expect(errorsOf(form, field).length).toBe(0)
      expect(field.invalid).toBe(true)
    })
  })

  // ============ Containers render own errors only ============

  describe('container renders its own error but not child errors', () => {
    it('group should render its own error, not its children errors', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          group: {
            type: 'group',
            nested: true,
            rules: 'required',
            schema: {
              child: { type: 'text', rules: 'required' },
            },
          },
        }),
      })

      await form$.validate()
      await flushPromises()

      const group = form$.find('group')
      const child = form$.find('group.child')

      // The group renders ONLY its own error (no collected child errors).
      expect(errorsOf(form, group).length).toBe(1)
      expect(errorsOf(form, group)[0]).toContain('required')

      // The child renders its own error under itself.
      expect(errorsOf(form, child).length).toBe(1)
      expect(errorsOf(form, child)[0]).toContain('required')
    })

    it('grid should render its own error, not its children errors', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          grid: {
            type: 'grid',
            nested: true,
            rules: 'required',
            grid: [[{ type: 'text', name: 'child', rules: 'required' }]],
          },
        }),
      })

      await form$.validate()
      await flushPromises()

      const grid = form$.find('grid')
      const child = form$.find('grid.child')

      expect(errorsOf(form, grid).length).toBe(1)
      expect(errorsOf(form, grid)[0]).toContain('required')

      expect(errorsOf(form, child).length).toBe(1)
      expect(errorsOf(form, child)[0]).toContain('required')
    })

    it('list should render its own error, not its children errors', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            wrap: false,
            initial: 1,
            schema: {
              field: { type: 'text', rules: 'required' },
            },
          },
        }),
      })

      const list = form$.find('list')
      list.messageBag.append('List own error', 'error')

      await form$.validate()
      await flushPromises()

      const child = form$.find('list.0.field')

      // The list renders ONLY its own error, never its children errors.
      expect(errorsOf(form, list)).toEqual(['List own error'])

      // The child renders its own error under itself.
      expect(child.invalid).toBe(true)
      expect(errorsOf(form, child).length).toBe(1)
      expect(errorsOf(form, child)[0]).toContain('required')
    })

    it('matrix should render its own error, not its cell errors', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rows: { row1: 'Row 1' },
            cols: [
              {
                value: 'col1',
                label: 'Col 1',
                schema: { type: 'text', rules: 'required' },
              },
            ],
          },
        }),
      })

      const matrix = form$.find('matrix')
      matrix.messageBag.append('Matrix own error', 'error')

      await form$.validate()
      await flushPromises()

      // The matrix renders ONLY its own error, never its cell errors.
      expect(errorsOf(form, matrix)).toEqual(['Matrix own error'])
      expect(matrix.invalid).toBe(true)
    })

    it('checkboxes should render its own error under itself', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          field: { type: 'checkboxes', rules: 'required', items: ['a', 'b'] },
        }),
      })

      await form$.validate()
      await flushPromises()

      const field = form$.find('field')
      expect(errorsOf(form, field).length).toBe(1)
      expect(errorsOf(form, field)[0]).toContain('required')
    })

    it('radios should render its own error under itself', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          field: { type: 'radios', rules: 'required', items: ['a', 'b'] },
        }),
      })

      await form$.validate()
      await flushPromises()

      const field = form$.find('field')
      expect(errorsOf(form, field).length).toBe(1)
      expect(errorsOf(form, field)[0]).toContain('required')
    })
  })

  // ============ Translatable element errors ============

  describe('translatable errors', () => {
    it('should only render the error for the currently selected language', async () => {
      const { form, form$, field } = createForm(
        {
          schema: defineSchema({
            field: {
              type: 'text',
              rules: 'required',
              translate: true,
              default: { en: 'filled', fr: '' },
            },
          }),
        },
        { languages: { en: 'English', fr: 'French' } }
      )

      await form$.validate()
      await flushPromises()

      // The element is invalid because the French value is missing...
      expect(field.invalid).toBe(true)

      // ...but the English (selected) language has no error, so nothing renders.
      expect(errorsOf(form, field).length).toBe(0)

      // Switching to French (the language that has the error) reveals it.
      form$.selectLanguage('fr')
      await flushPromises()

      expect(errorsOf(form, field).length).toBe(1)
      expect(errorsOf(form, field)[0]).toContain('required')
    })

    it('should render only the current language error even when all languages fail', async () => {
      const { form, form$, field } = createForm(
        {
          schema: defineSchema({
            field: { type: 'text', rules: 'required', translate: true },
          }),
        },
        { languages: { en: 'English', fr: 'French' } }
      )

      await form$.validate()
      await flushPromises()

      // Only the single, currently-selected language error is shown inline.
      expect(errorsOf(form, field).length).toBe(1)
      expect(errorsOf(form, field)[0]).toContain('required')
    })

    it('should aggregate errors for all languages at the form level', async () => {
      const { form, form$ } = createForm(
        {
          schema: defineSchema({
            field: { type: 'text', rules: 'required', translate: true },
          }),
          errorLevel: 'all',
        },
        { languages: { en: 'English', fr: 'French' } }
      )

      await form$.validate()
      await flushPromises()

      // The form shows the error in BOTH languages, even though the element
      // only renders the current language.
      const errors = formErrors(form)
      expect(errors.length).toBe(2)
      expect(errors.filter((e) => e.includes('English')).length).toBe(1)
      expect(errors.filter((e) => e.includes('French')).length).toBe(1)
    })
  })

  // ============ Form-level aggregation ============

  describe('form aggregation', () => {
    it('should aggregate every element type error in all languages exactly once', async () => {
      const { form, form$ } = createForm(
        {
          schema: defineSchema({
            text: { type: 'text', rules: 'required', translate: true },
            group: {
              type: 'group',
              nested: true,
              schema: {
                groupChild: {
                  type: 'text',
                  rules: 'required',
                  translate: true,
                },
              },
            },
            grid: {
              type: 'grid',
              nested: true,
              grid: [
                [
                  {
                    type: 'text',
                    name: 'gridChild',
                    rules: 'required',
                    translate: true,
                  },
                ],
              ],
            },
            list: {
              type: 'list',
              wrap: false,
              initial: 1,
              schema: {
                listChild: { type: 'text', rules: 'required', translate: true },
              },
            },
            matrix: {
              type: 'matrix',
              rows: { row1: 'Row 1' },
              cols: [
                {
                  value: 'col1',
                  label: 'Col 1',
                  schema: { type: 'text', rules: 'required', translate: true },
                },
              ],
            },
          }),
          errorLevel: 'all',
        },
        { languages: { en: 'English', fr: 'French' } }
      )

      await form$.validate()
      await flushPromises()

      const errors = formErrors(form)

      // 5 element types × 2 languages = 10 errors, each rendered exactly once.
      expect(errors.length).toBe(10)
      expect(new Set(errors).size).toBe(10)
      expect(errors.filter((e) => e.includes('English')).length).toBe(5)
      expect(errors.filter((e) => e.includes('French')).length).toBe(5)
    })
  })

  // ============ errorLevel option ============

  describe('errorLevel option', () => {
    it('should show errors on the element and the form when errorLevel is "all"', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required' },
        }),
        errorLevel: 'all',
      })

      await form$.validate()
      await flushPromises()

      const field = form$.find('field')
      expect(errorsOf(form, field).length).toBe(1)
      expect(formErrors(form).length).toBe(1)
    })

    it('should show errors only on the element when errorLevel is "element"', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required' },
        }),
        errorLevel: 'element',
      })

      await form$.validate()
      await flushPromises()

      const field = form$.find('field')
      expect(errorsOf(form, field).length).toBe(1)
      expect(formErrors(form).length).toBe(0)
    })

    it('should show errors only on the form when errorLevel is "form"', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required' },
        }),
        errorLevel: 'form',
      })

      await form$.validate()
      await flushPromises()

      const field = form$.find('field')
      expect(errorsOf(form, field).length).toBe(0)
      expect(formErrors(form).length).toBe(1)
    })
  })

  // ============ hideErrors option ============

  describe('hideErrors option', () => {
    it('should not render element errors when hideErrors is set on the element', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required', hideErrors: true },
        }),
        errorLevel: 'all',
      })

      await form$.validate()
      await flushPromises()

      const field = form$.find('field')
      expect(errorsOf(form, field).length).toBe(0)
      expect(field.invalid).toBe(true)
    })

    it('should not render form errors when hideErrors is set on the form', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required' },
        }),
        errorLevel: 'all',
        hideErrors: true,
      })

      await form$.validate()
      await flushPromises()

      expect(formErrors(form).length).toBe(0)
    })
  })

  // ============ Invalid state ============

  describe('invalid state', () => {
    it('should mark a leaf element as invalid when validation fails', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required' },
        }),
      })

      expect(field.invalid).toBe(false)
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should mark a container as invalid when a child is invalid', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          group: {
            type: 'group',
            nested: true,
            schema: {
              child: { type: 'text', rules: 'required' },
            },
          },
        }),
      })

      await form$.validate()
      expect(form$.find('group').invalid).toBe(true)
    })

    it('should mark a container as invalid when its own rules fail', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            rules: 'required',
            initial: 0,
          },
        }),
      })

      await form$.validate()
      expect(form$.find('list').invalid).toBe(true)
    })

    it('should mark the form as invalid when any element is invalid', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required' },
        }),
      })

      expect(form$.invalid).toBe(false)
      await form$.validate()
      expect(form$.invalid).toBe(true)
    })

    it('should become valid after fixing the value', async () => {
      const { form$, field } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required' },
        }),
      })

      await field.validate()
      expect(field.invalid).toBe(true)

      field.update('filled')
      await field.validate()
      expect(field.invalid).toBe(false)
      expect(form$.invalid).toBe(false)
    })
  })
})
