import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

describe('Expression Default Value', () => {
  describe('VfText', () => {
    it('should resolve expression default from another field', () => {
      const { target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'hello' },
          target: { type: 'text', default: '{source}' },
        }),
      })

      expect(target.model).toBe('hello')
    })

    it('should update when dependency changes', () => {
      const { a, b, total } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 3 },
          b: { type: 'text', default: 5 },
          total: { type: 'text', default: '{a + b}' },
        }),
      })

      expect(total.model).toBe(8)

      a.update(10)
      expect(total.model).toBe(15)

      b.update(20)
      expect(total.model).toBe(30)
    })

    it('should stop tracking on input when untrackOn is input', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'initial' },
          target: { type: 'text', default: '{source}', untrackOn: ['input'] },
        }),
      })

      expect(target.model).toBe('initial')

      target.handleInput('user typed')
      expect(target.model).toBe('user typed')

      source.update('changed')
      expect(target.model).toBe('user typed')
    })

    it('should keep tracking when untrackOn is not set', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'initial' },
          target: { type: 'text', default: '{source}' },
        }),
      })

      expect(target.model).toBe('initial')

      source.update('updated')
      expect(target.model).toBe('updated')

      source.update('updated again')
      expect(target.model).toBe('updated again')
    })
  })

  describe('VfSelect', () => {
    it('should resolve expression default from another field', () => {
      const { target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'option_b' },
          target: {
            type: 'select',
            default: '{source}',
            items: { option_a: 'A', option_b: 'B', option_c: 'C' },
          },
        }),
      })

      expect(target.model).toBe('option_b')
    })

    it('should update when dependency changes', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'option_a' },
          target: {
            type: 'select',
            default: '{source}',
            items: { option_a: 'A', option_b: 'B', option_c: 'C' },
          },
        }),
      })

      expect(target.model).toBe('option_a')

      source.update('option_c')
      expect(target.model).toBe('option_c')
    })

    it('should stop tracking on input when untrackOn is input', () => {
      const { source, target, form } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'option_a' },
          target: {
            type: 'select',
            default: '{source}',
            untrackOn: ['input'],
            items: { option_a: 'A', option_b: 'B', option_c: 'C' },
          },
        }),
      })

      expect(target.model).toBe('option_a')

      const select = form.find('select')
      select.element.value = 'option_c'
      select.trigger('change')

      source.update('option_b')
      expect(target.model).not.toBe('option_b')
    })

    it('should keep tracking when untrackOn is not set', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'option_a' },
          target: {
            type: 'select',
            default: '{source}',
            items: { option_a: 'A', option_b: 'B', option_c: 'C' },
          },
        }),
      })

      expect(target.model).toBe('option_a')

      source.update('option_b')
      expect(target.model).toBe('option_b')

      source.update('option_c')
      expect(target.model).toBe('option_c')
    })
  })

  describe('VfCheckbox', () => {
    it('should resolve expression default from another field', () => {
      const { target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'yes' },
          target: {
            type: 'checkbox',
            default: '{source}',
            trueValue: 'yes',
            falseValue: 'no',
          },
        }),
      })

      expect(target.model).toBe('yes')
    })

    it('should update when dependency changes', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'yes' },
          target: {
            type: 'checkbox',
            default: '{source}',
            trueValue: 'yes',
            falseValue: 'no',
          },
        }),
      })

      expect(target.model).toBe('yes')

      source.update('no')
      expect(target.model).toBe('no')
    })

    it('should stop tracking on input when untrackOn is input', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'yes' },
          target: {
            type: 'checkbox',
            default: '{source}',
            untrackOn: ['input'],
            trueValue: 'yes',
            falseValue: 'no',
          },
        }),
      })

      expect(target.model).toBe('yes')

      target.handleInput('no')
      expect(target.model).toBe('no')

      source.update('yes')
      expect(target.model).toBe('no')
    })

    it('should keep tracking when untrackOn is not set', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'yes' },
          target: {
            type: 'checkbox',
            default: '{source}',
            trueValue: 'yes',
            falseValue: 'no',
          },
        }),
      })

      expect(target.model).toBe('yes')

      source.update('no')
      expect(target.model).toBe('no')

      source.update('yes')
      expect(target.model).toBe('yes')
    })
  })

  describe('VfRadio', () => {
    it('should resolve expression default from another field', () => {
      const { target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'selected' },
          target: {
            type: 'radio',
            default: '{source}',
            radioValue: 'selected',
          },
        }),
      })

      expect(target.model).toBe('selected')
    })

    it('should update when dependency changes', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'a' },
          target: {
            type: 'radio',
            default: '{source}',
            radioValue: 'a',
          },
        }),
      })

      expect(target.model).toBe('a')

      source.update('b')
      expect(target.model).toBe('b')
    })

    it('should stop tracking on input when untrackOn is input', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'a' },
          target: {
            type: 'radio',
            default: '{source}',
            untrackOn: ['input'],
            radioValue: 'a',
          },
        }),
      })

      expect(target.model).toBe('a')

      target.handleInput('b')
      expect(target.model).toBe('b')

      source.update('c')
      expect(target.model).toBe('b')
    })

    it('should keep tracking when untrackOn is not set', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'a' },
          target: {
            type: 'radio',
            default: '{source}',
            radioValue: 'a',
          },
        }),
      })

      expect(target.model).toBe('a')

      source.update('b')
      expect(target.model).toBe('b')

      source.update('c')
      expect(target.model).toBe('c')
    })
  })
})
