import { nextTick, ref } from 'vue'

import { defineSchema, mergeClass } from '#core'

import { createForm, getClass, makeApp, mountApp } from '../../helpers'

const defaults = {
  root: 'vf-element vf-text vf-offset-label vf-col-12',
  addonGroup: 'vf-addon-group',
  input: 'vf-foo vf-123',
  foo: 'foo',
  bar: 'bar',
  baz: 'baz',
  qux: 'qux',
  quux: 'quux',
  corge: 'corge',
  grault: 'grault',
}

describe('useClasses', () => {
  it('should have default classes', async () => {
    const { form } = createForm({
      schema: defineSchema({
        text: {
          type: 'test',
        },
      }),
    })

    const text = form.findComponent({ name: 'VfTest' })

    expect(getClass(form, { name: 'VfTest' })).toEqual(defaults.root)
    expect(getClass(text, '.vf-foo')).toEqual(defaults.input)
    expect(getClass(text, '.foo')).toEqual(defaults.foo)
  })

  it('prop reclass should take precedence', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'test',
            reclass: {
              root: 'prop',
            },
            presets: ['text1', 'text2'],
          },
        }),
        presets: ['form1', 'form2'],
      },
      {
        defaults: {
          VfTest: {
            reclass: {
              root: 'defaults',
            },
          },
        },
        reclass: {
          VfTest: {
            root: 'reclass',
          },
        },
        presets: {
          form1: {
            $apply: 'VfTest',
            reclass: {
              root: 'form1',
            },
          },
          form2: {
            $apply: 'VfTest',
            reclass: {
              root: 'form2',
            },
          },
          text1: {
            reclass: {
              root: 'text1',
            },
          },
          text2: {
            reclass: {
              root: 'text2',
            },
          },
        },
      }
    )

    expect(getClass(form, { name: 'VfTest' })).toEqual('prop vf-col-12')
  })

  it('direct preset reclass should take precedence', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'test',
            presets: ['text1', 'text2'],
          },
        }),
        presets: ['form1', 'form2'],
      },
      {
        defaults: {
          VfTest: {
            reclass: {
              root: 'defaults',
            },
          },
        },
        reclass: {
          VfTest: {
            root: 'reclass',
          },
        },
        presets: {
          form1: {
            $apply: 'VfTest',
            reclass: {
              root: 'form1',
            },
          },
          form2: {
            $apply: 'VfTest',
            reclass: {
              root: 'form2',
            },
          },
          text1: {
            reclass: {
              root: 'text1',
            },
          },
          text2: {
            reclass: {
              root: 'text2',
            },
          },
        },
      }
    )

    expect(getClass(form, { name: 'VfTest' })).toEqual('text2 vf-col-12')
  })

  it('parent preset reclass should take precedence', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'test',
          },
        }),
        presets: ['form1', 'form2'],
      },
      {
        defaults: {
          VfTest: {
            reclass: {
              root: 'defaults',
            },
          },
        },
        reclass: {
          VfTest: {
            root: 'reclass',
          },
        },
        presets: {
          form1: {
            $apply: 'VfTest',
            reclass: {
              root: 'form1',
            },
          },
          form2: {
            $apply: 'VfTest',
            reclass: {
              root: 'form2',
            },
          },
        },
      }
    )

    expect(getClass(form, { name: 'VfTest' })).toEqual('form2 vf-col-12')
  })

  it('config defaults should take precedence', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'test',
          },
        }),
      },
      {
        defaults: {
          VfTest: {
            reclass: {
              root: 'defaults',
            },
          },
        },
        reclass: {
          VfTest: {
            root: 'reclass',
          },
        },
      }
    )

    expect(getClass(form, { name: 'VfTest' })).toEqual('defaults vf-col-12')
  })

  it('config reclass should take precedence', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'test',
          },
        }),
      },
      {
        reclass: {
          VfTest: {
            root: 'reclass',
          },
        },
      }
    )

    expect(getClass(form, { name: 'VfTest' })).toEqual('reclass vf-col-12')
  })

  it('should merge reclass with config defaults', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'test',
            reclass: {
              foo: 'foo prop',
            },
          },
        }),
      },
      {
        defaults: {
          VfTest: {
            reclass: {
              foo: 'foo defaults',
              bar: 'bar defaults',
            },
          },
        },
      }
    )

    expect(getClass(form, '.foo')).toEqual('foo prop')
    expect(getClass(form, '.bar')).toEqual('bar defaults')
  })

  it('should merge reclass with config reclass', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'test',
            reclass: {
              foo: 'foo prop',
            },
          },
        }),
      },
      {
        reclass: {
          VfTest: {
            foo: 'foo reclass',
            bar: 'bar reclass',
            baz: 'baz reclass',
          },
        },
        defaults: {
          VfTest: {
            reclass: {
              foo: 'foo defaults',
              bar: 'bar defaults',
            },
          },
        },
      }
    )

    expect(getClass(form, '.foo')).toEqual('foo prop')
    expect(getClass(form, '.bar')).toEqual('bar defaults')
    expect(getClass(form, '.baz')).toEqual('baz reclass')
  })

  it('should merge reclass with parent preset', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'test',
            reclass: {
              foo: 'foo prop',
            },
          },
        }),
        presets: ['form1', 'form2'],
      },
      {
        reclass: {
          VfTest: {
            foo: 'foo reclass',
            bar: 'bar reclass',
            baz: 'baz reclass',
            qux: 'qux reclass',
            quux: 'quux reclass',
          },
        },
        defaults: {
          VfTest: {
            reclass: {
              foo: 'foo defaults',
              bar: 'bar defaults',
              baz: 'baz defaults',
              qux: 'qux defaults',
            },
          },
        },
        presets: {
          form1: {
            $apply: 'VfTest',
            reclass: {
              foo: 'foo form1',
              bar: 'bar form1',
              baz: 'baz form1',
            },
          },
          form2: {
            $apply: 'VfTest',
            reclass: {
              foo: 'foo form2',
              bar: 'bar form2',
            },
          },
        },
      }
    )

    expect(getClass(form, '.foo')).toEqual('foo prop')
    expect(getClass(form, '.bar')).toEqual('bar form2')
    expect(getClass(form, '.baz')).toEqual('baz form1')
    expect(getClass(form, '.qux')).toEqual('qux defaults')
    expect(getClass(form, '.quux')).toEqual('quux reclass')
  })

  it('should merge reclass with direct preset', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'test',
            reclass: {
              foo: 'foo prop',
            },
            presets: ['text1', 'text2'],
          },
        }),
        presets: ['form1', 'form2'],
      },
      {
        reclass: {
          VfTest: {
            foo: 'foo reclass',
            bar: 'bar reclass',
            baz: 'baz reclass',
            qux: 'qux reclass',
            quux: 'quux reclass',
            corge: 'corge reclass',
            grault: 'grault reclass',
          },
        },
        defaults: {
          VfTest: {
            reclass: {
              foo: 'foo defaults',
              bar: 'bar defaults',
              baz: 'baz defaults',
              qux: 'qux defaults',
              quux: 'quux defaults',
              corge: 'corge defaults',
            },
          },
        },
        presets: {
          form1: {
            $apply: 'VfTest',
            reclass: {
              foo: 'foo form1',
              bar: 'bar form1',
              baz: 'baz form1',
              qux: 'qux form1',
              quux: 'quux form1',
            },
          },
          form2: {
            $apply: 'VfTest',
            reclass: {
              foo: 'foo form2',
              bar: 'bar form2',
              baz: 'baz form2',
              qux: 'qux form2',
            },
          },
          text1: {
            reclass: {
              foo: 'foo text1',
              bar: 'bar text1',
              baz: 'baz text1',
            },
          },
          text2: {
            reclass: {
              foo: 'foo text2',
              bar: 'bar text2',
            },
          },
        },
      }
    )

    expect(getClass(form, '.foo')).toEqual('foo prop')
    expect(getClass(form, '.bar')).toEqual('bar text2')
    expect(getClass(form, '.baz')).toEqual('baz text1')
    expect(getClass(form, '.qux')).toEqual('qux form2')
    expect(getClass(form, '.quux')).toEqual('quux form1')
    expect(getClass(form, '.corge')).toEqual('corge defaults')
    expect(getClass(form, '.grault')).toEqual('grault reclass')
  })

  it('should add classes', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          text: {
            type: 'test',
            classes: {
              foo: 'prop',
            },
            presets: ['text1', 'text2'],
          },
        }),
        presets: ['form1', 'form2'],
      },
      {
        defaults: {
          VfTest: {
            classes: {
              foo: 'defaults',
            },
          },
        },
        presets: {
          form1: {
            $apply: 'VfTest',
            classes: {
              foo: 'form1',
            },
          },
          form2: {
            $apply: 'VfTest',
            classes: {
              foo: 'form2',
            },
          },
          text1: {
            classes: {
              foo: 'text1',
            },
          },
          text2: {
            classes: {
              foo: 'text2',
            },
          },
        },
      }
    )

    expect(getClass(form, '.foo')).toEqual(
      'foo defaults form1 form2 text1 text2 prop'
    )
  })

  describe('contextual classes', () => {
    it('non-functional class via classes prop should receive context$', async () => {
      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'test',
            classes: {
              foo: (context$: any) => context$.type,
            },
          },
        }),
      })

      expect(getClass(form, '.foo,.test')).toEqual('foo test')
    })

    it('non-functional class via reclass prop should receive context$', async () => {
      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'test',
            reclass: {
              foo: (context$: any) => context$.type,
            },
          },
        }),
      })

      expect(getClass(form, '.test')).toEqual('test')
    })

    it('non-functional class via config reclass should receive context$', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'test',
            },
          }),
        },
        {
          reclass: {
            VfTest: {
              foo: (context$: any) => context$.type,
            },
          },
        }
      )

      expect(getClass(form, '.test')).toEqual('test')
    })

    it('functional class via classes prop should receive context$ as last arg', async () => {
      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'test',
            classes: {
              input: (foo: string, bar: number, context$: any) =>
                `${foo}-${bar}-${context$.type}`,
            },
          },
        }),
      })

      const text = form.findComponent({ name: 'VfTest' })

      expect(getClass(text, '[type="text"]')).toEqual(
        'vf-foo vf-123 foo-123-test'
      )
    })

    it('functional class via reclass prop should receive context$ as last arg', async () => {
      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'test',
            reclass: {
              input: (foo: string, bar: number, context$: any) =>
                `${foo}-${bar}-${context$.type}`,
            },
          },
        }),
      })

      const text = form.findComponent({ name: 'VfTest' })

      expect(getClass(text, '[type="text"]')).toEqual('foo-123-test')
    })

    it('functional class via config reclass should receive context$ as last arg', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            text: {
              type: 'test',
            },
          }),
        },
        {
          reclass: {
            VfTest: {
              input: (foo: string, bar: number, context$: any) =>
                `${foo}-${bar}-${context$.type}`,
            },
          },
        }
      )

      const text = form.findComponent({ name: 'VfTest' })

      expect(getClass(text, '[type="text"]')).toEqual('foo-123-test')
    })
  })

  describe('ref class values', () => {
    it('should unwrap refs in schema class conditional objects', async () => {
      const highlighted = ref(false)

      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'test',
            classes: {
              input: { highlight: highlighted },
            },
          },
        }),
      })

      const input = form.find('.vf-foo')

      expect(input.classes()).not.toContain('highlight')

      highlighted.value = true
      await nextTick()

      expect(input.classes()).toContain('highlight')
    })

    it('should unwrap refs in conditional objects on non-functional keys', async () => {
      const highlighted = ref(false)

      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'test',
            classes: {
              foo: { highlight: highlighted },
            },
          },
        }),
      })

      const foo = form.find('.foo')

      expect(foo.classes()).not.toContain('highlight')

      highlighted.value = true
      await nextTick()

      expect(foo.classes()).toContain('highlight')
    })

    it('should unwrap a ref as the entire class value', async () => {
      const extra = ref('extra-a')

      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'test',
            classes: {
              foo: extra,
            },
          },
        }),
      })

      const foo = form.find('.foo')

      expect(foo.classes()).toContain('extra-a')

      extra.value = 'extra-b'
      await nextTick()

      expect(foo.classes()).toContain('extra-b')
      expect(foo.classes()).not.toContain('extra-a')
    })

    it('should unwrap refs nested in class value arrays', async () => {
      const highlighted = ref(false)

      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'test',
            classes: {
              foo: ['static', { shadow: highlighted }],
            },
          },
        }),
      })

      const foo = form.find('.foo')

      expect(foo.classes()).toContain('static')
      expect(foo.classes()).not.toContain('shadow')

      highlighted.value = true
      await nextTick()

      expect(foo.classes()).toContain('shadow')
    })

    it('should unwrap refs in reclass conditional objects', async () => {
      const active = ref(false)

      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'test',
            reclass: {
              foo: ['refoo', { active }],
            },
          },
        }),
      })

      const foo = form.find('.refoo')

      expect(foo.classes()).not.toContain('active')

      active.value = true
      await nextTick()

      expect(foo.classes()).toContain('active')
    })
  })

  describe('class:* attr syntax', () => {
    it('should merge static string from class:* attr', () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfText name="text" :class:input="'extra'" />
        </VfForm>`
      )

      const app = mountApp(App)
      const text = app.findComponent({ name: 'VfText' })
      const input = text.find('input')

      expect(input.attributes('class')).toBe('vf-input vf-text-input extra')
    })

    it('should resolve context function from class:* attr', () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfText name="text" :class:input="(context$) => context$.type" />
        </VfForm>`
      )

      const app = mountApp(App)
      const text = app.findComponent({ name: 'VfText' })
      const input = text.find('input')

      expect(input.attributes('class')).toBe('vf-input vf-text-input text')
    })

    it('should apply class:* alongside classes prop', () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfText name="text" :classes="{ input: 'from-prop' }" :class:input="'from-attr'" />
        </VfForm>`
      )

      const app = mountApp(App)
      const text = app.findComponent({ name: 'VfText' })
      const input = text.find('input')

      expect(input.attributes('class')).toBe(
        'vf-input vf-text-input from-prop from-attr'
      )
    })
  })

  describe('reclass:* attr syntax', () => {
    it('should replace class from reclass:* attr', () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfText name="text" :reclass:input="'replaced'" />
        </VfForm>`
      )

      const app = mountApp(App)
      const text = app.findComponent({ name: 'VfText' })
      const input = text.find('input')

      expect(input.attributes('class')).toBe('replaced')
    })

    it('should resolve context function from reclass:* attr', () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfText name="text" :reclass:input="(context$) => context$.type" />
        </VfForm>`
      )

      const app = mountApp(App)
      const text = app.findComponent({ name: 'VfText' })
      const input = text.find('input')

      expect(input.attributes('class')).toBe('text')
    })

    it('should prefer reclass prop over reclass:* attr', () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfText name="text" :reclass="{ input: 'from-prop' }" :reclass:input="'from-attr'" />
        </VfForm>`
      )

      const app = mountApp(App)
      const text = app.findComponent({ name: 'VfText' })
      const input = text.find('input')

      expect(input.attributes('class')).toBe('from-prop')
    })
  })

  describe('layout classes', () => {
    it('should override layout classes per key via the layoutClasses config option', () => {
      // A key the option sets replaces that key's layout-provided value —
      // the static `root`, a functional key by contract, is wrapped back into
      // a function so the layout's template can still call it. Keys the
      // option leaves out keep the layout's defaults.
      const { form } = createForm(
        {
          schema: defineSchema({ text: { type: 'test' } }),
        },
        {
          layoutClasses: { root: 'my-element' },
        }
      )

      expect(getClass(form, { name: 'VfTest' })).toBe(
        'my-element vf-text vf-offset-label vf-col-12'
      )
    })

    it('should merge a static class value with a functional one', () => {
      const merged = mergeClass('static', (on: boolean) =>
        on ? 'fn-on' : 'fn-off'
      )

      expect(typeof merged).toBe('function')
      expect(merged(true)).toBe('static fn-on')
      expect(merged(false)).toBe('static fn-off')
    })
  })
})
