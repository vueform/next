import { defineSchema, pathExpressionAdapter } from '@vueform/core'
import { nextTick, ref } from 'vue'

import { createForm } from '../../helpers'

describe('Expressions', () => {
  describe('Expression value', () => {
    it('should sync value from another field', () => {
      const { target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'hello' },
          target: { type: 'text', default: '{source}' },
        }),
      })

      expect(target.model).toBe('hello')
    })

    it('should compute math expression from two fields', () => {
      const { total } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 3 },
          b: { type: 'text', default: 5 },
          total: { type: 'text', default: '{a + b}' },
        }),
      })

      expect(total.model).toBe(8)
    })

    it('should update when referenced field changes', () => {
      const { a, b, total } = createForm({
        schema: defineSchema({
          a: { type: 'text' },
          b: { type: 'text' },
          total: { type: 'text', default: '{a + b}' },
        }),
      })

      a.update(10)
      b.update(5)
      expect(total.model).toBe(15)

      a.update(20)
      expect(total.model).toBe(25)
    })

    it('should resolve multiplication expression', () => {
      const { result } = createForm({
        schema: defineSchema({
          qty: { type: 'text', default: 4 },
          price: { type: 'text', default: 25 },
          result: { type: 'text', default: '{qty * price}' },
        }),
      })

      expect(result.model).toBe(100)
    })

    it('should resolve subtraction expression', () => {
      const { result } = createForm({
        schema: defineSchema({
          total: { type: 'text', default: 100 },
          discount: { type: 'text', default: 15 },
          result: { type: 'text', default: '{total - discount}' },
        }),
      })

      expect(result.model).toBe(85)
    })

    it('should resolve division expression', () => {
      const { result } = createForm({
        schema: defineSchema({
          total: { type: 'text', default: 100 },
          count: { type: 'text', default: 4 },
          result: { type: 'text', default: '{total / count}' },
        }),
      })

      expect(result.model).toBe(25)
    })

    it('should use built-in SUM function in expression value', () => {
      const { total } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 3 },
          b: { type: 'text', default: 7 },
          total: { type: 'text', default: '{SUM(a, b)}' },
        }),
      })

      expect(total.model).toBe(10)
    })

    it('should resolve multi-line expression', () => {
      const { result } = createForm({
        schema: defineSchema({
          status: { type: 'text', default: 'active' },
          result: {
            type: 'text',
            default: `{
              status == 'active'
                ? 'Enabled'
                : status == 'inactive'
                  ? 'Disabled'
                  : 'Unknown'
            }`,
          },
        }),
      })

      expect(result.model).toBe('Enabled')
    })
  })

  describe('Text props', () => {
    it('should resolve expression in label', () => {
      const { name, greeting } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
          greeting: { type: 'text', label: 'Hello {name}' },
        }),
      })

      expect(greeting.label).toBe('Hello John')

      name.update('Jane')
      expect(greeting.label).toBe('Hello Jane')
    })

    it('should resolve expression in help', () => {
      const { total } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 3 },
          b: { type: 'text', default: 5 },
          total: { type: 'text', help: 'Sum is {a + b}' },
        }),
      })

      expect(total.help).toBe('Sum is 8')
    })

    it('should resolve expression in placeholder', () => {
      const { el } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'World' },
          el: { type: 'text', placeholder: 'Enter {name}' },
        }),
      })

      expect(el.placeholder).toBe('Enter World')
    })

    it('should resolve expression in checkbox text', () => {
      const { cb } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'Terms' },
          cb: { type: 'checkbox', text: 'I agree to {name}' },
        }),
      })

      expect(cb.text).toBe('I agree to Terms')
    })

    it('should resolve expression in list addLabel', () => {
      const { items } = createForm({
        schema: defineSchema({
          type: { type: 'text', default: 'item' },
          items: {
            type: 'list',
            addLabel: 'Add {type}',
            flat: true,
            schema: { text: { type: 'text' } },
          },
        }),
      })

      expect(items.addLabel).toBe('Add item')
    })

    it('should resolve expression with built-in function in label', () => {
      const { total } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 2 },
          b: { type: 'text', default: 8 },
          total: { type: 'text', label: 'Total: {SUM(a, b)}' },
        }),
      })

      expect(total.label).toBe('Total: 10')
    })

    it('should resolve multiple expressions in one string', () => {
      const { el } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 3 },
          b: { type: 'text', default: 5 },
          el: { type: 'text', label: '{a} + {b} = {a + b}' },
        }),
      })

      expect(el.label).toBe('3 + 5 = 8')
    })
  })

  describe('Tracking and untracking', () => {
    it('should track expression and update value reactively', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'initial' },
          target: { type: 'text', default: '{source}' },
        }),
      })

      expect(target.model).toBe('initial')

      source.update('updated')
      expect(target.model).toBe('updated')
    })

    it('should untrack on input event', () => {
      const { source, target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'tracked' },
          target: { type: 'text', default: '{source}' },
        }),
      })

      expect(target.model).toBe('tracked')
      expect(target.tracking).toBe(true)

      target.handleInput('manual')
      expect(target.model).toBe('manual')
      expect(target.tracking).toBe(false)

      source.update('changed')
      expect(target.model).toBe('manual')
    })

    it('should not track when expression has no field references', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', default: 'static text' },
        }),
      })

      expect(el.tracking).toBe(false)
    })

    it('should track when expression references another field', () => {
      const { target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'value' },
          target: { type: 'text', default: '{source}' },
        }),
      })

      expect(target.tracking).toBe(true)
    })
  })

  describe('noExpressions prop', () => {
    it('should disable expressions when set on element', () => {
      const { el } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'World' },
          el: { type: 'text', label: 'Hello {name}', noExpressions: true },
        }),
      })

      expect(el.label).toBe('Hello {name}')
    })

    it('should resolve all expressions by default', () => {
      const { el } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'World' },
          el: {
            type: 'text',
            label: 'Hello {name}',
            help: 'Help {name}',
          },
        }),
      })

      expect(el.label).toBe('Hello World')
      expect(el.help).toBe('Help World')
    })

    it('should not affect sibling elements when set on one element', () => {
      const { el, other } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'World' },
          el: { type: 'text', label: 'Hello {name}', noExpressions: true },
          other: { type: 'text', label: 'Hello {name}' },
        }),
      })

      expect(el.label).toBe('Hello {name}')
      expect(other.label).toBe('Hello World')
    })

    it('should not cascade from a container to its children', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'World' },
          wrapper: {
            type: 'group',
            noExpressions: true,
            label: 'Group {name}',
            schema: {
              child: { type: 'text', label: 'Hello {name}' },
            },
          },
        }),
      })

      expect(form$.find('wrapper')?.label).toBe('Group {name}')
      expect(form$.find('wrapper.child')?.label).toBe('Hello World')
    })

    it('should disable expressions for all elements via form-level prop', () => {
      const { el } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'World' },
          el: { type: 'text', label: 'Hello {name}' },
        }),
        noExpressions: true,
      })

      expect(el.label).toBe('Hello {name}')
    })

    it('should not let an element override the form-level prop', () => {
      const { el } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'World' },
          el: { type: 'text', label: 'Hello {name}', noExpressions: false },
        }),
        noExpressions: true,
      })

      expect(el.label).toBe('Hello {name}')
    })

    it('should disable default-value tracking on the element', () => {
      const { target } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 'hello' },
          target: { type: 'text', default: '{source}', noExpressions: true },
        }),
      })

      expect(target.model).toBe('{source}')
    })
  })

  describe('Whitelist config', () => {
    it('should restrict expressions to the listed keys', () => {
      const { el } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'World' },
            el: {
              type: 'text',
              label: 'Hello {name}',
              help: 'Help {name}',
            },
          }),
        },
        {
          $expression: { whitelist: ['label'] },
        }
      )

      expect(el.label).toBe('Hello World')
      expect(el.help).toBe('Help {name}')
    })

    it('should gate default-value tracking through the whitelist', () => {
      const { target } = createForm(
        {
          schema: defineSchema({
            source: { type: 'text', default: 'hello' },
            target: { type: 'text', default: '{source}' },
          }),
        },
        {
          $expression: { whitelist: ['label'] },
        }
      )

      expect(target.model).toBe('{source}')
    })

    it('should match RegExp members against the key', () => {
      const { el } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'World' },
            el: {
              type: 'text',
              label: 'Hello {name}',
              help: 'Help {name}',
            },
          }),
        },
        {
          $expression: { whitelist: [/^lab/] },
        }
      )

      expect(el.label).toBe('Hello World')
      expect(el.help).toBe('Help {name}')
    })

    it('should match every key with a standalone `*`', () => {
      const { el } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'World' },
            el: {
              type: 'text',
              label: 'Hello {name}',
              help: 'Help {name}',
            },
          }),
        },
        {
          $expression: { whitelist: ['*'] },
        }
      )

      expect(el.label).toBe('Hello World')
      expect(el.help).toBe('Help World')
    })

    it('should match key prefixes and suffixes with `*` members', () => {
      const { el } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'World' },
            el: {
              type: 'text',
              label: 'Hello {name}',
              help: 'Help {name}',
              placeholder: 'Type {name}',
            },
          }),
        },
        {
          $expression: { whitelist: ['lab*', '*lp'] },
        }
      )

      expect(el.label).toBe('Hello World')
      expect(el.help).toBe('Help World')
      expect(el.placeholder).toBe('Type {name}')
    })

    it('should disable all expressions when config enabled is false', () => {
      const { el } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'World' },
            el: {
              type: 'text',
              label: 'Hello {name}',
              default: '{name}',
            },
          }),
        },
        {
          $expression: { enabled: false },
        }
      )

      expect(el.label).toBe('Hello {name}')
    })
  })

  describe('Consts', () => {
    it('should resolve a string const in expression', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'Hello {userName}' },
        }),
        consts: {
          userName: 'Alice',
        },
      })

      expect(el.label).toBe('Hello Alice')
    })

    it('should resolve a numeric const in expression value', () => {
      const { el } = createForm({
        schema: defineSchema({
          price: { type: 'text', default: 50 },
          el: { type: 'text', default: '{price * taxRate}' },
        }),
        consts: {
          taxRate: '1.2',
        },
      })

      expect(el.model).toBe(60)
    })

    it('should resolve multiple consts', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: '{greeting} {name}!' },
        }),
        consts: {
          greeting: 'Welcome',
          name: 'Bob',
        },
      })

      expect(el.label).toBe('Welcome Bob!')
    })

    it('should allow form data to override consts', () => {
      const { el } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'FormValue' },
          el: { type: 'text', label: 'Hello {name}' },
        }),
        consts: {
          name: 'ConstValue',
        },
      })

      expect(el.label).toBe('Hello FormValue')
    })

    it('should use const when no element with same name exists', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'Tax: {taxRate}%' },
        }),
        consts: {
          taxRate: '21',
        },
      })

      expect(el.label).toBe('Tax: 21%')
    })

    it('should resolve ref-based consts reactively', async () => {
      const taxRate = ref('10')

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'Tax: {taxRate}%' },
        }),
        consts: {
          taxRate,
        },
      })

      expect(el.label).toBe('Tax: 10%')

      taxRate.value = '20'
      await nextTick()
      expect(el.label).toBe('Tax: 20%')
    })

    it('should resolve function-based consts with form context', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'Count: {elementCount}' },
          other: { type: 'text' },
        }),
        consts: {
          elementCount: (form$: any) => String(Object.keys(form$.model).length),
        },
      })

      expect(el.label).toBe('Count: 2')
    })

    it('should resolve consts in expression default value', () => {
      const { el } = createForm({
        schema: defineSchema({
          price: { type: 'text', default: 100 },
          el: { type: 'text', default: '{price * discount}' },
        }),
        consts: {
          discount: '0.8',
        },
      })

      expect(el.model).toBe(80)
    })

    it('should resolve consts in text props but not in conditions', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'Threshold: {threshold}' },
        }),
        consts: {
          threshold: '70',
        },
      })

      expect(el.label).toBe('Threshold: 70')
    })

    it('should update when reactive consts change and elements use them in default', async () => {
      const multiplier = ref('2')

      const { el } = createForm({
        schema: defineSchema({
          source: { type: 'text', default: 5 },
          el: { type: 'text', default: '{source * multiplier}' },
        }),
        consts: {
          multiplier,
        },
      })

      expect(el.model).toBe(10)

      multiplier.value = '3'
      await nextTick()
      expect(el.model).toBe(15)
    })

    it('should use consts together with built-in functions', () => {
      const { el } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 10 },
          b: { type: 'text', default: 20 },
          el: { type: 'text', default: '{SUM(a, b) * factor}' },
        }),
        consts: {
          factor: '2',
        },
      })

      expect(el.model).toBe(60)
    })

    it('should not resolve consts when expressions are disabled', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'Hello {name}', noExpressions: true },
        }),
        consts: {
          name: 'Alice',
        },
      })

      expect(el.label).toBe('Hello {name}')
    })

    it('should ignore form consts when localConsts is disabled', () => {
      const { el } = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Hello {name}' },
          }),
          consts: {
            name: 'Alice',
          },
        },
        {
          $expression: { localConsts: false },
        }
      )

      // The const is withheld, so the reference resolves empty.
      expect(el.label).toBe('Hello ')
    })

    it('should keep config consts when localConsts is disabled', () => {
      const { el } = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Hello {name}' },
          }),
          consts: {
            name: 'Nobody',
          },
        },
        {
          $expression: { localConsts: false, consts: { name: 'Alice' } },
        }
      )

      expect(el.label).toBe('Hello Alice')
    })

    it('should keep config consts when the form defines the same name', () => {
      const { el } = createForm(
        {
          schema: defineSchema({
            price: { type: 'text', default: 100 },
            el: { type: 'text', default: '{price * taxRate}' },
          }),
          consts: {
            taxRate: '0.5',
          },
        },
        {
          $expression: {
            consts: {
              taxRate: 0.2,
            },
          },
        }
      )

      expect(el.model).toBe(20)
    })

    it('should keep form consts that do not collide with config consts', () => {
      const { el } = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: '{greeting} {taxRate}' },
          }),
          consts: {
            greeting: 'Tax',
            taxRate: '99',
          },
        },
        {
          $expression: {
            consts: {
              taxRate: 21,
            },
          },
        }
      )

      expect(el.label).toBe('Tax 21')
    })
  })

  describe('Expression conditions', () => {
    it('should evaluate string condition as expression', () => {
      const { trigger, target } = createForm({
        schema: defineSchema({
          trigger: { type: 'text' },
          target: { type: 'text', conditions: 'trigger == "show"' },
        }),
      })

      expect(target.available).toBe(false)

      trigger.update('show')
      expect(target.available).toBe(true)

      trigger.update('hide')
      expect(target.available).toBe(false)
    })

    it('should evaluate comparison condition with numbers', () => {
      const { age, content } = createForm({
        schema: defineSchema({
          age: { type: 'text' },
          content: { type: 'text', conditions: 'age >= 18' },
        }),
      })

      expect(content.available).toBe(false)

      age.update(18)
      expect(content.available).toBe(true)

      age.update(10)
      expect(content.available).toBe(false)
    })

    it('should support AND operator in conditions', () => {
      const { a, b, target } = createForm({
        schema: defineSchema({
          a: { type: 'text' },
          b: { type: 'text' },
          target: { type: 'text', conditions: 'a == "yes" AND b == "yes"' },
        }),
      })

      expect(target.available).toBe(false)

      a.update('yes')
      expect(target.available).toBe(false)

      b.update('yes')
      expect(target.available).toBe(true)
    })

    it('should support OR operator in conditions', () => {
      const { role, panel } = createForm({
        schema: defineSchema({
          role: { type: 'text' },
          panel: {
            type: 'text',
            conditions: 'role == "admin" OR role == "superadmin"',
          },
        }),
      })

      expect(panel.available).toBe(false)

      role.update('admin')
      expect(panel.available).toBe(true)

      role.update('superadmin')
      expect(panel.available).toBe(true)

      role.update('user')
      expect(panel.available).toBe(false)
    })

    it('should evaluate NOT_EMPTY function in condition', () => {
      const { name, greeting } = createForm({
        schema: defineSchema({
          name: { type: 'text' },
          greeting: { type: 'text', conditions: 'NOT_EMPTY(name)' },
        }),
      })

      expect(greeting.available).toBe(false)

      name.update('John')
      expect(greeting.available).toBe(true)
    })

    it('should warn and resolve as unavailable when expression conditions are used without the plugin', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { target, greeting } = createForm(
        {
          schema: defineSchema({
            trigger: { type: 'text', default: 'show' },
            greeting: { type: 'text', label: 'Hello, {trigger}' },
            target: { type: 'text', conditions: 'trigger == "show"' },
          }),
        },
        { plugins: [], $expression: { adapter: pathExpressionAdapter } }
      )

      expect(greeting.label).toBe('Hello, show')
      expect(target.available).toBe(false)

      const engineWarns = warn.mock.calls.filter(
        (c) =>
          typeof c[0] === 'string' &&
          c[0].includes('require an expression engine')
      )

      // Deduplicated: warns once even though the condition evaluates repeatedly
      expect(engineWarns).toHaveLength(1)

      warn.mockRestore()
    })
  })

  describe('Built-in functions', () => {
    it('should compute SUM', () => {
      const { result } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 10 },
          b: { type: 'text', default: 20 },
          result: { type: 'text', default: '{SUM(a, b)}' },
        }),
      })

      expect(result.model).toBe(30)
    })

    it('should compute AVG', () => {
      const { result } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 10 },
          b: { type: 'text', default: 20 },
          result: { type: 'text', default: '{AVG(a, b)}' },
        }),
      })

      expect(result.model).toBe(15)
    })

    it('should compute MIN', () => {
      const { result } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 10 },
          b: { type: 'text', default: 3 },
          c: { type: 'text', default: 25 },
          result: { type: 'text', default: '{MIN(a, b, c)}' },
        }),
      })

      expect(result.model).toBe(3)
    })

    it('should compute MAX', () => {
      const { result } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 10 },
          b: { type: 'text', default: 3 },
          c: { type: 'text', default: 25 },
          result: { type: 'text', default: '{MAX(a, b, c)}' },
        }),
      })

      expect(result.model).toBe(25)
    })

    it('should compute ROUND', () => {
      const { result } = createForm({
        schema: defineSchema({
          val: { type: 'text', default: 3.14159 },
          result: { type: 'text', default: '{ROUND(val, 2)}' },
        }),
      })

      expect(result.model).toBe(3.14)
    })

    it('should compute COUNT of non-empty numeric values', () => {
      const { result } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 5 },
          b: { type: 'text' },
          c: { type: 'text', default: 10 },
          result: { type: 'text', default: '{COUNT(a, b, c)}' },
        }),
      })

      expect(result.model).toBe(2)
    })

    it('should compute NOT', () => {
      const { result } = createForm({
        schema: defineSchema({
          val: { type: 'text', default: '' },
          result: { type: 'text', label: '{NOT(val)}' },
        }),
      })

      expect(result.label).toBe('true')
    })

    it('should compute EMPTY', () => {
      const { val, result } = createForm({
        schema: defineSchema({
          val: { type: 'text' },
          result: { type: 'text', label: '{EMPTY(val)}' },
        }),
      })

      expect(result.label).toBe('true')

      val.update('hello')
      expect(result.label).toBe('false')
    })

    it('should compute NOT_EMPTY', () => {
      const { result } = createForm({
        schema: defineSchema({
          val: { type: 'text', default: 'hello' },
          result: { type: 'text', label: '{NOT_EMPTY(val)}' },
        }),
      })

      expect(result.label).toBe('true')
    })
  })

  describe('Edge cases', () => {
    it('should not resolve escaped expression but consume its backslash', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: '\\{not_an_expression}' },
        }),
      })

      expect(el.label).toBe('{not_an_expression}')
    })

    it('should resolve unescaped expression while preserving escaped ones', () => {
      const { el } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
          el: { type: 'text', label: 'Hello \\{literal} from {name}' },
        }),
      })

      expect(el.label).toBe('Hello {literal} from John')
    })

    it('should resolve null/undefined field to empty string in text', () => {
      const { el } = createForm({
        schema: defineSchema({
          missing: { type: 'text' },
          el: { type: 'text', label: 'Value: {missing}' },
        }),
      })

      expect(el.label).toBe('Value: ')
    })

    it('should handle NaN result as zero in expression value', () => {
      const { result } = createForm({
        schema: defineSchema({
          a: { type: 'text', default: 'not_a_number' },
          result: { type: 'text', default: '{a + 1}' },
        }),
      })

      expect(result.model).toBe(0)
    })
  })

  describe('Wildcard expressions in lists', () => {
    describe('Single-level list (one *)', () => {
      it('should compute expression referencing siblings in same row', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              initial: 1,
              schema: {
                quantity: { type: 'text', default: 5 },
                price: { type: 'text', default: 10 },
                total: {
                  type: 'text',
                  default: '{items.*.quantity * items.*.price}',
                },
              },
            },
          }),
        })

        expect(form$.find('items.0.total')?.model).toBe(50)
      })

      it('should compute expression value with SUM across siblings', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              initial: 1,
              schema: {
                a: { type: 'text', default: 3 },
                b: { type: 'text', default: 7 },
                sum: { type: 'text', default: '{SUM(items.*.a, items.*.b)}' },
              },
            },
          }),
        })

        expect(form$.find('items.0.sum')?.model).toBe(10)
      })

      it('should update when sibling changes', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              initial: 1,
              schema: {
                quantity: { type: 'text', default: 2 },
                price: { type: 'text', default: 10 },
                total: {
                  type: 'text',
                  default: '{items.*.quantity * items.*.price}',
                },
              },
            },
          }),
        })

        expect(form$.find('items.0.total')?.model).toBe(20)

        form$.find('items.0.quantity')?.update(5)
        expect(form$.find('items.0.total')?.model).toBe(50)

        form$.find('items.0.price')?.update(3)
        expect(form$.find('items.0.total')?.model).toBe(15)
      })

      it('should compute independently for multiple rows', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              modelValue: [
                { a: 2, b: 3 },
                { a: 10, b: 20 },
              ],
              schema: {
                a: { type: 'text' },
                b: { type: 'text' },
                sum: { type: 'text', default: '{items.*.a + items.*.b}' },
              },
            },
          }),
        })

        expect(form$.find('items.0.sum')?.model).toBe(5)
        expect(form$.find('items.1.sum')?.model).toBe(30)
      })

      it('should compute expression for newly added rows', async () => {
        const { form$, items } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              initial: 1,
              schema: {
                a: { type: 'text', default: 1 },
                b: { type: 'text', default: 2 },
                sum: { type: 'text', default: '{items.*.a + items.*.b}' },
              },
            },
          }),
        })

        expect(form$.find('items.0.sum')?.model).toBe(3)

        await items.add()
        expect(form$.find('items.1.sum')?.model).toBe(3)

        form$.find('items.1.a')?.update(10)
        form$.find('items.1.b')?.update(20)
        expect(form$.find('items.1.sum')?.model).toBe(30)
        expect(form$.find('items.0.sum')?.model).toBe(3)
      })

      it('should keep remaining rows correct after removing a row', async () => {
        const { form$, items } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              modelValue: [
                { a: 1, b: 2 },
                { a: 10, b: 20 },
                { a: 100, b: 200 },
              ],
              schema: {
                a: { type: 'text' },
                b: { type: 'text' },
                sum: { type: 'text', default: '{items.*.a + items.*.b}' },
              },
            },
          }),
        })

        expect(form$.find('items.0.sum')?.model).toBe(3)
        expect(form$.find('items.1.sum')?.model).toBe(30)
        expect(form$.find('items.2.sum')?.model).toBe(300)

        items.remove(1)
        await nextTick()

        expect(form$.find('items.0.sum')?.model).toBe(3)
        expect(form$.find('items.1.sum')?.model).toBe(300)
      })

      it('should keep remaining rows correct after removing the first row', async () => {
        const { form$, items } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              modelValue: [
                { a: 1, b: 2 },
                { a: 10, b: 20 },
              ],
              schema: {
                a: { type: 'text' },
                b: { type: 'text' },
                sum: { type: 'text', default: '{items.*.a + items.*.b}' },
              },
            },
          }),
        })

        expect(form$.find('items.0.sum')?.model).toBe(3)
        expect(form$.find('items.1.sum')?.model).toBe(30)

        items.remove(0)
        await nextTick()

        expect(form$.model.items).toHaveLength(1)
        expect(form$.find('items.0.sum')?.model).toBe(30)
      })

      it('should evaluate condition with wildcard referencing sibling', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              initial: 1,
              schema: {
                trigger: { type: 'text', default: 'show' },
                target: {
                  type: 'text',
                  conditions: 'items.*.trigger == "show"',
                },
              },
            },
          }),
        })

        expect(form$.find('items.0.target')?.available).toBe(true)

        form$.find('items.0.trigger')?.update('hide')
        expect(form$.find('items.0.target')?.available).toBe(false)
      })

      it('should evaluate NOT_EMPTY condition with wildcard', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              initial: 1,
              schema: {
                name: { type: 'text' },
                greeting: {
                  type: 'text',
                  conditions: 'NOT_EMPTY(items.*.name)',
                },
              },
            },
          }),
        })

        expect(form$.find('items.0.greeting')?.available).toBe(false)

        form$.find('items.0.name')?.update('John')
        expect(form$.find('items.0.greeting')?.available).toBe(true)
      })

      it('should evaluate conditions independently for multiple rows', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              modelValue: [
                { trigger: 'show' },
                { trigger: 'hide' },
                { trigger: 'show' },
              ],
              schema: {
                trigger: { type: 'text' },
                target: {
                  type: 'text',
                  conditions: 'items.*.trigger == "show"',
                },
              },
            },
          }),
        })

        expect(form$.find('items.0.target')?.available).toBe(true)
        expect(form$.find('items.1.target')?.available).toBe(false)
        expect(form$.find('items.2.target')?.available).toBe(true)
      })

      it('should evaluate conditions correctly after adding a row', async () => {
        const { form$, items } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              modelValue: [{ trigger: 'show' }],
              schema: {
                trigger: { type: 'text' },
                target: {
                  type: 'text',
                  conditions: 'items.*.trigger == "show"',
                },
              },
            },
          }),
        })

        expect(form$.find('items.0.target')?.available).toBe(true)

        await items.add()
        form$.find('items.1.trigger')?.update('show')
        expect(form$.find('items.1.target')?.available).toBe(true)

        form$.find('items.1.trigger')?.update('hide')
        expect(form$.find('items.1.target')?.available).toBe(false)
        expect(form$.find('items.0.target')?.available).toBe(true)
      })

      it('should evaluate conditions correctly after removing a row', async () => {
        const { form$, items } = createForm({
          schema: defineSchema({
            items: {
              type: 'list',
              modelValue: [
                { trigger: 'show' },
                { trigger: 'hide' },
                { trigger: 'show' },
              ],
              schema: {
                trigger: { type: 'text' },
                target: {
                  type: 'text',
                  conditions: 'items.*.trigger == "show"',
                },
              },
            },
          }),
        })

        expect(form$.find('items.0.target')?.available).toBe(true)
        expect(form$.find('items.1.target')?.available).toBe(false)
        expect(form$.find('items.2.target')?.available).toBe(true)

        items.remove(1)
        await nextTick()

        expect(form$.model.items).toHaveLength(2)
        expect(form$.find('items.0.target')?.available).toBe(true)
        expect(form$.find('items.1.target')?.available).toBe(true)
      })
    })

    describe('Doubly-nested list (two *)', () => {
      it('should compute expression value in doubly-nested list', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            outer: {
              type: 'list',
              initial: 1,
              schema: {
                inner: {
                  type: 'list',
                  initial: 1,
                  schema: {
                    a: { type: 'text', default: 4 },
                    b: { type: 'text', default: 6 },
                    sum: {
                      type: 'text',
                      default: '{outer.*.inner.*.a + outer.*.inner.*.b}',
                    },
                  },
                },
              },
            },
          }),
        })

        expect(form$.find('outer.0.inner.0.sum')?.model).toBe(10)
      })

      it('should update doubly-nested expression when sibling changes', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            outer: {
              type: 'list',
              initial: 1,
              schema: {
                inner: {
                  type: 'list',
                  initial: 1,
                  schema: {
                    quantity: { type: 'text', default: 3 },
                    price: { type: 'text', default: 10 },
                    total: {
                      type: 'text',
                      default:
                        '{outer.*.inner.*.quantity * outer.*.inner.*.price}',
                    },
                  },
                },
              },
            },
          }),
        })

        expect(form$.find('outer.0.inner.0.total')?.model).toBe(30)

        form$.find('outer.0.inner.0.quantity')?.update(7)
        expect(form$.find('outer.0.inner.0.total')?.model).toBe(70)
      })

      it('should compute independently across multiple inner rows', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            outer: {
              type: 'list',
              modelValue: [
                {
                  inner: [
                    { a: 1, b: 2 },
                    { a: 10, b: 20 },
                  ],
                },
              ],
              schema: {
                inner: {
                  type: 'list',
                  schema: {
                    a: { type: 'text' },
                    b: { type: 'text' },
                    sum: {
                      type: 'text',
                      default: '{outer.*.inner.*.a + outer.*.inner.*.b}',
                    },
                  },
                },
              },
            },
          }),
        })

        expect(form$.find('outer.0.inner.0.sum')?.model).toBe(3)
        expect(form$.find('outer.0.inner.1.sum')?.model).toBe(30)

        form$.find('outer.0.inner.1.a')?.update(100)
        expect(form$.find('outer.0.inner.0.sum')?.model).toBe(3)
        expect(form$.find('outer.0.inner.1.sum')?.model).toBe(120)
      })

      it('should compute independently across multiple outer rows', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            outer: {
              type: 'list',
              modelValue: [
                { inner: [{ a: 1, b: 2 }] },
                { inner: [{ a: 10, b: 20 }] },
              ],
              schema: {
                inner: {
                  type: 'list',
                  schema: {
                    a: { type: 'text' },
                    b: { type: 'text' },
                    sum: {
                      type: 'text',
                      default: '{outer.*.inner.*.a + outer.*.inner.*.b}',
                    },
                  },
                },
              },
            },
          }),
        })

        expect(form$.find('outer.0.inner.0.sum')?.model).toBe(3)
        expect(form$.find('outer.1.inner.0.sum')?.model).toBe(30)
      })

      it('should compute expression for newly added inner rows', async () => {
        const { form$ } = createForm({
          schema: defineSchema({
            outer: {
              type: 'list',
              initial: 1,
              schema: {
                inner: {
                  type: 'list',
                  initial: 1,
                  schema: {
                    a: { type: 'text', default: 5 },
                    b: { type: 'text', default: 3 },
                    sum: {
                      type: 'text',
                      default: '{outer.*.inner.*.a + outer.*.inner.*.b}',
                    },
                  },
                },
              },
            },
          }),
        })

        expect(form$.find('outer.0.inner.0.sum')?.model).toBe(8)

        const innerList = form$.find('outer.0.inner')
        await innerList?.add()

        expect(form$.find('outer.0.inner.1.sum')?.model).toBe(8)

        form$.find('outer.0.inner.1.a')?.update(10)
        form$.find('outer.0.inner.1.b')?.update(20)

        expect(form$.find('outer.0.inner.0.sum')?.model).toBe(8)
        expect(form$.find('outer.0.inner.1.sum')?.model).toBe(30)
      })

      it('should keep remaining inner rows correct after removing an inner row', async () => {
        const { form$ } = createForm({
          schema: defineSchema({
            outer: {
              type: 'list',
              modelValue: [
                {
                  inner: [
                    { a: 1, b: 2 },
                    { a: 10, b: 20 },
                    { a: 100, b: 200 },
                  ],
                },
              ],
              schema: {
                inner: {
                  type: 'list',
                  schema: {
                    a: { type: 'text' },
                    b: { type: 'text' },
                    sum: {
                      type: 'text',
                      default: '{outer.*.inner.*.a + outer.*.inner.*.b}',
                    },
                  },
                },
              },
            },
          }),
        })

        expect(form$.find('outer.0.inner.0.sum')?.model).toBe(3)
        expect(form$.find('outer.0.inner.1.sum')?.model).toBe(30)
        expect(form$.find('outer.0.inner.2.sum')?.model).toBe(300)

        const innerList = form$.find('outer.0.inner')
        innerList?.remove(1)
        await nextTick()

        expect(form$.model.outer[0].inner).toHaveLength(2)
        expect(form$.find('outer.0.inner.0.sum')?.model).toBe(3)
        expect(form$.find('outer.0.inner.1.sum')?.model).toBe(300)
      })

      it('should keep inner rows correct after removing an outer row', async () => {
        const { form$ } = createForm({
          schema: defineSchema({
            outer: {
              type: 'list',
              modelValue: [
                { inner: [{ a: 1, b: 2 }] },
                { inner: [{ a: 10, b: 20 }] },
              ],
              schema: {
                inner: {
                  type: 'list',
                  schema: {
                    a: { type: 'text' },
                    b: { type: 'text' },
                    sum: {
                      type: 'text',
                      default: '{outer.*.inner.*.a + outer.*.inner.*.b}',
                    },
                  },
                },
              },
            },
          }),
        })

        expect(form$.find('outer.0.inner.0.sum')?.model).toBe(3)
        expect(form$.find('outer.1.inner.0.sum')?.model).toBe(30)

        const outerList = form$.find('outer')
        outerList?.remove(0)
        await nextTick()

        expect(form$.model.outer).toHaveLength(1)
        expect(form$.find('outer.0.inner.0.sum')?.model).toBe(30)
      })

      it('should evaluate condition with two wildcards', () => {
        const { form$ } = createForm({
          schema: defineSchema({
            outer: {
              type: 'list',
              initial: 1,
              schema: {
                inner: {
                  type: 'list',
                  initial: 1,
                  schema: {
                    trigger: { type: 'text', default: 'yes' },
                    target: {
                      type: 'text',
                      conditions: 'outer.*.inner.*.trigger == "yes"',
                    },
                  },
                },
              },
            },
          }),
        })

        expect(form$.find('outer.0.inner.0.target')?.available).toBe(true)

        form$.find('outer.0.inner.0.trigger')?.update('no')
        expect(form$.find('outer.0.inner.0.target')?.available).toBe(false)
      })
    })
  })

  describe('Cross-row aggregation', () => {
    it('should compute SUM across a flat list from outside', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          amounts: {
            type: 'list',
            flat: true,
            initial: 3,
            schema: {
              amount: { type: 'text', default: 10 },
            },
          },
          total: { type: 'text', default: '{SUM(amounts.*)}' },
        }),
      })

      expect(form$.find('total')?.model).toBe(30)
    })

    it('should update a flat-list SUM when a row changes', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          amounts: {
            type: 'list',
            flat: true,
            initial: 3,
            schema: {
              amount: { type: 'text', default: 10 },
            },
          },
          total: { type: 'text', default: '{SUM(amounts.*)}' },
        }),
      })

      expect(form$.find('total')?.model).toBe(30)

      form$.find('amounts.0')?.update(25)
      expect(form$.find('total')?.model).toBe(45)
    })

    it('should update a flat-list SUM after adding a row', async () => {
      const { form$, amounts } = createForm({
        schema: defineSchema({
          amounts: {
            type: 'list',
            flat: true,
            initial: 2,
            schema: {
              amount: { type: 'text', default: 10 },
            },
          },
          total: { type: 'text', default: '{SUM(amounts.*)}' },
        }),
      })

      expect(form$.find('total')?.model).toBe(20)

      await amounts.add()
      expect(form$.find('total')?.model).toBe(30)
    })

    it('should compute SUM across all list rows from outside', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          amounts: {
            type: 'list',
            modelValue: [{ amount: 10 }, { amount: 20 }, { amount: 30 }],
            schema: {
              amount: { type: 'text' },
            },
          },
          total: { type: 'text', default: '{SUM(amounts.*.amount)}' },
        }),
      })

      expect(form$.find('total')?.model).toBe(60)
    })

    it('should update cross-row SUM when a list item changes', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          items: {
            type: 'list',
            modelValue: [{ val: 5 }, { val: 10 }],
            schema: {
              val: { type: 'text' },
            },
          },
          total: { type: 'text', default: '{SUM(items.*.val)}' },
        }),
      })

      expect(form$.find('total')?.model).toBe(15)

      form$.find('items.0.val')?.update(20)
      expect(form$.find('total')?.model).toBe(30)
    })

    it('should compute AVG across all list rows', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          items: {
            type: 'list',
            modelValue: [{ val: 10 }, { val: 20 }, { val: 30 }],
            schema: {
              val: { type: 'text' },
            },
          },
          avg: { type: 'text', default: '{AVG(items.*.val)}' },
        }),
      })

      expect(form$.find('avg')?.model).toBe(20)
    })

    it('should update cross-row SUM after adding a row', async () => {
      const { form$, items } = createForm({
        schema: defineSchema({
          items: {
            type: 'list',
            modelValue: [{ val: 5 }],
            schema: {
              val: { type: 'text', default: 10 },
            },
          },
          total: { type: 'text', default: '{SUM(items.*.val)}' },
        }),
      })

      expect(form$.find('total')?.model).toBe(5)

      await items.add()
      expect(form$.find('total')?.model).toBe(15)
    })

    it('should update cross-row SUM after removing a row', async () => {
      const { form$, items } = createForm({
        schema: defineSchema({
          items: {
            type: 'list',
            modelValue: [{ val: 10 }, { val: 20 }, { val: 30 }],
            schema: {
              val: { type: 'text' },
            },
          },
          total: { type: 'text', default: '{SUM(items.*.val)}' },
        }),
      })

      expect(form$.find('total')?.model).toBe(60)

      items.remove(1)
      await nextTick()

      expect(form$.find('total')?.model).toBe(40)
    })
  })

  describe('Tree-path value references', () => {
    it('should resolve a tree path through a data-less group', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          billing: {
            type: 'group',
            schema: {
              company: { type: 'text', default: 'ACME' },
            },
          },
          echo: { type: 'text', default: '{billing.company}' },
        }),
      })

      expect(form$.find('echo')?.model).toBe('ACME')
    })

    it('should keep resolving the data path through a data-less group', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          billing: {
            type: 'group',
            schema: {
              company: { type: 'text', default: 'ACME' },
            },
          },
          echo: { type: 'text', default: '{company}' },
        }),
      })

      expect(form$.find('echo')?.model).toBe('ACME')
    })

    it('should update when the tree-path referenced field changes', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          billing: {
            type: 'group',
            schema: {
              company: { type: 'text', default: 'ACME' },
            },
          },
          echo: { type: 'text', default: '{billing.company}' },
        }),
      })

      form$.find('billing.company')?.update('Umbrella')
      expect(form$.find('echo')?.model).toBe('Umbrella')
    })

    it('should resolve a tree path in a text prop', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          billing: {
            type: 'group',
            schema: {
              company: { type: 'text', default: 'ACME' },
            },
          },
          greeting: { type: 'text', label: 'Hello {billing.company}' },
        }),
      })

      expect(form$.find('greeting')?.label).toBe('Hello ACME')

      form$.find('billing.company')?.update('Umbrella')
      expect(form$.find('greeting')?.label).toBe('Hello Umbrella')
    })

    it('should compute an aggregate over a list inside a data-less group', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          wrap: {
            type: 'group',
            schema: {
              amounts: {
                type: 'list',
                flat: true,
                initial: 3,
                schema: {
                  amount: { type: 'text', default: 10 },
                },
              },
            },
          },
          total: { type: 'text', default: '{SUM(wrap.amounts.*)}' },
        }),
      })

      expect(form$.find('total')?.model).toBe(30)

      form$.find('wrap.amounts.0')?.update(25)
      expect(form$.find('total')?.model).toBe(45)
    })

    it('should warn in dev when a data path is shadowed by a different tree path', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form$ } = createForm({
        schema: defineSchema({
          billing: {
            type: 'group',
            schema: {
              company: { type: 'text', default: 'TREE' },
            },
          },
          other: {
            type: 'group',
            schema: {
              billing: {
                type: 'group',
                nested: true,
                schema: {
                  company: { type: 'text', default: 'DATA' },
                },
              },
            },
          },
          echo: { type: 'text', default: '{billing.company}' },
        }),
      })

      // The data path wins — unchanged pre-existing precedence.
      expect(form$.find('echo')?.model).toBe('DATA')

      const ambiguityWarns = warn.mock.calls.filter(
        (c) => typeof c[0] === 'string' && c[0].includes('Ambiguous reference')
      )

      expect(ambiguityWarns.length).toBeGreaterThan(0)
      warn.mockRestore()
    })

    it('should not warn when tree and data paths coincide', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form$ } = createForm({
        schema: defineSchema({
          user: {
            type: 'group',
            nested: true,
            schema: {
              name: { type: 'text', default: 'Jane' },
            },
          },
          echo: { type: 'text', default: '{user.name}' },
        }),
      })

      expect(form$.find('echo')?.model).toBe('Jane')

      const ambiguityWarns = warn.mock.calls.filter(
        (c) => typeof c[0] === 'string' && c[0].includes('Ambiguous reference')
      )

      expect(ambiguityWarns).toHaveLength(0)
      warn.mockRestore()
    })

    it('should not resolve a tree-spelled self reference', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          billing: {
            type: 'group',
            schema: {
              loop: { type: 'text', default: '{billing.loop}' },
            },
          },
        }),
      })

      expect(form$.find('billing.loop')?.model).toBeFalsy()
    })
  })

  describe('Debug logging', () => {
    it('should not log warnings when debug is false', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      createForm(
        {
          schema: defineSchema({
            el: { type: 'text', default: '{INVALID_EXPR(}' },
          }),
        },
        {
          $expression: { debug: false },
        }
      )

      const exprWarns = warn.mock.calls.filter(
        (c) => typeof c[0] === 'string' && c[0].includes('[Vueform warn]')
      )

      expect(exprWarns).toHaveLength(0)
      warn.mockRestore()
    })

    it('should not warn when referencing an element registered later', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Drain warnings queued by forms created in earlier tests
      await new Promise((resolve) => setTimeout(resolve, 0))
      warn.mockClear()

      const { source, target } = createForm({
        schema: defineSchema({
          target: { type: 'text', default: '{source}' },
          source: { type: 'text', default: 'hello' },
        }),
      })

      // Warnings are flushed on the next macrotask
      await new Promise((resolve) => setTimeout(resolve, 0))

      const exprWarns = warn.mock.calls.filter(
        (c) =>
          typeof c[0] === 'string' &&
          c[0].includes('Expression error in "source"')
      )

      expect(exprWarns).toHaveLength(0)
      expect(source.model).toBe('hello')
      expect(target.model).toBe('hello')
      warn.mockRestore()
    })

    it('should warn when a referenced element never registers', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Drain warnings queued by forms created in earlier tests
      await new Promise((resolve) => setTimeout(resolve, 0))
      warn.mockClear()

      createForm({
        schema: defineSchema({
          target: { type: 'text', default: '{missing}' },
        }),
      })

      // Warnings are flushed on the next macrotask
      await new Promise((resolve) => setTimeout(resolve, 0))

      const exprWarns = warn.mock.calls.filter(
        (c) =>
          typeof c[0] === 'string' &&
          c[0].includes('Expression error in "missing"')
      )

      expect(exprWarns).toHaveLength(1)
      warn.mockRestore()
    })
  })

  describe('PROP function', () => {
    it('should return element label via PROP()', () => {
      const { target } = createForm({
        schema: defineSchema({
          email: { type: 'text', label: 'Email Address' },
          target: {
            type: 'text',
            default: '{PROP("email", "label")}',
          },
        }),
      })

      expect(target.model).toBe('Email Address')
    })

    it('should return element path via PROP()', () => {
      const { target } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
          target: {
            type: 'text',
            default: '{PROP("email", "path")}',
          },
        }),
      })

      expect(target.model).toBe('email')
    })

    it('should return nested prop via PROP() with dot path', () => {
      const { target } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
          target: {
            type: 'text',
            default: '{PROP("email", "container.type")}',
          },
        }),
      })

      expect(target.model).toBeDefined()
    })

    it('should return empty string for nonexistent element', () => {
      const { target } = createForm({
        schema: defineSchema({
          target: {
            type: 'text',
            default: '{PROP("nonexistent", "label")}',
          },
        }),
      })

      expect(target.model).toBe('')
    })

    it('should return empty string for nonexistent prop', () => {
      const { target } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
          target: {
            type: 'text',
            default: '{PROP("email", "nonexistent")}',
          },
        }),
      })

      expect(target.model).toBe('')
    })

    it('should work in expression conditions', () => {
      const { target } = createForm({
        schema: defineSchema({
          email: { type: 'text', label: 'Work Email' },
          target: {
            type: 'text',
            conditions: 'PROP("email", "label") == "Work Email"',
          },
        }),
      })

      expect(target.available).toBe(true)
    })

    it('should return false in expression conditions when prop does not match', () => {
      const { target } = createForm({
        schema: defineSchema({
          email: { type: 'text', label: 'Personal Email' },
          target: {
            type: 'text',
            conditions: 'PROP("email", "label") == "Work Email"',
          },
        }),
      })

      expect(target.available).toBe(false)
    })

    it('should accept unquoted arguments', () => {
      const { target } = createForm({
        schema: defineSchema({
          email: { type: 'text', label: 'Email Address' },
          target: {
            type: 'text',
            default: '{PROP(email, label)}',
          },
        }),
      })

      expect(target.model).toBe('Email Address')
    })

    it('should accept mixed quoted and unquoted arguments', () => {
      const { target } = createForm({
        schema: defineSchema({
          email: { type: 'text', label: 'Email Address' },
          target: {
            type: 'text',
            default: '{PROP("email", label)}',
          },
        }),
      })

      expect(target.model).toBe('Email Address')
    })
  })

  describe('SELF function', () => {
    it('should return own label via SELF() in help text', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'My Label',
            help: '{SELF("label")}',
          },
        }),
      })

      expect(el.help).toBe('My Label')
    })

    it('should return own path via SELF() in help text', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            help: 'Path: {SELF("path")}',
          },
        }),
      })

      expect(el.help).toBe('Path: el')
    })

    it('should return empty string for nonexistent prop on self', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            help: '{SELF("nonexistent")}',
          },
        }),
      })

      expect(el.help).toBe('')
    })

    it('should work in expression conditions', () => {
      const { shown, hidden } = createForm({
        schema: defineSchema({
          shown: {
            type: 'text',
            label: 'Target Label',
            conditions: 'SELF("label") == "Target Label"',
          },
          hidden: {
            type: 'text',
            label: 'Other Label',
            conditions: 'SELF("label") == "No Match"',
          },
        }),
      })

      expect(shown.available).toBe(true)
      expect(hidden.available).toBe(false)
    })

    it('should resolve to the correct element for each element independently', () => {
      const { a, b } = createForm({
        schema: defineSchema({
          a: {
            type: 'text',
            label: 'Label A',
            help: '{SELF("label")}',
          },
          b: {
            type: 'text',
            label: 'Label B',
            help: '{SELF("label")}',
          },
        }),
      })

      expect(a.help).toBe('Label A')
      expect(b.help).toBe('Label B')
    })

    it('should combine SELF() with other expressions', () => {
      const { el } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'World' },
          el: {
            type: 'text',
            label: 'My Element',
            help: '{SELF("label")}: Hello {name}',
          },
        }),
      })

      expect(el.help).toBe('My Element: Hello World')
    })

    it('should combine SELF() with PROP() in conditions', () => {
      const { target } = createForm({
        schema: defineSchema({
          other: { type: 'text', label: 'Same Label' },
          target: {
            type: 'text',
            label: 'Same Label',
            conditions: 'SELF("label") == PROP("other", "label")',
          },
        }),
      })

      expect(target.available).toBe(true)
    })

    it('should return available prop via SELF() in help text', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            help: '{SELF("available")}',
          },
        }),
      })

      expect(el.help).toBe('true')
    })

    it('should work inside a list with wildcard paths', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          items: {
            type: 'list',
            initial: 2,
            schema: {
              name: {
                type: 'text',
                help: '{SELF("path")}',
              },
            },
          },
        }),
      })

      expect(form$.find('items.0.name')?.help).toBe('items.0.name')
      expect(form$.find('items.1.name')?.help).toBe('items.1.name')
    })

    it('should accept unquoted arguments', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'My Label',
            help: '{SELF(label)}',
          },
        }),
      })

      expect(el.help).toBe('My Label')
    })

    it('should accept unquoted dot-path arguments', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            help: '{SELF(container.type)}',
          },
        }),
      })

      expect(el.help).toBeDefined()
      expect(el.help).not.toBe('')
    })

    it('should accept unquoted SELF and PROP in conditions', () => {
      const { target } = createForm({
        schema: defineSchema({
          other: { type: 'text', label: 'Same Label' },
          target: {
            type: 'text',
            label: 'Same Label',
            conditions: 'SELF(label) == PROP(other, label)',
          },
        }),
      })

      expect(target.available).toBe(true)
    })
  })

  describe('@ shorthand syntax', () => {
    it('should resolve another element prop via path@prop', () => {
      const { target } = createForm({
        schema: defineSchema({
          email: { type: 'text', label: 'Email Address' },
          target: {
            type: 'text',
            default: '{email@label}',
          },
        }),
      })

      expect(target.model).toBe('Email Address')
    })

    it('should resolve nested element path via path@prop', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          nested: {
            type: 'group',
            schema: {
              email: { type: 'text', label: 'Nested Email' },
            },
          },
          target: {
            type: 'text',
            default: '{nested.email@label}',
          },
        }),
      })

      expect(form$.find('target')?.model).toBe('Nested Email')
    })

    it('should resolve dot-path prop via path@prop', () => {
      const { target } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
          target: {
            type: 'text',
            default: '{email@container.type}',
          },
        }),
      })

      expect(target.model).toBeDefined()
      expect(target.model).not.toBe('')
    })

    it('should resolve own prop via @prop', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'My Label',
            help: '{@label}',
          },
        }),
      })

      expect(el.help).toBe('My Label')
    })

    it('should resolve own dot-path prop via @prop', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            help: '{@container.type}',
          },
        }),
      })

      expect(el.help).toBeDefined()
      expect(el.help).not.toBe('')
    })

    it('should return empty string for nonexistent element', () => {
      const { target } = createForm({
        schema: defineSchema({
          target: {
            type: 'text',
            default: '{nonexistent@label}',
          },
        }),
      })

      expect(target.model).toBe('')
    })

    it('should evaluate path@prop in conditions', () => {
      const { target } = createForm({
        schema: defineSchema({
          email: { type: 'text', label: 'Work Email' },
          target: {
            type: 'text',
            conditions: 'email@label == "Work Email"',
          },
        }),
      })

      expect(target.available).toBe(true)
    })

    it('should evaluate @prop in conditions', () => {
      const { shown, hidden } = createForm({
        schema: defineSchema({
          shown: {
            type: 'text',
            label: 'Target Label',
            conditions: '@label == "Target Label"',
          },
          hidden: {
            type: 'text',
            label: 'Other Label',
            conditions: '@label == "No Match"',
          },
        }),
      })

      expect(shown.available).toBe(true)
      expect(hidden.available).toBe(false)
    })

    it('should combine @prop and path@prop in conditions', () => {
      const { target } = createForm({
        schema: defineSchema({
          other: { type: 'text', label: 'Same Label' },
          target: {
            type: 'text',
            label: 'Same Label',
            conditions: '@label == other@label',
          },
        }),
      })

      expect(target.available).toBe(true)
    })

    it('should combine shorthand refs with model paths and text', () => {
      const { el } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'World' },
          el: {
            type: 'text',
            label: 'My Element',
            help: '{@label}: Hello {name}',
          },
        }),
      })

      expect(el.help).toBe('My Element: Hello World')
    })

    it('should not desugar @ inside string literals', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            help: `{'user@example.com'}`,
          },
        }),
      })

      expect(el.help).toBe('user@example.com')
    })

    it('should not desugar @ inside double-quoted string literals', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            help: '{"contact@domain.org"}',
          },
        }),
      })

      expect(el.help).toBe('contact@domain.org')
    })

    it('should resolve numeric list paths via path@prop', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          items: {
            type: 'list',
            initial: 2,
            wrap: false,
            schema: {
              name: { type: 'text' },
            },
          },
          target: {
            type: 'text',
            default: '{items.0.name@path}',
          },
        }),
      })

      expect(form$.find('target')?.model).toBe('items.0.name')
    })

    it('should resolve wildcard paths via path@prop inside a list', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          items: {
            type: 'list',
            initial: 2,
            schema: {
              name: { type: 'text' },
              mirror: {
                type: 'text',
                help: '{items.*.name@path}',
              },
            },
          },
        }),
      })

      expect(form$.find('items.0.mirror')?.help).toBe('items.0.name')
      expect(form$.find('items.1.mirror')?.help).toBe('items.1.name')
    })

    it('should resolve indexed props via @prop[index]', () => {
      const { list } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            flat: true,
            modelValue: [20, 80],
            help: 'Range: {@model[0]} - {@model[1]}',
            schema: {
              value: { type: 'text' },
            },
          },
        }),
      })

      expect(list.help).toBe('Range: 20 - 80')
    })

    it('should resolve indexed props via @prop.index', () => {
      const { list } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            flat: true,
            modelValue: [20, 80],
            help: 'Range: {@model.0} - {@model.1}',
            schema: {
              value: { type: 'text' },
            },
          },
        }),
      })

      expect(list.help).toBe('Range: 20 - 80')
    })

    it('should resolve indexed props via path@prop[index]', () => {
      const { target } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            flat: true,
            modelValue: [20, 80],
            schema: {
              value: { type: 'text' },
            },
          },
          target: {
            type: 'text',
            help: 'Max: {list@model[1]}',
          },
        }),
      })

      expect(target.help).toBe('Max: 80')
    })

    it('should resolve and track path@prop refs in defaults', () => {
      const { range, min, max } = createForm({
        schema: defineSchema({
          range: {
            type: 'list',
            flat: true,
            modelValue: [20, 80],
            schema: {
              value: { type: 'text' },
            },
          },
          min: { type: 'text', default: '{range@model.0}' },
          max: { type: 'text', default: '{range@model[1]}' },
        }),
      })

      expect(min.model).toBe(20)
      expect(max.model).toBe(80)

      range.update([30, 90])

      expect(min.model).toBe(30)
      expect(max.model).toBe(90)
    })

    it('should update reactively when the referenced prop changes', () => {
      const { trigger, other, target } = createForm({
        schema: defineSchema({
          trigger: { type: 'text', default: 'show' },
          other: {
            type: 'text',
            conditions: [['trigger', '==', 'show']],
          },
          target: {
            type: 'text',
            help: '{other@available}',
          },
        }),
      })

      expect(target.help).toBe('true')

      trigger.update('hide')

      expect(other.available).toBe(false)
      expect(target.help).toBe('false')
    })

    it('should resolve refs against the correct elements after list sort', async () => {
      const { form$, list } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            sort: true,
            modelValue: [
              { foo: 'a', bar: 'b' },
              { foo: 'c', bar: 'd' },
            ],
            schema: {
              foo: {
                type: 'text',
                help: 'Self: {@model} Other: {list.*.bar@model}',
              },
              bar: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.find('list.0.foo')?.help).toBe('Self: a Other: b')
      expect(form$.find('list.1.foo')?.help).toBe('Self: c Other: d')

      list.sort(1, 0)
      await nextTick()

      expect(form$.model.list).toEqual([
        { foo: 'c', bar: 'd' },
        { foo: 'a', bar: 'b' },
      ])
      expect(form$.find('list.0.foo')?.model).toBe('c')
      expect(form$.find('list.0.foo')?.help).toBe('Self: c Other: d')
      expect(form$.find('list.1.foo')?.help).toBe('Self: a Other: b')
    })
  })

  describe('Built-in path adapter', () => {
    it('should resolve a top-level path without the plugin', () => {
      const { name, greeting } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'Jane' },
            greeting: { type: 'text', label: 'Hello, {name}' },
          }),
        },
        { plugins: [], $expression: { adapter: pathExpressionAdapter } }
      )

      expect(greeting.label).toBe('Hello, Jane')

      name.update('Ada')
      expect(greeting.label).toBe('Hello, Ada')
    })

    it('should resolve a label path when the referenced field is declared later', () => {
      const { text, text2 } = createForm(
        {
          schema: defineSchema({
            text: { type: 'text', label: '{text2}' },
            text2: { type: 'text', default: 'foo' },
          }),
        },
        { plugins: [], $expression: { adapter: pathExpressionAdapter } }
      )

      expect(text.label).toBe('foo')

      text2.update('bar')
      expect(text.label).toBe('bar')
    })

    it('should resolve a tree path through a data-less group without the plugin', () => {
      const { form$ } = createForm(
        {
          schema: defineSchema({
            billing: {
              type: 'group',
              schema: {
                company: { type: 'text', default: 'ACME' },
              },
            },
            greeting: { type: 'text', label: 'Hello, {billing.company}' },
          }),
        },
        { plugins: [], $expression: { adapter: pathExpressionAdapter } }
      )

      expect(form$.find('greeting')?.label).toBe('Hello, ACME')

      form$.find('billing.company')?.update('Umbrella')
      expect(form$.find('greeting')?.label).toBe('Hello, Umbrella')
    })

    it('should resolve a dotted path without the plugin', () => {
      const { greeting } = createForm(
        {
          schema: defineSchema({
            user: {
              type: 'group',
              nested: true,
              schema: {
                name: { type: 'text', default: 'Jane' },
              },
            },
            greeting: { type: 'text', label: 'Hello, {user.name}' },
          }),
        },
        { plugins: [], $expression: { adapter: pathExpressionAdapter } }
      )

      expect(greeting.label).toBe('Hello, Jane')
    })

    it('should resolve a list index path without the plugin', () => {
      const { greeting } = createForm(
        {
          schema: defineSchema({
            contacts: {
              type: 'list',
              modelValue: [{ name: 'Jane' }],
              schema: {
                name: { type: 'text' },
              },
            },
            greeting: { type: 'text', label: 'Hello, {contacts.0.name}' },
          }),
        },
        { plugins: [], $expression: { adapter: pathExpressionAdapter } }
      )

      expect(greeting.label).toBe('Hello, Jane')
    })

    it('should resolve consts without the plugin', () => {
      const { greeting } = createForm(
        {
          schema: defineSchema({
            greeting: { type: 'text', label: 'Hello, {userName}' },
          }),
          consts: {
            userName: 'Alice',
          },
        },
        { plugins: [], $expression: { adapter: pathExpressionAdapter } }
      )

      expect(greeting.label).toBe('Hello, Alice')
    })

    it('should leave escaped braces literal without the plugin', () => {
      const { greeting } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'Jane' },
            greeting: {
              type: 'text',
              label: 'Hello \\{name} and {name}',
            },
          }),
        },
        { plugins: [], $expression: { adapter: pathExpressionAdapter } }
      )

      expect(greeting.label).toBe('Hello {name} and Jane')
    })

    it('should keep unsupported expressions literal without the plugin', () => {
      const { total } = createForm(
        {
          schema: defineSchema({
            price: { type: 'text', default: 10 },
            quantity: { type: 'text', default: 2 },
            total: {
              type: 'text',
              label: 'Total: {price * quantity}',
            },
          }),
        },
        { plugins: [], $expression: { adapter: pathExpressionAdapter } }
      )

      expect(total.label).toBe('Total: {price * quantity}')
    })

    it('should track a default-value path without the plugin', () => {
      const { name, greeting } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'Jane' },
            greeting: { type: 'text', default: '{name}' },
          }),
        },
        { plugins: [], $expression: { adapter: pathExpressionAdapter } }
      )

      expect(greeting.model).toBe('Jane')

      name.update('Ada')
      expect(greeting.model).toBe('Ada')
    })
  })
})
