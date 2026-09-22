import { defineSchema } from '@vueform/core'
import { createForm, flushPromises } from '../helpers'

describe('Addons', () => {
  // =========================================================================
  // Text input — before
  // =========================================================================
  describe('VfText before', () => {
    test('single text addon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', addonBefore: '$' },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(1)
      expect(addons[0].html()).toContain('$')
    })

    test('single select addon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: { type: 'select', name: 'cur', items: ['USD', 'EUR'] },
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(1)
      expect(form.findComponent({ name: 'VfSelect' }).exists()).toBe(true)
    })

    test('single checkbox addon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: { type: 'checkbox', name: 'cb' },
          },
        }),
      })

      expect(form.findComponent({ name: 'VfCheckbox' }).exists()).toBe(true)
    })

    test('single radio addon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: { type: 'radio', name: 'rd' },
          },
        }),
      })

      expect(form.findComponent({ name: 'VfRadio' }).exists()).toBe(true)
    })

    test('single text element addon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: { type: 'text', name: 'prefix' },
          },
        }),
      })

      const texts = form.findAllComponents({ name: 'VfText' })
      expect(texts).toHaveLength(2)
    })

    test('multiple addons', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: [
              '$',
              { type: 'select', name: 'cur', items: ['USD', 'EUR'] },
            ],
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)
      expect(addons[0].html()).toContain('$')
      expect(form.findComponent({ name: 'VfSelect' }).exists()).toBe(true)
    })

    test('functional addon returning string', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', addonBefore: () => '$' },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(1)
      expect(addons[0].html()).toContain('$')
    })

    test('functional addon returning array', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: () => ['$', { type: 'checkbox', name: 'cb' }],
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)
      expect(addons[0].html()).toContain('$')
      expect(form.findComponent({ name: 'VfCheckbox' }).exists()).toBe(true)
    })
  })

  // =========================================================================
  // Text input — after
  // =========================================================================
  describe('VfText after', () => {
    test('single text addon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', addonAfter: '.00' },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(1)
      expect(addons[0].html()).toContain('.00')
    })

    test('single select addon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonAfter: { type: 'select', name: 'unit', items: ['kg', 'lb'] },
          },
        }),
      })

      expect(form.findComponent({ name: 'VfSelect' }).exists()).toBe(true)
    })

    test('multiple addons', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonAfter: [{ type: 'checkbox', name: 'cb' }, '%'],
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)
      expect(form.findComponent({ name: 'VfCheckbox' }).exists()).toBe(true)
      expect(addons[1].html()).toContain('%')
    })

    test('functional addon returning string', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', addonAfter: () => '%' },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(1)
      expect(addons[0].html()).toContain('%')
    })

    test('functional addon returning array', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonAfter: () => [{ type: 'radio', name: 'rd' }, '!'],
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)
      expect(form.findComponent({ name: 'VfRadio' }).exists()).toBe(true)
      expect(addons[1].html()).toContain('!')
    })
  })

  // =========================================================================
  // Text input — before + after together
  // =========================================================================
  describe('VfText before + after', () => {
    test('both single addons', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', addonBefore: '$', addonAfter: '.00' },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)
      expect(addons[0].html()).toContain('$')
      expect(addons[1].html()).toContain('.00')
    })

    test('multiple before and after', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: ['$', { type: 'checkbox', name: 'b1' }],
            addonAfter: [{ type: 'checkbox', name: 'a1' }, '%'],
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(4)
    })
  })

  // =========================================================================
  // Select input — before
  // =========================================================================
  describe('VfSelect before', () => {
    test('single text addon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'select', items: [1, 2], addonBefore: 'Pick:' },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(1)
      expect(addons[0].html()).toContain('Pick:')
    })

    test('single checkbox addon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'select',
            items: [1, 2],
            addonBefore: { type: 'checkbox', name: 'toggle' },
          },
        }),
      })

      expect(form.findComponent({ name: 'VfCheckbox' }).exists()).toBe(true)
    })

    test('multiple addons', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'select',
            items: [1, 2],
            addonBefore: ['Label', { type: 'text', name: 'search' }],
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)
      expect(addons[0].html()).toContain('Label')

      const texts = form.findAllComponents({ name: 'VfText' })
      expect(texts).toHaveLength(1)
    })

    test('functional addon returning array', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'select',
            items: [1, 2],
            addonBefore: () => [{ type: 'radio', name: 'rd' }, 'prefix'],
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)
      expect(form.findComponent({ name: 'VfRadio' }).exists()).toBe(true)
      expect(addons[1].html()).toContain('prefix')
    })
  })

  // =========================================================================
  // Select input — after
  // =========================================================================
  describe('VfSelect after', () => {
    test('single text addon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'select', items: [1, 2], addonAfter: 'suffix' },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(1)
      expect(addons[0].html()).toContain('suffix')
    })

    test('single radio addon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'select',
            items: [1, 2],
            addonAfter: { type: 'radio', name: 'rd' },
          },
        }),
      })

      expect(form.findComponent({ name: 'VfRadio' }).exists()).toBe(true)
    })

    test('multiple addons', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'select',
            items: [1, 2],
            addonAfter: [
              { type: 'select', name: 'unit', items: ['a', 'b'] },
              '!',
            ],
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)

      const selects = form.findAllComponents({ name: 'VfSelect' })
      expect(selects).toHaveLength(2)
    })

    test('functional addon returning string', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'select',
            items: [1, 2],
            addonAfter: () => 'done',
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(1)
      expect(addons[0].html()).toContain('done')
    })
  })

  // =========================================================================
  // Select input — before + after together
  // =========================================================================
  describe('VfSelect before + after', () => {
    test('both single addons', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'select',
            items: [1, 2],
            addonBefore: 'From:',
            addonAfter: { type: 'checkbox', name: 'confirmed' },
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)
      expect(addons[0].html()).toContain('From:')
      expect(form.findComponent({ name: 'VfCheckbox' }).exists()).toBe(true)
    })

    test('multiple before and after', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'select',
            items: [1, 2],
            addonBefore: [
              { type: 'text', name: 'b1' },
              { type: 'text', name: 'b2' },
            ],
            addonAfter: ['x', 'y'],
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(4)
    })
  })

  // =========================================================================
  // No addons
  // =========================================================================
  describe('no addons', () => {
    test('text with no addons renders no VfAddon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text' },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(0)
    })

    test('select with no addons renders no VfAddon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'select', items: [1, 2] },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(0)
    })
  })
})

