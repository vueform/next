import { defineSchema } from '@vueform/core'
import { createForm } from '../helpers'

describe('VfForm', () => {
  describe('get', () => {
    describe('Basic get (model value)', () => {
      it('should return the element model value', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            text: { type: 'text', default: 'hello' },
          }),
        })

        expect(form$.get('text')).toBe('hello')
      })

      it('should return updated value after update()', () => {
        const { form$, text } = createForm({
          schema: defineSchema({
            text: { type: 'text', default: 'hello' },
          }),
        })

        text.update('world')
        expect(form$.get('text')).toBe('world')
      })

      it('should return nested element value', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            group: {
              type: 'group',
              nested: true,
              schema: {
                nested: { type: 'text', default: 'deep' },
              },
            },
          }),
        })

        expect(form$.get('group.nested')).toBe('deep')
      })
    })

    describe('get with @prop syntax', () => {
      it('should return the element label', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            text: { type: 'text', label: 'Email Address' },
          }),
        })

        expect(form$.get('text@label')).toBe('Email Address')
      })

      it('should return the element genericName', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            text: { type: 'text', label: 'Username' },
          }),
        })

        expect(form$.get('text@genericName')).toBe('Username')
      })

      it('should return the element available state', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            text: { type: 'text' },
          }),
        })

        expect(form$.get('text@available')).toBe(true)
      })

      it('should return the element path string', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            text: { type: 'text' },
          }),
        })

        expect(form$.get('text@path')).toBe('text')
      })

      it('should return label of a nested element', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            group: {
              type: 'group',
              nested: true,
              schema: {
                nested: { type: 'text', label: 'Nested Field' },
              },
            },
          }),
        })

        expect(form$.get('group.nested@label')).toBe('Nested Field')
      })
    })

    describe('get with @nested.prop syntax', () => {
      it('should return a deeply nested context property', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            text: { type: 'text' },
          }),
        })

        expect(form$.get('text@container.type')).toBeDefined()
      })
    })

    describe('Edge cases', () => {
      it('should return undefined for nonexistent element', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            text: { type: 'text' },
          }),
        })

        expect(form$.get('nonexistent')).toBeUndefined()
      })

      it('should return undefined for nonexistent element with @prop', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            text: { type: 'text' },
          }),
        })

        expect(form$.get('nonexistent@label')).toBeUndefined()
      })

      it('should return undefined for nonexistent prop', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            text: { type: 'text' },
          }),
        })

        expect(form$.get('text@nonexistent')).toBeUndefined()
      })
    })
  })
})
