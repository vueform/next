import { nextTick } from 'vue'

import { defineSchema } from '#core'

import { createForm, makeApp, mountApp } from '../../helpers'

describe('useParts', () => {
  // ==========================================================================
  // Group 1: Static object part (returned as-is, identity-equal)
  // ==========================================================================
  describe('static object parts', () => {
    it('should apply static object to a non-callable part', () => {
      const inputPart = { 'data-foo': 'bar' }

      const { form } = createForm({
        schema: defineSchema({
          text: { type: 'text', parts: { input: inputPart } },
        }),
      })

      const text = form.findComponent({ name: 'VfText' })
      const input = text.find('input')

      expect(input.attributes('data-foo')).toBe('bar')
    })

    it('should return static value without wrapping in a function Proxy', () => {
      const inputPart = { 'data-foo': 'bar' }

      const { text } = createForm({
        schema: defineSchema({
          text: { type: 'text', parts: { input: inputPart } },
        }),
      })

      expect(text.parts.input).toStrictEqual(inputPart)
      expect(typeof text.parts.input).toBe('object')
      expect(typeof text.parts.input).not.toBe('function')
    })
  })

  // ==========================================================================
  // Group 2: Context-aware function on non-callable part (incl. reactivity)
  // ==========================================================================
  describe('context-aware function on non-callable part', () => {
    it('should resolve context function and react to model changes', async () => {
      const { form, text } = createForm({
        schema: defineSchema({
          text: {
            type: 'text',
            parts: {
              input: (ctx: any) => ({
                'data-name': ctx.props.name,
                'data-model': String(ctx.model ?? ''),
              }),
            },
          },
        }),
      })

      const textComp = form.findComponent({ name: 'VfText' })
      const input = textComp.find('input')

      expect(input.attributes('data-name')).toBe('text')
      expect(input.attributes('data-model')).toBe('')

      text.update('hello')
      await nextTick()

      expect(input.attributes('data-model')).toBe('hello')
      expect(input.attributes('data-name')).toBe('text')

      text.update('world')
      await nextTick()

      expect(input.attributes('data-model')).toBe('world')
    })
  })

  // ==========================================================================
  // Group 3: Callable part with runtime args only
  // ==========================================================================
  describe('callable part with runtime args', () => {
    it('should pass runtime args to callable part function', () => {
      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'text',
            addonBefore: ['$', '%'],
            parts: {
              addonBefore: (addon: any, i: number) => ({
                'data-i': String(i),
              }),
            },
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)
      expect(addons[0].find('.vf-addon').attributes('data-i')).toBe('0')
      expect(addons[1].find('.vf-addon').attributes('data-i')).toBe('1')
    })

    it('should apply static object to a callable-position part (via context fn)', () => {
      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'text',
            addonBefore: ['$', '%'],
            parts: {
              addonBefore: (_addon: any, _i: number) => ({
                'data-static': '1',
              }),
            },
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)
      expect(addons[0].find('.vf-addon').attributes('data-static')).toBe('1')
      expect(addons[1].find('.vf-addon').attributes('data-static')).toBe('1')
    })
  })

  // ==========================================================================
  // Group 4: Callable part with runtime args + context (incl. reactivity)
  // ==========================================================================
  describe('callable part with runtime args + context', () => {
    it('should pass args and context (last param) with reactive updates', async () => {
      const { form, text } = createForm({
        schema: defineSchema({
          text: {
            type: 'text',
            addonBefore: ['$', '%'],
            parts: {
              addonBefore: (addon: any, i: number, ctx: any) => ({
                'data-i': String(i),
                'data-model': String(ctx.model ?? ''),
              }),
            },
          },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons).toHaveLength(2)
      expect(addons[0].find('.vf-addon').attributes('data-i')).toBe('0')
      expect(addons[1].find('.vf-addon').attributes('data-i')).toBe('1')
      expect(addons[0].find('.vf-addon').attributes('data-model')).toBe('')
      expect(addons[1].find('.vf-addon').attributes('data-model')).toBe('')

      text.update('hello')
      await nextTick()

      expect(addons[0].find('.vf-addon').attributes('data-model')).toBe('hello')
      expect(addons[1].find('.vf-addon').attributes('data-model')).toBe('hello')
      expect(addons[0].find('.vf-addon').attributes('data-i')).toBe('0')
      expect(addons[1].find('.vf-addon').attributes('data-i')).toBe('1')
    })
  })

  // ==========================================================================
  // Group 5: Reactivity from props.parts mutations
  // ==========================================================================
  describe('reactivity from props.parts mutations', () => {
    it('5a: should react when static value object is replaced', async () => {
      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'text',
            parts: { input: { 'data-foo': 'bar' } },
          },
        }),
      })

      const textComp = form.findComponent({ name: 'VfText' })
      const input = textComp.find('input')

      expect(input.attributes('data-foo')).toBe('bar')

      await form.setProps({
        schema: defineSchema({
          text: {
            type: 'text',
            parts: { input: { 'data-foo': 'baz' } },
          },
        }),
      })
      await nextTick()

      expect(input.attributes('data-foo')).toBe('baz')
    })

    it('5b: should react when function reference is swapped', async () => {
      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'text',
            parts: {
              input: () => ({ 'data-val': 'first' }),
            },
          },
        }),
      })

      const textComp = form.findComponent({ name: 'VfText' })
      const input = textComp.find('input')

      expect(input.attributes('data-val')).toBe('first')

      await form.setProps({
        schema: defineSchema({
          text: {
            type: 'text',
            parts: {
              input: () => ({ 'data-val': 'second' }),
            },
          },
        }),
      })
      await nextTick()

      expect(input.attributes('data-val')).toBe('second')
    })

    it('5c: should react when a new key is added', async () => {
      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'Label',
            parts: { input: { 'data-foo': 'bar' } },
          },
        }),
      })

      await form.setProps({
        schema: defineSchema({
          text: {
            type: 'text',
            label: 'Label',
            parts: {
              input: { 'data-foo': 'bar' },
              label: { 'data-extra': 'x' },
            },
          },
        }),
      })
      await nextTick()

      const el = form.findComponent({ name: 'VfLayout' })
      const labels = el.findAll('[data-extra]')
      expect(labels.length).toBeGreaterThan(0)
      expect(labels[0].attributes('data-extra')).toBe('x')
    })
  })

  // ==========================================================================
  // Group 6: Iteration — Object.keys / for...in / has
  // ==========================================================================
  describe('iteration (ownKeys / has traps)', () => {
    it('should expose all keys via Object.keys', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: {
            type: 'text',
            parts: {
              input: { 'data-a': '1' },
              label: { 'data-b': '2' },
            },
          },
        }),
      })

      const keys = Object.keys(text.parts)
      expect(keys).toContain('input')
      expect(keys).toContain('label')
    })

    it('should support "in" operator', () => {
      const { text } = createForm({
        schema: defineSchema({
          text: {
            type: 'text',
            parts: { input: { 'data-a': '1' } },
          },
        }),
      })

      expect('input' in text.parts).toBe(true)
      expect('unknown' in text.parts).toBe(false)
    })

    it('should support spreading', () => {
      const inputPart = { 'data-a': '1' }

      const { text } = createForm({
        schema: defineSchema({
          text: {
            type: 'text',
            parts: { input: inputPart },
          },
        }),
      })

      const spread = { ...text.parts }
      expect(spread.input).toStrictEqual(inputPart)
    })
  })

  // ==========================================================================
  // Group 7: Open keys widening (Record fallback)
  // ==========================================================================
  describe('open keys widening', () => {
    it('should accept undeclared keys without throwing', () => {
      const { form } = createForm({
        schema: defineSchema({
          text: {
            type: 'text',
            parts: { customKey: { 'data-x': '1' } } as any,
          },
        }),
      })

      const textComp = form.findComponent({ name: 'VfText' })
      expect(textComp.exists()).toBe(true)
      expect(textComp.find('[data-x]').exists()).toBe(false)
    })
  })

  // ==========================================================================
  // Group 8: Undefined parts produce no attrs
  // ==========================================================================
  describe('undefined parts produce no attrs', () => {
    it('should not add stray data-* attrs when no parts provided', () => {
      const { form } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      const textComp = form.findComponent({ name: 'VfText' })
      const input = textComp.find('input')
      const attrs = input.attributes()

      const dataAttrs = Object.keys(attrs).filter((k) => k.startsWith('data-'))
      expect(dataAttrs).toHaveLength(0)
    })
  })

  // ==========================================================================
  // Group 9: part:* attr syntax
  // ==========================================================================
  describe('part:* attr syntax', () => {
    describe('9a: static object via part:* attr', () => {
      it('should apply static object from part:input attr', () => {
        const App = makeApp(
          `<VfForm ref="form$">
            <VfText name="text" :part:input="{ 'data-foo': 'bar' }" />
          </VfForm>`
        )

        const app = mountApp(App)
        const form = app.findComponent({ name: 'VfForm' })
        const text = form.findComponent({ name: 'VfText' })
        const input = text.find('input')

        expect(input.attributes('data-foo')).toBe('bar')
      })
    })

    describe('9b: context fn on non-callable part via part:* attr', () => {
      it('should resolve context function and react to model changes', async () => {
        const App = makeApp(
          `<VfForm ref="form$">
            <VfText name="text" :part:input="(ctx) => ({
              'data-name': ctx.props.name,
              'data-model': String(ctx.model ?? ''),
            })" />
          </VfForm>`
        )

        const app = mountApp(App)
        const form = app.findComponent({ name: 'VfForm' })
        const text = form.findComponent({ name: 'VfText' })
        const input = text.find('input')

        expect(input.attributes('data-name')).toBe('text')
        expect(input.attributes('data-model')).toBe('')

        text.vm.update('hello')
        await nextTick()

        expect(input.attributes('data-model')).toBe('hello')
      })
    })

    describe('9c: callable part with runtime args via part:* attr', () => {
      it('should pass runtime args to callable part from attr', () => {
        const App = makeApp(
          `<VfForm ref="form$">
            <VfText name="text" :addonBefore="['$', '%']" :part:addonBefore="(addon, i) => ({ 'data-i': String(i) })" />
          </VfForm>`
        )

        const app = mountApp(App)
        const form = app.findComponent({ name: 'VfForm' })
        const addons = form.findAllComponents({ name: 'VfAddon' })

        expect(addons).toHaveLength(2)
        expect(addons[0].find('.vf-addon').attributes('data-i')).toBe('0')
        expect(addons[1].find('.vf-addon').attributes('data-i')).toBe('1')
      })
    })

    describe('9d: callable part with args + context via part:* attr', () => {
      it('should pass args and context with reactive updates', async () => {
        const App = makeApp(
          `<VfForm ref="form$">
            <VfText name="text" :addonBefore="['$', '%']" :part:addonBefore="(addon, i, ctx) => ({
              'data-i': String(i),
              'data-model': String(ctx.model ?? ''),
            })" />
          </VfForm>`
        )

        const app = mountApp(App)
        const form = app.findComponent({ name: 'VfForm' })
        const text = form.findComponent({ name: 'VfText' })
        const addons = form.findAllComponents({ name: 'VfAddon' })

        expect(addons[0].find('.vf-addon').attributes('data-i')).toBe('0')
        expect(addons[0].find('.vf-addon').attributes('data-model')).toBe('')

        text.vm.update('hi')
        await nextTick()

        expect(addons[0].find('.vf-addon').attributes('data-model')).toBe('hi')
        expect(addons[1].find('.vf-addon').attributes('data-model')).toBe('hi')
      })
    })

    describe('9e: part:* attr overrides parts prop', () => {
      it('should prefer part:* attr over parts prop', () => {
        const App = makeApp(
          `<VfForm ref="form$">
            <VfText name="text" :parts="{ input: { 'data-from': 'prop' } }" :part:input="{ 'data-from': 'attr' }" />
          </VfForm>`
        )

        const app = mountApp(App)
        const form = app.findComponent({ name: 'VfForm' })
        const text = form.findComponent({ name: 'VfText' })
        const input = text.find('input')

        expect(input.attributes('data-from')).toBe('attr')
      })
    })
  })

  // ==========================================================================
  // Group 10: parts resolved through the useProps pipeline
  // ==========================================================================
  describe('pipeline-sourced parts (config defaults / presets)', () => {
    it('should apply part:* from config defaults to the DOM', () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          defaults: {
            VfText: {
              'part:input': { 'data-source': 'config' },
            },
          },
        } as any
      )

      const text = form.findComponent({ name: 'VfText' })
      const input = text.find('input')

      expect(input.attributes('data-source')).toBe('config')
    })

    it('should apply part:* from a preset to the DOM', () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            text: { type: 'text', presets: ['p'] } as any,
          }),
        },
        {
          presets: {
            p: {
              'part:input': { 'data-x': 'preset' },
            },
          },
        } as any
      )

      const text = form.findComponent({ name: 'VfText' })
      const input = text.find('input')

      expect(input.attributes('data-x')).toBe('preset')
    })

    it('should merge config default part:* with user attr, user winning on conflict', () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfText name="text" :part:input="{ 'data-user': 'u', 'data-both': 'user' }" />
        </VfForm>`
      )

      const app = mountApp(App, {}, {
        defaults: {
          VfText: {
            'part:input': { 'data-source': 'config', 'data-both': 'config' },
          },
        },
      } as any)

      const form = app.findComponent({ name: 'VfForm' })
      const text = form.findComponent({ name: 'VfText' })
      const input = text.find('input')

      expect(input.attributes('data-user')).toBe('u')
      expect(input.attributes('data-source')).toBe('config')
      expect(input.attributes('data-both')).toBe('user')
    })

    it('should expose pipeline-sourced part keys via Object.keys', () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          defaults: {
            VfText: {
              'part:input': { 'data-source': 'config' },
            },
          },
        } as any
      )

      expect(Object.keys(text.parts)).toContain('input')
    })
  })
})
