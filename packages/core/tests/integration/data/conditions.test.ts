import { nextTick, reactive, ref } from 'vue'

import { defineSchema } from '#core'
import expression from '#expr-eval'

import { createForm, flushPromises } from '../../helpers'

const expressionConfig = { plugins: [expression()] }

// All async condition tests evaluate with `$conditions.debounce: 0` unless they
// specifically exercise debouncing, so the version counter bumps immediately
// when its trigger source changes.
const noDebounce = { $conditions: { debounce: 0 } }

describe('Conditions', () => {
  describe('Structured Conditions', () => {
    describe('Equality Operators', () => {
      it('should show element when == condition is met', () => {
        const { trigger, target } = createForm({
          schema: defineSchema({
            trigger: { type: 'text', default: 'yes' },
            target: { type: 'text', conditions: [['trigger', '==', 'yes']] },
          }),
        })

        expect(target.available).toBe(true)

        trigger.update('no')
        expect(target.available).toBe(false)
      })

      it('should show element when != condition is met', () => {
        const { trigger, target } = createForm({
          schema: defineSchema({
            trigger: { type: 'text', default: 'no' },
            target: { type: 'text', conditions: [['trigger', '!=', 'yes']] },
          }),
        })

        expect(target.available).toBe(true)

        trigger.update('yes')
        expect(target.available).toBe(false)
      })

      it('should match == with numeric values', () => {
        const { count, target } = createForm({
          schema: defineSchema({
            count: { type: 'text', default: 5 },
            target: { type: 'text', conditions: [['count', '==', 5]] },
          }),
        })

        expect(target.available).toBe(true)

        count.update(3)
        expect(target.available).toBe(false)
      })

      it('should match == with an array of expected values', () => {
        const { status, target } = createForm({
          schema: defineSchema({
            status: { type: 'text', default: 'active' },
            target: {
              type: 'text',
              conditions: [['status', '==', ['active', 'pending']]],
            },
          }),
        })

        expect(target.available).toBe(true)

        status.update('pending')
        expect(target.available).toBe(true)

        status.update('archived')
        expect(target.available).toBe(false)
      })

      it('should match != with an array of expected values', () => {
        const { status, target } = createForm({
          schema: defineSchema({
            status: { type: 'text', default: 'archived' },
            target: {
              type: 'text',
              conditions: [['status', '!=', ['active', 'pending']]],
            },
          }),
        })

        expect(target.available).toBe(true)

        status.update('active')
        expect(target.available).toBe(false)
      })
    })

    describe('Comparison Operators', () => {
      it('should evaluate > operator', () => {
        const { age, target } = createForm({
          schema: defineSchema({
            age: { type: 'text', default: 20 },
            target: { type: 'text', conditions: [['age', '>', 18]] },
          }),
        })

        expect(target.available).toBe(true)

        age.update(18)
        expect(target.available).toBe(false)

        age.update(10)
        expect(target.available).toBe(false)
      })

      it('should evaluate >= operator', () => {
        const { age, target } = createForm({
          schema: defineSchema({
            age: { type: 'text', default: 18 },
            target: { type: 'text', conditions: [['age', '>=', 18]] },
          }),
        })

        expect(target.available).toBe(true)

        age.update(17)
        expect(target.available).toBe(false)
      })

      it('should evaluate < operator', () => {
        const { price, target } = createForm({
          schema: defineSchema({
            price: { type: 'text', default: 50 },
            target: { type: 'text', conditions: [['price', '<', 100]] },
          }),
        })

        expect(target.available).toBe(true)

        price.update(100)
        expect(target.available).toBe(false)

        price.update(150)
        expect(target.available).toBe(false)
      })

      it('should evaluate <= operator', () => {
        const { price, target } = createForm({
          schema: defineSchema({
            price: { type: 'text', default: 100 },
            target: { type: 'text', conditions: [['price', '<=', 100]] },
          }),
        })

        expect(target.available).toBe(true)

        price.update(101)
        expect(target.available).toBe(false)
      })
    })

    describe('Range Operators', () => {
      it('should evaluate between operator', () => {
        const { value, target } = createForm({
          schema: defineSchema({
            value: { type: 'text', default: 5 },
            target: {
              type: 'text',
              conditions: [['value', 'between', [1, 10]]],
            },
          }),
        })

        expect(target.available).toBe(true)

        value.update(10)
        expect(target.available).toBe(false)

        value.update(0)
        expect(target.available).toBe(false)
      })

      it('should evaluate in operator', () => {
        const { color, target } = createForm({
          schema: defineSchema({
            color: { type: 'text', default: 'red' },
            target: {
              type: 'text',
              conditions: [['color', 'in', ['red', 'green', 'blue']]],
            },
          }),
        })

        expect(target.available).toBe(true)

        color.update('yellow')
        expect(target.available).toBe(false)
      })

      it('should evaluate not_in operator', () => {
        const { color, target } = createForm({
          schema: defineSchema({
            color: { type: 'text', default: 'yellow' },
            target: {
              type: 'text',
              conditions: [['color', 'not_in', ['red', 'green', 'blue']]],
            },
          }),
        })

        expect(target.available).toBe(true)

        color.update('red')
        expect(target.available).toBe(false)
      })
    })

    describe('String Operators', () => {
      it('should evaluate ^ (starts with) operator', () => {
        const { text, target } = createForm({
          schema: defineSchema({
            text: { type: 'text', default: 'hello world' },
            target: { type: 'text', conditions: [['text', '^', 'hello']] },
          }),
        })

        expect(target.available).toBe(true)

        text.update('goodbye world')
        expect(target.available).toBe(false)
      })

      it('should evaluate $ (ends with) operator', () => {
        const { text, target } = createForm({
          schema: defineSchema({
            text: { type: 'text', default: 'hello world' },
            target: { type: 'text', conditions: [['text', '$', 'world']] },
          }),
        })

        expect(target.available).toBe(true)

        text.update('hello there')
        expect(target.available).toBe(false)
      })

      it('should evaluate * (contains) operator', () => {
        const { text, target } = createForm({
          schema: defineSchema({
            text: { type: 'text', default: 'foo bar baz' },
            target: { type: 'text', conditions: [['text', '*', 'bar']] },
          }),
        })

        expect(target.available).toBe(true)

        text.update('foo baz')
        expect(target.available).toBe(false)
      })
    })

    describe('Absolute Operators', () => {
      it('should evaluate empty operator', () => {
        const { name, target } = createForm({
          schema: defineSchema({
            name: { type: 'text' },
            target: { type: 'text', conditions: [['name', 'empty']] },
          }),
        })

        expect(target.available).toBe(true)

        name.update('John')
        expect(target.available).toBe(false)
      })

      it('should evaluate not_empty operator', () => {
        const { name, target } = createForm({
          schema: defineSchema({
            name: { type: 'text' },
            target: { type: 'text', conditions: [['name', 'not_empty']] },
          }),
        })

        expect(target.available).toBe(false)

        name.update('John')
        expect(target.available).toBe(true)
      })

      it('should treat null as empty', () => {
        const { target } = createForm({
          schema: defineSchema({
            name: { type: 'text', default: null },
            target: { type: 'text', conditions: [['name', 'empty']] },
          }),
        })

        expect(target.available).toBe(true)
      })
    })
  })

  describe('Ref<boolean> Conditions', () => {
    it('should react to Ref<boolean> changes', () => {
      const show = ref(false)

      const { target } = createForm({
        schema: defineSchema({
          target: { type: 'text', conditions: show },
        }),
      })

      expect(target.available).toBe(false)

      show.value = true
      expect(target.available).toBe(true)

      show.value = false
      expect(target.available).toBe(false)
    })
  })

  describe('Function Conditions', () => {
    it('should evaluate function condition using external reactive state', () => {
      const show = ref(false)

      const { target } = createForm({
        schema: defineSchema({
          target: {
            type: 'text',
            conditions: () => show.value,
          },
        }),
      })

      expect(target.available).toBe(false)

      show.value = true
      expect(target.available).toBe(true)

      show.value = false
      expect(target.available).toBe(false)
    })

    it('should support combining logic inside a single function', () => {
      const condA = ref(true)
      const condB = ref(true)

      const { target } = createForm({
        schema: defineSchema({
          target: {
            type: 'text',
            conditions: () => condA.value && condB.value,
          },
        }),
      })

      expect(target.available).toBe(true)

      condA.value = false
      expect(target.available).toBe(false)

      condA.value = true
      condB.value = false
      expect(target.available).toBe(false)

      condB.value = true
      expect(target.available).toBe(true)
    })
  })

  describe('AND Logic', () => {
    it('should require all structured conditions to be true', () => {
      const { a, b, target } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 'yes' },
          b: { type: 'text', default: 'yes' },
          target: {
            type: 'text',
            conditions: [
              ['a', '==', 'yes'],
              ['b', '==', 'yes'],
            ],
          },
        }),
      })

      expect(target.available).toBe(true)

      a.update('no')
      expect(target.available).toBe(false)

      a.update('yes')
      b.update('no')
      expect(target.available).toBe(false)

      b.update('yes')
      expect(target.available).toBe(true)
    })
  })

  describe('OR Logic', () => {
    it('should show element when any OR condition is true', () => {
      const { role, target } = createForm({
        schema: defineSchema({
          role: { type: 'text', default: 'admin' },
          target: {
            type: 'text',
            conditions: [
              [
                ['role', '==', 'admin'],
                ['role', '==', 'editor'],
              ],
            ],
          },
        }),
      })

      expect(target.available).toBe(true)

      role.update('editor')
      expect(target.available).toBe(true)

      role.update('viewer')
      expect(target.available).toBe(false)
    })
  })

  describe('Expression Conditions', () => {
    it('should evaluate string-based expression condition', () => {
      const { trigger, target } = createForm(
        {
          schema: defineSchema({
            trigger: { type: 'text' },
            target: { type: 'text', conditions: 'trigger == "show"' },
          }),
        },
        expressionConfig
      )

      expect(target.available).toBe(false)

      trigger.update('show')
      expect(target.available).toBe(true)

      trigger.update('hide')
      expect(target.available).toBe(false)
    })

    it('should evaluate numeric expression condition', () => {
      const { age, target } = createForm(
        {
          schema: defineSchema({
            age: { type: 'text' },
            target: { type: 'text', conditions: 'age >= 18' },
          }),
        },
        expressionConfig
      )

      expect(target.available).toBe(false)

      age.update(18)
      expect(target.available).toBe(true)

      age.update(10)
      expect(target.available).toBe(false)
    })

    it('should evaluate NOT_EMPTY function in expression condition', () => {
      const { name, target } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text' },
            target: { type: 'text', conditions: 'NOT_EMPTY(name)' },
          }),
        },
        expressionConfig
      )

      expect(target.available).toBe(false)

      name.update('John')
      expect(target.available).toBe(true)
    })
  })

  describe('Reactivity', () => {
    it('should update availability when referenced field changes', () => {
      const { toggle, target } = createForm({
        schema: defineSchema({
          toggle: { type: 'text', default: 'off' },
          target: { type: 'text', conditions: [['toggle', '==', 'on']] },
        }),
      })

      expect(target.available).toBe(false)

      toggle.update('on')
      expect(target.available).toBe(true)

      toggle.update('off')
      expect(target.available).toBe(false)
    })

    it('should handle rapid updates correctly', () => {
      const { trigger, target } = createForm({
        schema: defineSchema({
          trigger: { type: 'text' },
          target: { type: 'text', conditions: [['trigger', '==', 'show']] },
        }),
      })

      trigger.update('show')
      trigger.update('hide')
      trigger.update('show')
      expect(target.available).toBe(true)

      trigger.update('hide')
      expect(target.available).toBe(false)
    })
  })

  describe('Unavailable Target', () => {
    it('should return false when targeted element does not exist', () => {
      const { target } = createForm({
        schema: defineSchema({
          target: { type: 'text', conditions: [['nonexistent', '==', 'yes']] },
        }),
      })

      expect(target.available).toBe(false)
    })

    it('should return false when targeted element is unavailable', () => {
      const { a, b, target } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: '' },
          b: { type: 'text', conditions: [['a', 'not_empty']] },
          target: { type: 'text', conditions: [['b', 'not_empty']] },
        }),
      })

      expect(b.available).toBe(false)
      expect(target.available).toBe(false)

      a.update('hello')
      expect(b.available).toBe(true)
    })
  })

  describe('Circular References', () => {
    it('should handle two elements with circular structured conditions', () => {
      const { a, b } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 'yes', conditions: [['b', '==', 'yes']] },
          b: { type: 'text', default: 'yes', conditions: [['a', '==', 'yes']] },
        }),
      })

      expect(a.available).toBe(true)
      expect(b.available).toBe(true)

      a.update('no')
      expect(a.available).toBe(true)
      expect(b.available).toBe(false)

      a.update('yes')
      expect(a.available).toBe(true)
      expect(b.available).toBe(true)
    })

    it('should handle circular structured conditions in nested list elements', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            initial: 1,
            schema: {
              a: {
                type: 'text',
                default: 'yes',
                conditions: [['list.*.b', '==', 'yes']],
              },
              b: {
                type: 'text',
                default: 'yes',
                conditions: [['list.*.a', '==', 'yes']],
              },
            },
          },
        }),
      })

      const a = form$.find('list.0.a')
      const b = form$.find('list.0.b')

      expect(a?.available).toBe(true)
      expect(b?.available).toBe(true)

      a?.update('no')
      expect(a?.available).toBe(true)
      expect(b?.available).toBe(false)

      a?.update('yes')
      expect(a?.available).toBe(true)
      expect(b?.available).toBe(true)
    })

    it('should handle circular expression conditions', () => {
      const { a, b } = createForm(
        {
          schema: defineSchema({
            a: {
              type: 'text',
              default: 'yes',
              conditions: [['b', '==', 'yes']],
            },
            b: { type: 'text', default: 'yes', conditions: 'a == "yes"' },
          }),
        },
        expressionConfig
      )

      expect(a.available).toBe(true)
      expect(b.available).toBe(true)

      a.update('no')
      expect(a.available).toBe(true)
      expect(b.available).toBe(false)

      a.update('yes')
      expect(a.available).toBe(true)
      expect(b.available).toBe(true)
    })

    it('should handle circular expression conditions in nested list elements', () => {
      const { form$ } = createForm(
        {
          schema: defineSchema({
            list: {
              type: 'list',
              initial: 1,
              schema: {
                a: {
                  type: 'text',
                  default: 'yes',
                  conditions: [['list.*.b', '==', 'yes']],
                },
                b: {
                  type: 'text',
                  default: 'yes',
                  conditions: 'list.*.a == "yes"',
                },
              },
            },
          }),
        },
        expressionConfig
      )

      const a = form$.find('list.0.a')
      const b = form$.find('list.0.b')

      expect(a?.available).toBe(true)
      expect(b?.available).toBe(true)

      a?.update('no')
      expect(a?.available).toBe(true)
      expect(b?.available).toBe(false)

      a?.update('yes')
      expect(a?.available).toBe(true)
      expect(b?.available).toBe(true)
    })
  })

  describe('Conditions Affecting Request Data', () => {
    it('should exclude unavailable elements from payload', () => {
      const { toggle, form$ } = createForm({
        schema: defineSchema({
          toggle: { type: 'text', default: 'no' },
          secret: {
            type: 'text',
            default: 'hidden',
            conditions: [['toggle', '==', 'yes']],
          },
        }),
      })

      expect(form$.payload).not.toHaveProperty('secret')

      toggle.update('yes')
      expect(form$.payload).toHaveProperty('secret', 'hidden')
    })

    it('should include element in payload when condition becomes true and exclude when false again', () => {
      const { status, form$ } = createForm({
        schema: defineSchema({
          status: { type: 'text', default: '' },
          details: {
            type: 'text',
            default: 'info',
            conditions: [['status', 'not_empty']],
          },
        }),
      })

      expect(form$.payload).not.toHaveProperty('details')

      status.update('active')
      expect(form$.payload).toHaveProperty('details', 'info')

      status.update('')
      expect(form$.payload).not.toHaveProperty('details')
    })
  })

  describe('Negated Conditions', () => {
    describe('Structured Conditions', () => {
      it('should exclude element when { not } condition is met', () => {
        const { trigger, target } = createForm({
          schema: defineSchema({
            trigger: { type: 'text', default: 'blocked' },
            target: {
              type: 'text',
              conditions: { not: [['trigger', '==', 'blocked']] },
            },
          }),
        })

        expect(target.available).toBe(false)

        trigger.update('allowed')
        expect(target.available).toBe(true)
      })

      it('should negate != operator', () => {
        const { status, target } = createForm({
          schema: defineSchema({
            status: { type: 'text', default: 'active' },
            target: {
              type: 'text',
              conditions: { not: [['status', '!=', 'active']] },
            },
          }),
        })

        expect(target.available).toBe(true)

        status.update('archived')
        expect(target.available).toBe(false)

        status.update('active')
        expect(target.available).toBe(true)
      })

      it('should negate empty operator', () => {
        const { name, target } = createForm({
          schema: defineSchema({
            name: { type: 'text' },
            target: {
              type: 'text',
              conditions: { not: [['name', 'empty']] },
            },
          }),
        })

        expect(target.available).toBe(false)

        name.update('John')
        expect(target.available).toBe(true)
      })

      it('should negate AND logic (exclude when ALL match)', () => {
        const { a, b, target } = createForm({
          schema: defineSchema({
            a: { type: 'text', default: 'yes' },
            b: { type: 'text', default: 'yes' },
            target: {
              type: 'text',
              conditions: {
                not: [
                  ['a', '==', 'yes'],
                  ['b', '==', 'yes'],
                ],
              },
            },
          }),
        })

        expect(target.available).toBe(false)

        a.update('no')
        expect(target.available).toBe(true)

        a.update('yes')
        b.update('no')
        expect(target.available).toBe(true)

        b.update('yes')
        expect(target.available).toBe(false)
      })

      it('should negate OR groups (exclude when ANY match)', () => {
        const { role, target } = createForm({
          schema: defineSchema({
            role: { type: 'text', default: 'admin' },
            target: {
              type: 'text',
              conditions: {
                not: [
                  [
                    ['role', '==', 'admin'],
                    ['role', '==', 'editor'],
                  ],
                ],
              },
            },
          }),
        })

        expect(target.available).toBe(false)

        role.update('editor')
        expect(target.available).toBe(false)

        role.update('viewer')
        expect(target.available).toBe(true)
      })
    })

    describe('Ref<boolean> Conditions', () => {
      it('should negate Ref<boolean>', () => {
        const show = ref(true)

        const { target } = createForm({
          schema: defineSchema({
            target: {
              type: 'text',
              conditions: { not: show },
            },
          }),
        })

        expect(target.available).toBe(false)

        show.value = false
        expect(target.available).toBe(true)
      })
    })

    describe('Function Conditions', () => {
      it('should negate function condition', () => {
        const block = ref(true)

        const { target } = createForm({
          schema: defineSchema({
            target: {
              type: 'text',
              conditions: { not: () => block.value },
            },
          }),
        })

        expect(target.available).toBe(false)

        block.value = false
        expect(target.available).toBe(true)
      })
    })

    describe('Expression Conditions', () => {
      it('should negate expression condition', () => {
        const { trigger, target } = createForm(
          {
            schema: defineSchema({
              trigger: { type: 'text', default: 'hide' },
              target: {
                type: 'text',
                conditions: { not: 'trigger == "hide"' },
              },
            }),
          },
          expressionConfig
        )

        expect(target.available).toBe(false)

        trigger.update('show')
        expect(target.available).toBe(true)

        trigger.update('hide')
        expect(target.available).toBe(false)
      })
    })

    describe('Empty Negated Conditions', () => {
      it('should evaluate { not: [] } as unmet (empty conditions are met, negation inverts)', () => {
        const { target } = createForm({
          schema: defineSchema({
            target: {
              type: 'text',
              conditions: { not: [] as any },
            },
          }),
        })

        expect(target.available).toBe(false)
      })
    })

    describe('Conditional Props', () => {
      it('should negate disabled condition', () => {
        const { agree, target } = createForm({
          schema: defineSchema({
            agree: { type: 'checkbox', default: true },
            target: {
              type: 'text',
              disabled: { not: [['agree', '==', true]] },
            },
          }),
        })

        expect(target.disabled).toBe(false)

        agree.update(false)
        expect(target.disabled).toBe(true)
      })

      it('should negate readonly condition', () => {
        const { role, target } = createForm({
          schema: defineSchema({
            role: { type: 'text', default: 'admin' },
            target: {
              type: 'text',
              readonly: { not: [['role', '==', 'admin']] },
            },
          }),
        })

        expect(target.readonly).toBe(false)

        role.update('viewer')
        expect(target.readonly).toBe(true)
      })
    })

    describe('Request Data', () => {
      it('should exclude data when negated condition matches', () => {
        const { status, form$ } = createForm({
          schema: defineSchema({
            status: { type: 'text', default: 'archived' },
            details: {
              type: 'text',
              default: 'info',
              conditions: { not: [['status', '==', 'archived']] },
            },
          }),
        })

        expect(form$.payload).not.toHaveProperty('details')

        status.update('active')
        expect(form$.payload).toHaveProperty('details', 'info')

        status.update('archived')
        expect(form$.payload).not.toHaveProperty('details')
      })
    })

    describe('Circular References', () => {
      it('should handle circular references with negated conditions', () => {
        const { a, b } = createForm({
          schema: defineSchema({
            a: {
              type: 'text',
              default: 'yes',
              conditions: { not: [['b', '==', 'block']] },
            },
            b: {
              type: 'text',
              default: 'yes',
              conditions: { not: [['a', '==', 'block']] },
            },
          }),
        })

        expect(a.available).toBe(true)
        expect(b.available).toBe(true)

        a.update('block')
        expect(a.available).toBe(true)
        expect(b.available).toBe(false)

        a.update('yes')
        expect(a.available).toBe(true)
        expect(b.available).toBe(true)
      })
    })
  })

  describe('Conditions with Validation', () => {
    it('should skip validation for unavailable elements', async () => {
      const { toggle, email, form$ } = createForm({
        schema: defineSchema({
          toggle: { type: 'text', default: 'no' },
          email: {
            type: 'text',
            rules: 'required|email',
            conditions: [['toggle', '==', 'yes']],
          },
        }),
      })

      await form$.validate()
      expect(form$.invalid).toBe(false)

      toggle.update('yes')
      await form$.validate()
      expect(form$.invalid).toBe(true)
      expect(email.invalid).toBe(true)
    })

    it('should re-skip validation when element becomes unavailable again', async () => {
      const { toggle, form$ } = createForm({
        schema: defineSchema({
          toggle: { type: 'text', default: 'yes' },
          email: {
            type: 'text',
            rules: 'required',
            conditions: [['toggle', '==', 'yes']],
          },
        }),
      })

      await form$.validate()
      expect(form$.invalid).toBe(true)

      toggle.update('no')
      await form$.validate()
      expect(form$.invalid).toBe(false)
    })
  })

  describe('Prop-Based Conditions (@prop syntax)', () => {
    it('should evaluate condition against element label prop', () => {
      const { target } = createForm({
        schema: defineSchema({
          text: { type: 'text', label: 'Email' },
          target: { type: 'text', conditions: [['text@label', '==', 'Email']] },
        }),
      })

      expect(target.available).toBe(true)
    })

    it('should evaluate condition against element genericName prop', () => {
      const { target } = createForm({
        schema: defineSchema({
          text: { type: 'text', label: 'Username' },
          target: {
            type: 'text',
            conditions: [['text@genericName', '==', 'Username']],
          },
        }),
      })

      expect(target.available).toBe(true)
    })

    it('should evaluate condition against element available prop', () => {
      const { target } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
          target: {
            type: 'text',
            conditions: [['text@available', '==', true]],
          },
        }),
      })

      expect(target.available).toBe(true)
    })

    it('should evaluate @prop with nested element path', () => {
      const { target } = createForm({
        schema: defineSchema({
          group: {
            type: 'group',
            nested: true,
            schema: {
              text: { type: 'text', label: 'Nested Label' },
            },
          },
          target: {
            type: 'text',
            conditions: [['group.text@label', '==', 'Nested Label']],
          },
        }),
      })

      expect(target.available).toBe(true)
    })

    it('should evaluate != operator on a prop', () => {
      const { target } = createForm({
        schema: defineSchema({
          text: { type: 'text', label: 'Email' },
          target: {
            type: 'text',
            conditions: [['text@label', '!=', 'Wrong']],
          },
        }),
      })

      expect(target.available).toBe(true)
    })

    it('should evaluate empty operator on a prop value', () => {
      const { target } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
          target: {
            type: 'text',
            conditions: [['text@label', 'empty']],
          },
        }),
      })

      expect(target.available).toBe(true)
    })

    it('should evaluate not_empty operator on a prop value', () => {
      const { target } = createForm({
        schema: defineSchema({
          text: { type: 'text', label: 'Has Label' },
          target: {
            type: 'text',
            conditions: [['text@label', 'not_empty']],
          },
        }),
      })

      expect(target.available).toBe(true)
    })

    it('should negate prop condition', () => {
      const { target } = createForm({
        schema: defineSchema({
          text: { type: 'text', label: 'Hide Me' },
          target: {
            type: 'text',
            conditions: { not: [['text@label', '==', 'Hide Me']] },
          },
        }),
      })

      expect(target.available).toBe(false)
    })

    it('should combine prop condition in AND logic with a value condition', () => {
      const { trigger, target } = createForm({
        schema: defineSchema({
          text: { type: 'text', label: 'Email' },
          trigger: { type: 'text', default: 'yes' },
          target: {
            type: 'text',
            conditions: [
              ['text@label', '==', 'Email'],
              ['trigger', '==', 'yes'],
            ],
          },
        }),
      })

      expect(target.available).toBe(true)

      trigger.update('no')
      expect(target.available).toBe(false)
    })

    it('should use prop condition in OR group', () => {
      const { target } = createForm({
        schema: defineSchema({
          text: { type: 'text', label: 'Email' },
          trigger: { type: 'text', default: 'no' },
          target: {
            type: 'text',
            conditions: [
              [
                ['text@label', '==', 'Email'],
                ['trigger', '==', 'yes'],
              ],
            ],
          },
        }),
      })

      expect(target.available).toBe(true)
    })
  })

  describe('Async Conditions', () => {
    describe('Availability', () => {
      it('treats an async condition as unmet until it first resolves, then flips', async () => {
        const gate = ref(true)

        const { trigger, target } = createForm(
          {
            schema: defineSchema({
              trigger: { type: 'text' },
              target: {
                type: 'text',
                conditions: () => Promise.resolve(gate.value),
              },
            }),
          },
          noDebounce
        )

        expect(target.available).toBe(false)

        await flushPromises()
        expect(target.available).toBe(true)

        gate.value = false
        trigger.update('x')
        await nextTick()
        await flushPromises()
        expect(target.available).toBe(false)
      })

      it('re-evaluates on any form model change by default', async () => {
        const gate = ref(false)

        const { other, target } = createForm(
          {
            schema: defineSchema({
              other: { type: 'text' },
              target: {
                type: 'text',
                conditions: () => Promise.resolve(gate.value),
              },
            }),
          },
          noDebounce
        )

        await flushPromises()
        expect(target.available).toBe(false)

        gate.value = true
        other.update('changed')
        await nextTick()
        await flushPromises()
        expect(target.available).toBe(true)
      })

      it('supports negated async conditions ({ not: fn })', async () => {
        const gate = ref(false)

        const { other, target } = createForm(
          {
            schema: defineSchema({
              other: { type: 'text' },
              target: {
                type: 'text',
                conditions: { not: () => Promise.resolve(gate.value) },
              },
            }),
          },
          noDebounce
        )

        await flushPromises()
        expect(target.available).toBe(true)

        gate.value = true
        other.update('x')
        await nextTick()
        await flushPromises()
        expect(target.available).toBe(false)
      })

      it('treats a rejected async condition as unmet', async () => {
        const gate = ref(false)
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const { other, target } = createForm(
          {
            schema: defineSchema({
              other: { type: 'text' },
              target: {
                type: 'text',
                conditions: () =>
                  gate.value
                    ? Promise.reject(new Error('nope'))
                    : Promise.resolve(true),
              },
            }),
          },
          noDebounce
        )

        await flushPromises()
        expect(target.available).toBe(true)

        gate.value = true
        other.update('x')
        await nextTick()
        await flushPromises()
        expect(target.available).toBe(false)

        warn.mockRestore()
      })

      it('discards out-of-order async resolutions (latest wins)', async () => {
        const resolvers: Array<(value: boolean) => void> = []
        const counter = ref(0)

        const { target } = createForm(
          {
            schema: defineSchema({
              target: {
                type: 'text',
                conditionsTrigger: () => counter.value,
                conditions: () =>
                  new Promise<boolean>((resolve) => resolvers.push(resolve)),
              },
            }),
          },
          noDebounce
        )

        await flushPromises()
        const base = resolvers.length

        counter.value++
        await nextTick()
        await flushPromises()

        counter.value++
        await nextTick()
        await flushPromises()

        expect(resolvers.length).toBe(base + 2)

        resolvers[base + 1](true)
        await flushPromises()
        expect(target.available).toBe(true)

        resolvers[base](false)
        await flushPromises()
        expect(target.available).toBe(true)
      })
    })

    describe('Conditions Trigger', () => {
      it('only re-evaluates when a triggered path value changes', async () => {
        const gate = ref(false)

        const { a, b, target } = createForm(
          {
            schema: defineSchema({
              a: { type: 'text' },
              b: { type: 'text' },
              target: {
                type: 'text',
                conditionsTrigger: ['a'],
                conditions: () => Promise.resolve(gate.value),
              },
            }),
          },
          noDebounce
        )

        await flushPromises()
        expect(target.available).toBe(false)

        gate.value = true
        b.update('changed')
        await nextTick()
        await flushPromises()
        expect(target.available).toBe(false)

        a.update('changed')
        await nextTick()
        await flushPromises()
        expect(target.available).toBe(true)
      })

      it('re-evaluates when a function trigger getter changes', async () => {
        const gate = ref(false)
        const counter = ref(0)

        const { target } = createForm(
          {
            schema: defineSchema({
              target: {
                type: 'text',
                conditionsTrigger: () => counter.value,
                conditions: () => Promise.resolve(gate.value),
              },
            }),
          },
          noDebounce
        )

        await flushPromises()
        expect(target.available).toBe(false)

        gate.value = true
        counter.value++
        await nextTick()
        await flushPromises()
        expect(target.available).toBe(true)
      })

      it('re-evaluates when a ref trigger changes', async () => {
        const gate = ref(false)
        const counter = ref(0)

        const { target } = createForm(
          {
            schema: defineSchema({
              target: {
                type: 'text',
                conditionsTrigger: counter,
                conditions: () => Promise.resolve(gate.value),
              },
            }),
          },
          noDebounce
        )

        await flushPromises()
        expect(target.available).toBe(false)

        gate.value = true
        counter.value++
        await nextTick()
        await flushPromises()
        expect(target.available).toBe(true)
      })
    })

    describe('Debounce', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('debounces re-evaluation with the global $conditions.debounce default (300ms)', async () => {
        const gate = ref(false)

        const { trigger, target } = createForm({
          schema: defineSchema({
            trigger: { type: 'text' },
            target: {
              type: 'text',
              conditions: () => Promise.resolve(gate.value),
            },
          }),
        })

        await flushPromises()
        expect(target.available).toBe(false)

        gate.value = true
        trigger.update('x')
        await nextTick()
        await flushPromises()
        expect(target.available).toBe(false)

        vi.advanceTimersByTime(299)
        await flushPromises()
        expect(target.available).toBe(false)

        vi.advanceTimersByTime(1)
        await flushPromises()
        expect(target.available).toBe(true)
      })

      it('lets the conditionsDebounce prop override the global debounce', async () => {
        const gate = ref(false)

        const { trigger, target } = createForm({
          schema: defineSchema({
            trigger: { type: 'text' },
            target: {
              type: 'text',
              conditionsDebounce: 1000,
              conditions: () => Promise.resolve(gate.value),
            },
          }),
        })

        await flushPromises()

        gate.value = true
        trigger.update('x')
        await nextTick()
        await flushPromises()

        vi.advanceTimersByTime(300)
        await flushPromises()
        expect(target.available).toBe(false)

        vi.advanceTimersByTime(700)
        await flushPromises()
        expect(target.available).toBe(true)
      })
    })

    describe('Disabled / Readonly', () => {
      it('resolves an async disabled prop', async () => {
        const gate = ref(true)

        const { trigger, target } = createForm(
          {
            schema: defineSchema({
              trigger: { type: 'text' },
              target: {
                type: 'text',
                disabled: () => Promise.resolve(gate.value),
              },
            }),
          },
          noDebounce
        )

        expect(target.disabled).toBe(false)

        await flushPromises()
        expect(target.disabled).toBe(true)

        gate.value = false
        trigger.update('x')
        await nextTick()
        await flushPromises()
        expect(target.disabled).toBe(false)
      })

      it('resolves an async readonly prop', async () => {
        const gate = ref(true)

        const { trigger, target } = createForm(
          {
            schema: defineSchema({
              trigger: { type: 'text' },
              target: {
                type: 'text',
                readonly: () => Promise.resolve(gate.value),
              },
            }),
          },
          noDebounce
        )

        expect(target.readonly).toBe(false)

        await flushPromises()
        expect(target.readonly).toBe(true)

        gate.value = false
        trigger.update('x')
        await nextTick()
        await flushPromises()
        expect(target.readonly).toBe(false)
      })
    })

    describe('Button Loading', () => {
      it('resolves an async loading prop', async () => {
        const gate = ref(true)

        const { form, trigger } = createForm(
          {
            schema: defineSchema({
              trigger: { type: 'text' },
              submit: {
                type: 'button',
                loading: () => Promise.resolve(gate.value),
              },
            }),
          },
          noDebounce
        )

        const btn = form.findComponent({ name: 'VfButton' }).vm

        expect(btn.loading).toBe(false)

        await flushPromises()
        expect(btn.loading).toBe(true)

        gate.value = false
        trigger.update('x')
        await nextTick()
        await flushPromises()
        expect(btn.loading).toBe(false)
      })
    })

    describe('Matrix Columns', () => {
      it('resolves an async condition on a matrix column', async () => {
        const gate = ref(true)

        const { trigger, matrix } = createForm(
          {
            schema: defineSchema({
              trigger: { type: 'text' },
              matrix: {
                type: 'matrix',
                cols: [
                  { value: 'col_1', label: 'Col 1' },
                  {
                    value: 'col_2',
                    label: 'Col 2',
                    conditions: () => Promise.resolve(gate.value),
                  },
                ],
                rows: [{ value: 'row_1', label: 'Row 1' }],
              },
            }),
          },
          noDebounce
        )

        const col2 = () =>
          matrix.resolvedCols.find((col: any) => col.value === 'col_2')

        expect(col2().available.value).toBe(false)

        await flushPromises()
        expect(col2().available.value).toBe(true)

        gate.value = false
        trigger.update('x')
        await nextTick()
        await flushPromises()
        expect(col2().available.value).toBe(false)
      })
    })

    describe('Runtime Sync/Async Switch', () => {
      it('rebuilds the evaluator when conditions switch from sync to async', async () => {
        const syncGate = ref(true)
        const asyncGate = ref(false)

        const schema = reactive(
          defineSchema({
            trigger: { type: 'text' },
            target: {
              type: 'text',
              conditions: () => syncGate.value,
            },
          })
        )

        const { form$, trigger } = createForm({ schema }, noDebounce)
        const target = () => form$.find('target')

        expect(target().available).toBe(true)

        syncGate.value = false
        await nextTick()
        expect(target().available).toBe(false)
        ;(schema.target as any).conditions = () =>
          Promise.resolve(asyncGate.value)
        await nextTick()
        await flushPromises()
        expect(target().available).toBe(false)

        asyncGate.value = true
        trigger.update('x')
        await nextTick()
        await flushPromises()
        expect(target().available).toBe(true)
      })

      it('rebuilds the evaluator when conditions switch from async to sync', async () => {
        const asyncGate = ref(true)
        const syncGate = ref(false)

        const schema = reactive(
          defineSchema({
            trigger: { type: 'text' },
            target: {
              type: 'text',
              conditions: () => Promise.resolve(asyncGate.value),
            },
          })
        )

        const { form$ } = createForm({ schema }, noDebounce)
        const target = () => form$.find('target')

        await flushPromises()
        expect(target().available).toBe(true)
        ;(schema.target as any).conditions = () => syncGate.value
        await nextTick()
        expect(target().available).toBe(false)

        syncGate.value = true
        await nextTick()
        expect(target().available).toBe(true)
      })
    })

    describe('Validation Rule', () => {
      it('activates an async rule condition only after it resolves true', async () => {
        const gate = ref(false)

        const { form$, trigger, name } = createForm(
          {
            schema: defineSchema({
              trigger: { type: 'text' },
              name: {
                type: 'text',
                rules: [
                  {
                    rules: 'required',
                    $if: () => Promise.resolve(gate.value),
                  },
                ],
              },
            }),
          },
          noDebounce
        )

        await form$.validate()
        await flushPromises()
        expect(name.invalid).toBe(false)

        gate.value = true
        trigger.update('x')
        await nextTick()
        await flushPromises()

        await form$.validate()
        await flushPromises()
        expect(name.invalid).toBe(true)

        name.update('filled')
        await form$.validate()
        await flushPromises()
        expect(name.invalid).toBe(false)
      })
    })
  })
})
