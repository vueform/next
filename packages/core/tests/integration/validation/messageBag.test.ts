import { defineSchema } from '@vueform/core'
import { createForm } from '../../helpers'

describe('MessageBag', () => {
  describe('append', () => {
    it('should append an error', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Error 1', 'error')
      expect(text.errors).toContain('Error 1')
    })

    it('should append a message', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Message 1', 'message')
      expect(text.messages).toContain('Message 1')
    })

    it('should default to error type when type is omitted', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Default error')
      expect(text.errors).toContain('Default error')
      expect(text.messages).not.toContain('Default error')
    })

    it('should append multiple errors in order', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Error A', 'error')
      text.messageBag.append('Error B', 'error')
      text.messageBag.append('Error C', 'error')

      expect(text.errors).toEqual(['Error A', 'Error B', 'Error C'])
    })

    it('should append multiple messages in order', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Msg A', 'message')
      text.messageBag.append('Msg B', 'message')

      expect(text.messages).toEqual(['Msg A', 'Msg B'])
    })

    it('should keep errors and messages separate', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('An error', 'error')
      text.messageBag.append('A message', 'message')

      expect(text.errors).toContain('An error')
      expect(text.errors).not.toContain('A message')
      expect(text.messages).toContain('A message')
      expect(text.messages).not.toContain('An error')
    })
  })

  describe('prepend', () => {
    it('should prepend an error before appended errors', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Appended error', 'error')
      text.messageBag.prepend('Prepended error', 'error')

      expect(text.errors[0]).toBe('Prepended error')
      expect(text.errors[1]).toBe('Appended error')
    })

    it('should prepend a message before appended messages', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Appended msg', 'message')
      text.messageBag.prepend('Prepended msg', 'message')

      expect(text.messages[0]).toBe('Prepended msg')
      expect(text.messages[1]).toBe('Appended msg')
    })

    it('should default to error type when type is omitted', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.prepend('Default prepend')
      expect(text.errors).toContain('Default prepend')
      expect(text.messages).not.toContain('Default prepend')
    })

    it('should prepend errors before validation errors', async () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text', rules: 'required' },
        }),
      })

      await text.validate()
      text.messageBag.prepend('Custom error', 'error')

      expect(text.errors[0]).toBe('Custom error')
    })

    it('should place multiple prepends in reverse insertion order', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.prepend('First', 'error')
      text.messageBag.prepend('Second', 'error')

      expect(text.errors[0]).toBe('Second')
      expect(text.errors[1]).toBe('First')
    })
  })

  describe('remove', () => {
    it('should remove an appended error by value', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('To remove', 'error')
      text.messageBag.remove('To remove', 'error')

      expect(text.errors).not.toContain('To remove')
    })

    it('should remove a prepended error by value', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.prepend('To remove', 'error')
      text.messageBag.remove('To remove', 'error')

      expect(text.errors).not.toContain('To remove')
    })

    it('should remove an appended message by value', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('To remove', 'message')
      text.messageBag.remove('To remove', 'message')

      expect(text.messages).not.toContain('To remove')
    })

    it('should remove a prepended message by value', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.prepend('To remove', 'message')
      text.messageBag.remove('To remove', 'message')

      expect(text.messages).not.toContain('To remove')
    })

    it('should remove from both errors and messages when type is "any"', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Duplicate', 'error')
      text.messageBag.append('Duplicate', 'message')

      text.messageBag.remove('Duplicate', 'any')

      expect(text.errors).not.toContain('Duplicate')
      expect(text.messages).not.toContain('Duplicate')
    })

    it('should default to "any" type when type is omitted', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Remove me', 'error')
      text.messageBag.append('Remove me', 'message')

      text.messageBag.remove('Remove me')

      expect(text.errors).not.toContain('Remove me')
      expect(text.messages).not.toContain('Remove me')
    })

    it('should only remove errors when type is "error"', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Same text', 'error')
      text.messageBag.append('Same text', 'message')

      text.messageBag.remove('Same text', 'error')

      expect(text.errors).not.toContain('Same text')
      expect(text.messages).toContain('Same text')
    })

    it('should only remove messages when type is "message"', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Same text', 'error')
      text.messageBag.append('Same text', 'message')

      text.messageBag.remove('Same text', 'message')

      expect(text.errors).toContain('Same text')
      expect(text.messages).not.toContain('Same text')
    })

    it('should not throw when removing a non-existent message', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      expect(() => text.messageBag.remove('Does not exist')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('should clear all errors and messages with clear()', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.prepend('Prepended error', 'error')
      text.messageBag.append('Appended error', 'error')
      text.messageBag.prepend('Prepended msg', 'message')
      text.messageBag.append('Appended msg', 'message')

      text.messageBag.clear()

      expect(text.errors).toHaveLength(0)
      expect(text.messages).toHaveLength(0)
    })

    it('should clear all errors and messages with clear("all")', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Error', 'error')
      text.messageBag.append('Message', 'message')

      text.messageBag.clear('all')

      expect(text.errors).toHaveLength(0)
      expect(text.messages).toHaveLength(0)
    })

    it('should clear only errors with clear("errors")', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Error', 'error')
      text.messageBag.append('Message', 'message')

      text.messageBag.clear('errors')

      expect(text.errors).toHaveLength(0)
      expect(text.messages).toContain('Message')
    })

    it('should clear only messages with clear("messages")', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Error', 'error')
      text.messageBag.append('Message', 'message')

      text.messageBag.clear('messages')

      expect(text.errors).toContain('Error')
      expect(text.messages).toHaveLength(0)
    })

    it('should clear both prepended and appended when clearing', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.prepend('P-Error', 'error')
      text.messageBag.append('A-Error', 'error')
      text.messageBag.prepend('P-Msg', 'message')
      text.messageBag.append('A-Msg', 'message')

      text.messageBag.clear('errors')

      expect(text.errors).toHaveLength(0)
      expect(text.messages).toEqual(['P-Msg', 'A-Msg'])
    })
  })

  describe('clearPrepended', () => {
    it('should clear only prepended errors and messages with clearPrepended()', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.prepend('P-Error', 'error')
      text.messageBag.append('A-Error', 'error')
      text.messageBag.prepend('P-Msg', 'message')
      text.messageBag.append('A-Msg', 'message')

      text.messageBag.clearPrepended()

      expect(text.errors).toEqual(['A-Error'])
      expect(text.messages).toEqual(['A-Msg'])
    })

    it('should clear only prepended errors with clearPrepended("errors")', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.prepend('P-Error', 'error')
      text.messageBag.append('A-Error', 'error')
      text.messageBag.prepend('P-Msg', 'message')

      text.messageBag.clearPrepended('errors')

      expect(text.errors).toEqual(['A-Error'])
      expect(text.messages).toContain('P-Msg')
    })

    it('should clear only prepended messages with clearPrepended("messages")', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.prepend('P-Error', 'error')
      text.messageBag.prepend('P-Msg', 'message')
      text.messageBag.append('A-Msg', 'message')

      text.messageBag.clearPrepended('messages')

      expect(text.errors).toContain('P-Error')
      expect(text.messages).toEqual(['A-Msg'])
    })
  })

  describe('clearAppended', () => {
    it('should clear only appended errors and messages with clearAppended()', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.prepend('P-Error', 'error')
      text.messageBag.append('A-Error', 'error')
      text.messageBag.prepend('P-Msg', 'message')
      text.messageBag.append('A-Msg', 'message')

      text.messageBag.clearAppended()

      expect(text.errors).toEqual(['P-Error'])
      expect(text.messages).toEqual(['P-Msg'])
    })

    it('should clear only appended errors with clearAppended("errors")', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.prepend('P-Error', 'error')
      text.messageBag.append('A-Error', 'error')
      text.messageBag.append('A-Msg', 'message')

      text.messageBag.clearAppended('errors')

      expect(text.errors).toEqual(['P-Error'])
      expect(text.messages).toContain('A-Msg')
    })

    it('should clear only appended messages with clearAppended("messages")', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('A-Error', 'error')
      text.messageBag.prepend('P-Msg', 'message')
      text.messageBag.append('A-Msg', 'message')

      text.messageBag.clearAppended('messages')

      expect(text.errors).toContain('A-Error')
      expect(text.messages).toEqual(['P-Msg'])
    })
  })

  describe('computed: error / message', () => {
    it('should return the first error via messageBag.error', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('First', 'error')
      text.messageBag.append('Second', 'error')

      expect(text.messageBag.error.value).toBe('First')
    })

    it('should return the first message via messageBag.message', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('First msg', 'message')
      text.messageBag.append('Second msg', 'message')

      expect(text.messageBag.message.value).toBe('First msg')
    })

    it('should return undefined when there are no errors', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      expect(text.messageBag.error.value).toBeUndefined()
    })

    it('should return undefined when there are no messages', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      expect(text.messageBag.message.value).toBeUndefined()
    })

    it('should reflect prepended errors in messageBag.error', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Appended', 'error')
      text.messageBag.prepend('Prepended', 'error')

      expect(text.messageBag.error.value).toBe('Prepended')
    })
  })

  describe('element helpers', () => {
    it('should clear errors via el$.clearErrors()', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Error 1', 'error')
      text.messageBag.append('Error 2', 'error')

      text.clearErrors()
      expect(text.errors).toHaveLength(0)
    })

    it('should clear messages via el$.clearMessages()', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Msg 1', 'message')
      text.messageBag.append('Msg 2', 'message')

      text.clearMessages()
      expect(text.messages).toHaveLength(0)
    })

    it('should clear both errors and messages via el$.clearMessageBag()', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Error', 'error')
      text.messageBag.append('Message', 'message')

      text.clearMessageBag()
      expect(text.errors).toHaveLength(0)
      expect(text.messages).toHaveLength(0)
    })

    it('should not clear validation errors via el$.clearErrors()', async () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text', rules: 'required' },
        }),
      })

      await text.validate()
      expect(text.errors.length).toBeGreaterThan(0)

      text.clearErrors()
      expect(text.errors.length).toBeGreaterThan(0)
    })
  })

  describe('interaction with validation', () => {
    it('should show custom errors alongside validation errors', async () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text', rules: 'required' },
        }),
      })

      await text.validate()
      text.messageBag.append('Custom error', 'error')

      expect(text.errors.length).toBeGreaterThanOrEqual(2)
      expect(text.errors).toContain('Custom error')
    })

    it('should prepend custom errors before validation errors', async () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text', rules: 'required' },
        }),
      })

      await text.validate()
      text.messageBag.prepend('Before validation', 'error')

      expect(text.errors[0]).toBe('Before validation')
    })

    it('should append custom errors after validation errors', async () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text', rules: 'required' },
        }),
      })

      await text.validate()
      text.messageBag.append('After validation', 'error')

      expect(text.errors[text.errors.length - 1]).toBe('After validation')
    })
  })

  describe('auto-clear on value change', () => {
    it('should auto-clear custom errors on value change by default', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      text.messageBag.append('Custom error', 'error')
      expect(text.errors).toContain('Custom error')

      text.update('new value')
      expect(text.errors).not.toContain('Custom error')
    })

    it('should persist custom errors on value change when clearCustomErrors is false', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
        clearCustomErrors: false,
      })

      text.messageBag.append('Persistent error', 'error')
      expect(text.errors).toContain('Persistent error')

      text.update('new value')
      expect(text.errors).toContain('Persistent error')
    })
  })

  describe('multiple elements', () => {
    it('should maintain independent messageBags per element', () => {
      const { first, last } = createForm({
        schema: defineSchema({
          first: { type: 'text' },
          last: { type: 'text' },
        }),
      })

      first.messageBag.append('First error', 'error')
      last.messageBag.append('Last error', 'error')

      expect(first.errors).toContain('First error')
      expect(first.errors).not.toContain('Last error')
      expect(last.errors).toContain('Last error')
      expect(last.errors).not.toContain('First error')
    })

    it('should clear one element messageBag without affecting another', () => {
      const { first, last } = createForm({
        schema: defineSchema({
          first: { type: 'text' },
          last: { type: 'text' },
        }),
      })

      first.messageBag.append('First error', 'error')
      last.messageBag.append('Last error', 'error')

      first.messageBag.clear()

      expect(first.errors).toHaveLength(0)
      expect(last.errors).toContain('Last error')
    })
  })
})