describe('Addon error display (adoption)', () => {
  // =========================================================================
  // An adopted addon's errors surface through its host element
  // =========================================================================
  describe('display', () => {
    test('host displays the adopted addon errors', async () => {
      const { el, cur } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: {
              type: 'select',
              name: 'cur',
              items: ['USD', 'EUR'],
              rules: 'required',
            },
          },
        }),
      })

      await cur.validate()
      await flushPromises()

      const message = cur.errors[0]

      expect(message).toBeTruthy()
      // The addon pushes its errors up; the host surfaces them.
      expect(cur.hoisted).toBe(true)
      expect(el.hoisted).toBe(false)
      expect(el.errors).toContain(message)
      expect(el.displayErrors).toContain(message)
      // The addon keeps its own errors but renders none of its own.
      expect(cur.errors).toContain(message)
      expect(cur.displayErrors).toEqual([])
    })

    test('the addon renders no error block of its own', async () => {
      const { form, cur } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: {
              type: 'select',
              name: 'cur',
              items: ['USD', 'EUR'],
              rules: 'required',
            },
          },
        }),
      })

      await cur.validate()
      await flushPromises()

      const message = cur.errors[0]
      const addon = form.findComponent({ name: 'VfSelect' })

      expect(addon.html()).not.toContain(message)
      expect(form.html()).toContain(message)
    })

    test('host shows its own and the adopted errors together', async () => {
      const { el, cur } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            rules: 'required',
            addonBefore: {
              type: 'select',
              name: 'cur',
              items: ['USD', 'EUR'],
              rules: 'required',
            },
          },
        }),
      })

      await el.validate()
      await cur.validate()
      await flushPromises()

      expect(el.errors).toContain(el.errors[0])
      expect(el.errors).toContain(cur.errors[0])
    })
  })

  // =========================================================================
  // Ownership: data stays a sibling; the adopter reports errors
  // =========================================================================
  describe('ownership', () => {
    test('addon value persists when the host value changes', () => {
      const { form$, el, cur } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: { type: 'select', name: 'cur', items: ['USD', 'EUR'] },
          },
        }),
      })

      cur.update('EUR')
      el.update('abc')

      expect(form$.model).toMatchObject({ el: 'abc', cur: 'EUR' })
    })

    test('the adopter reports the errors under its own path', async () => {
      const { form$, cur } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: {
              type: 'select',
              name: 'cur',
              items: ['USD', 'EUR'],
              rules: 'required',
            },
          },
        }),
      })

      await form$.validate()
      await flushPromises()

      // The host (adopter) owns the form error; the addon reports nothing.
      expect(form$.errors).toHaveProperty('el')
      expect(form$.errors).not.toHaveProperty('cur')
      expect(form$.errors.el).toContain(cur.errors[0])
      expect(cur.formErrors).toEqual({})
    })

    test('an invalid addon makes the form invalid and blocks submit', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: {
              type: 'select',
              name: 'cur',
              items: ['USD', 'EUR'],
              rules: 'required',
            },
          },
        }),
      })

      await form$.validate()
      await flushPromises()

      expect(form$.invalid).toBe(true)
    })
  })

  // =========================================================================
  // Lifecycle
  // =========================================================================
  describe('lifecycle', () => {
    test('resolving the addon clears the host displayed error', async () => {
      const { el, cur } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            addonBefore: {
              type: 'select',
              name: 'cur',
              items: ['USD', 'EUR'],
              rules: 'required',
            },
          },
        }),
      })

      await cur.validate()
      await flushPromises()

      expect(el.displayErrors.length).toBe(1)

      cur.update('USD')
      await cur.validate()
      await flushPromises()

      expect(el.displayErrors).toEqual([])
    })
  })

  // =========================================================================
  // The `hoist` prop is reactive at runtime
  // =========================================================================
  describe('reactivity', () => {
    test('toggling hoist at runtime moves error ownership', async () => {
      const { form, form$ } = createForm({
        schema: defineSchema({
          group: {
            type: 'group',
            schema: {
              child: { type: 'text', rules: 'required', hoist: true },
            },
          },
        }),
      })

      const group = form$.find('group')
      const child = form$.find('group.child')

      await form$.validate()
      await flushPromises()

      const message = child.errors[0]

      // Pushing: the child surfaces nothing; the group owns the error.
      expect(message).toBeTruthy()
      expect(child.hoisted).toBe(true)
      expect(child.displayErrors).toEqual([])
      expect(child.formErrors).toEqual({})
      expect(group.errors).toContain(message)
      expect(form$.errors).toHaveProperty('group')
      expect(form$.errors).not.toHaveProperty('group.child')

      // Toggle adoption off at runtime.
      await form.setProps({
        schema: defineSchema({
          group: {
            type: 'group',
            schema: {
              child: { type: 'text', rules: 'required', hoist: false },
            },
          },
        }),
      })
      await form$.validate()
      await flushPromises()

      // Released: the child now owns and reports its own error.
      expect(child.hoisted).toBe(false)
      expect(child.displayErrors).toContain(message)
      expect(child.formErrors).toHaveProperty('group.child')
      expect(form$.errors).toHaveProperty('group.child')
    })
  })
})
