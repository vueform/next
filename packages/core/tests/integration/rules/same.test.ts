import { defineSchema } from '@vueform/core'

import { createForm, flushPromises } from '../../helpers'

describe('same', () => {
  it('should pass when values match', async () => {
    const { confirm } = createForm({
      schema: defineSchema({
        password: { type: 'text', default: 'secret123' },
        confirm: { type: 'text', rules: 'same:password', default: 'secret123' },
      }),
    })
    await confirm.validate()
    expect(confirm.invalid).toBe(false)
  })

  it('should fail when values differ', async () => {
    const { confirm } = createForm({
      schema: defineSchema({
        password: { type: 'text', default: 'secret123' },
        confirm: { type: 'text', rules: 'same:password', default: 'different' },
      }),
    })
    await confirm.validate()
    expect(confirm.invalid).toBe(true)
  })

  it('should use loose equality', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text', default: '1' },
        b: { type: 'text', rules: 'same:a', default: 1 as any },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })

  it('should pass after updating to matching value', async () => {
    const { confirm } = createForm({
      schema: defineSchema({
        password: { type: 'text', default: 'secret' },
        confirm: { type: 'text', rules: 'same:password', default: 'wrong' },
      }),
    })
    await confirm.validate()
    expect(confirm.invalid).toBe(true)

    confirm.update('secret')
    await confirm.validate()
    expect(confirm.invalid).toBe(false)
  })

  it('should pass when both fields are empty and other is not validated', async () => {
    const { b } = createForm({
      schema: defineSchema({
        a: { type: 'text' },
        b: { type: 'text', rules: 'same:a' },
      }),
    })
    await b.validate()
    expect(b.invalid).toBe(false)
  })

  // Dependent revalidation is gated: changing the referenced field must not
  // surface an error on an element the user has not interacted with yet.
  describe('interaction gating', () => {
    it('should not show error when other changes before the field was touched (change trigger)', async () => {
      const { other, field } = createForm({
        schema: defineSchema({
          other: { type: 'text' },
          field: { type: 'text', rules: 'same:other' },
        }),
        validateOn: ['change'],
      })

      other.handleInput('secret')
      await flushPromises()

      expect(field.validated).toBe(false)
      expect(field.invalid).toBe(false)
      expect(field.errors).toEqual([])
    })

    it('should not show error when other changes before the field was touched (blur trigger)', async () => {
      const { form, field } = createForm({
        schema: defineSchema({
          other: { type: 'text' },
          field: { type: 'text', rules: 'same:other' },
        }),
        validateOn: ['blur'],
      })

      const otherInput = form.findAll('input')[0]
      await otherInput.setValue('secret')
      await otherInput.trigger('blur')
      await flushPromises()

      expect(field.validated).toBe(false)
      expect(field.invalid).toBe(false)
      expect(field.errors).toEqual([])
    })

    it('should show error on the first change of the field when it does not match (change trigger)', async () => {
      const { field } = createForm({
        schema: defineSchema({
          other: { type: 'text', default: 'secret' },
          field: { type: 'text', rules: 'same:other' },
        }),
        validateOn: ['change'],
      })

      field.handleInput('nope')
      await flushPromises()

      expect(field.invalid).toBe(true)
    })

    it('should revalidate on other change once the field was validated (change trigger)', async () => {
      const { other, field } = createForm({
        schema: defineSchema({
          other: { type: 'text', default: 'a' },
          field: { type: 'text', rules: 'same:other' },
        }),
        validateOn: ['change'],
      })

      field.handleInput('a')
      await flushPromises()
      expect(field.invalid).toBe(false)

      other.handleInput('b')
      await flushPromises()
      expect(field.invalid).toBe(true)
    })

    it('should check on first blur and then on either field changing (blur trigger)', async () => {
      const { form, other, field } = createForm({
        schema: defineSchema({
          other: { type: 'text', default: 'secret' },
          field: { type: 'text', rules: 'same:other' },
        }),
        validateOn: ['blur'],
      })

      field.handleInput('secret')
      await form.findAll('input')[1].trigger('blur')
      await flushPromises()
      expect(field.invalid).toBe(false)

      other.handleInput('changed')
      await flushPromises()
      expect(field.invalid).toBe(true)

      field.handleInput('changed')
      await flushPromises()
      expect(field.invalid).toBe(false)
    })
  })
})
