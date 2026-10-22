import {
  createVueformFactory,
  definePlugin,
  defineSchema,
  expression,
  model,
  own,
  pathExpressionAdapter,
} from '@vueform/core'
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

describe('Plugins', () => {
  describe('apply', () => {
    test('should apply to a specific component by name', () => {
      const extendFn = vi.fn()

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              extend: extendFn,
            }))(),
          ],
        }
      )

      expect(extendFn).toHaveBeenCalled()
    })

    test('should not apply to non-matching components', () => {
      const extendFn = vi.fn()

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfSelect',
              extend: extendFn,
            }))(),
          ],
        }
      )

      expect(extendFn).not.toHaveBeenCalled()
    })

    test('should apply to all components with *', () => {
      const extendFn = vi.fn()

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
            checkbox: { type: 'checkbox' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: '*',
              extend: extendFn,
            }))(),
          ],
        }
      )

      expect(extendFn.mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    test('should apply to all elements with *element', () => {
      const extendFn = vi.fn()

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
            checkbox: { type: 'checkbox' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: '*element',
              extend: extendFn,
            }))(),
          ],
        }
      )

      expect(extendFn.mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    test('should apply to components matching a regex', () => {
      const extendFn = vi.fn()

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: /^VfText$/,
              extend: extendFn,
            }))(),
          ],
        }
      )

      expect(extendFn).toHaveBeenCalled()
    })

    test('should apply to multiple components with an array', () => {
      const applied: string[] = []

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
            checkbox: { type: 'checkbox' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: ['VfText', 'VfCheckbox'],
              extend(props, api) {
                applied.push((api as any).name || 'unknown')
              },
            }))(),
          ],
        }
      )

      expect(applied.length).toBe(2)
    })
  })

  describe('extend receives props', () => {
    test('should receive component props as first argument', () => {
      let receivedProps: any

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text', label: 'My Label', placeholder: 'Enter' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              extend(props) {
                receivedProps = props
              },
            }))(),
          ],
        }
      )

      expect(receivedProps).toBeDefined()
      expect(receivedProps.label).toBe('My Label')
      expect(receivedProps.placeholder).toBe('Enter')
    })
  })

  describe('extend receives the api (+ events)', () => {
    test('should receive the component API as the second argument', () => {
      let receivedApi: any

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text', default: 'hello' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              extend(props, api) {
                receivedApi = api
              },
            }))(),
          ],
        }
      )

      expect(receivedApi).toBeDefined()
      expect(receivedApi.value.value).toBe('hello')
    })

    test('should be able to call api methods', async () => {
      const { text } = createForm(
        {
          schema: defineSchema({
            text: { type: 'text', default: 'original' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              extend(props, api) {
                api.update('modified')
              },
            }))(),
          ],
        }
      )

      await nextTick()
      expect(text.value).toBe('modified')
    })

    test('should have event methods (fire, on, off, etc.) on api', () => {
      let receivedApi: any

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              extend(props, api) {
                receivedApi = api
              },
            }))(),
          ],
        }
      )

      expect(receivedApi).toBeDefined()
      expect(receivedApi.fire).toBeInstanceOf(Function)
      expect(receivedApi.fireAsync).toBeInstanceOf(Function)
      expect(receivedApi.on).toBeInstanceOf(Function)
      expect(receivedApi.off).toBeInstanceOf(Function)
      expect(receivedApi.onBefore).toBeInstanceOf(Function)
      expect(receivedApi.onAfter).toBeInstanceOf(Function)
    })

    test('should be able to listen to events via api.on', async () => {
      const changeSpy = vi.fn()

      const { text } = createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              extend(props, api) {
                api.on('change', changeSpy)
              },
            }))(),
          ],
        }
      )

      text.update('new value')
      await nextTick()

      expect(changeSpy).toHaveBeenCalled()
      expect(changeSpy.mock.calls[0][0]).toBe('new value')
      expect(changeSpy.mock.calls[0][1]).toBe(null)
    })

    test('should support onBefore/on/onAfter ordering', async () => {
      const order: string[] = []

      const { text } = createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              extend(props, api) {
                api.onBefore('change', () => {
                  order.push('before')
                })
                api.on('change', () => {
                  order.push('on')
                })
                api.onAfter('change', () => {
                  order.push('after')
                })
              },
            }))(),
          ],
        }
      )

      text.update('value')
      await nextTick()

      expect(order).toEqual(['before', 'on', 'after'])
    })

    test('should be able to fire events from the api', () => {
      const spy = vi.fn()

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              extend(props, api) {
                api.on('custom-event', spy)
                api.fire('custom-event' as any)
              },
            }))(),
          ],
        }
      )

      expect(spy).toHaveBeenCalled()
    })
  })

  describe('plugin props', () => {
    test('should add custom props to components', () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            text: { type: 'text', myCustomProp: 'custom-value' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              props: {
                myCustomProp: { type: String },
              },
              extend(props) {
                expect((props as any).myCustomProp).toBe('custom-value')
              },
            }))(),
          ],
        }
      )

      expect(form.findComponent({ name: 'VfText' }).exists()).toBe(true)
    })
  })

  describe('plugin emits', () => {
    test('should add custom emits to components', () => {
      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              emits: ['customEvent'],
              extend(props, api) {
                api.fire('customEvent' as any)
              },
            }))(),
          ],
        }
      )
    })
  })

  describe('nested plugins', () => {
    test('should apply nested plugins', () => {
      const innerExtend = vi.fn()

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              extend() {},
              plugins: [
                {
                  apply: 'VfText',
                  extend: innerExtend,
                },
              ],
            }))(),
          ],
        }
      )

      expect(innerExtend).toHaveBeenCalled()
    })
  })

  describe('config hook', () => {
    test('should call config hook at install time', () => {
      const configFn = vi.fn()

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              config: configFn,
            }))(),
          ],
        }
      )

      expect(configFn).toHaveBeenCalledTimes(1)
      expect(configFn.mock.calls[0][0]).toHaveProperty('plugins')
      expect(configFn.mock.calls[0][0]).toHaveProperty('locales')
    })
  })

  describe('config hook defaults layering', () => {
    const makeAdapter = () => (() => ({})) as any

    const pluginAdapter = makeAdapter()

    const createEntry = () =>
      createVueformFactory({
        modules: { model, expression },
        $expression: { adapter: pathExpressionAdapter },
      })

    const adapterPlugin = (adapter: any) =>
      definePlugin(() => ({
        config(config) {
          const options = config.$expression ?? {}

          config.$expression = {
            ...options,
            adapter: own(options, 'adapter') ?? adapter,
          }
        },
      }))()

    test('entry defaults should fill when nothing else sets them', () => {
      const vueform = createEntry()({})

      expect(vueform.config.$expression?.adapter).toBe(pathExpressionAdapter)
    })

    test('a plugin fill should replace an entry-baked default', () => {
      const vueform = createEntry()({
        plugins: [adapterPlugin(pluginAdapter)],
      })

      expect(vueform.config.$expression?.adapter).toBe(pluginAdapter)
    })

    test('config hooks should not see entry-baked defaults', () => {
      let seen: any = 'untouched'

      createEntry()({
        plugins: [
          definePlugin(() => ({
            config(config) {
              seen = config.$expression?.adapter
            },
          }))(),
        ],
      })

      expect(seen).toBeUndefined()
    })

    test('an app-set value should win over a plugin fill', () => {
      const appAdapter = makeAdapter()

      const vueform = createEntry()({
        $expression: { adapter: appAdapter },
        plugins: [adapterPlugin(pluginAdapter)],
      })

      expect(vueform.config.$expression?.adapter).toBe(appAdapter)
    })

    test('an app-set value equal to the baked default should win', () => {
      const vueform = createEntry()({
        $expression: { adapter: pathExpressionAdapter },
        plugins: [adapterPlugin(pluginAdapter)],
      })

      expect(vueform.config.$expression?.adapter).toBe(pathExpressionAdapter)
    })

    test('the first plugin to fill should win over a later one', () => {
      const firstAdapter = makeAdapter()

      const vueform = createEntry()({
        plugins: [adapterPlugin(firstAdapter), adapterPlugin(pluginAdapter)],
      })

      expect(vueform.config.$expression?.adapter).toBe(firstAdapter)
    })

    test('a plugin-registered module should win over an entry-baked one', () => {
      const pluginModule = { create: () => ({ marker: 'plugin' }) }
      const entryModule = { create: () => ({ marker: 'entry' }) }

      const vueform = createVueformFactory({
        modules: { model, custom: entryModule } as any,
      })({
        plugins: [
          definePlugin(() => ({
            config(config) {
              config.modules = {
                ...config.modules,
                custom: own(config.modules as any, 'custom') ?? pluginModule,
              } as any
            },
          }))(),
        ],
      })

      expect((vueform.modules as any).custom.marker).toBe('plugin')
    })

    test('custom entry option bags should defer like the known ones', () => {
      const vueform = createVueformFactory({
        modules: { model },
        $custom: { flag: 'entry', other: 'entry' },
      } as any)({
        plugins: [
          definePlugin(() => ({
            config(config: any) {
              const bag = config.$custom ?? {}

              config.$custom = { ...bag, flag: own(bag, 'flag') ?? 'plugin' }
            },
          }))(),
        ],
      })

      expect((vueform.config as any).$custom).toEqual({
        flag: 'plugin',
        other: 'entry',
      })
    })
  })

  describe('multiple plugins', () => {
    test('should apply multiple plugins in order', () => {
      const order: number[] = []

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              extend() {
                order.push(1)
              },
            }))(),
            definePlugin(() => ({
              apply: 'VfText',
              extend() {
                order.push(2)
              },
            }))(),
          ],
        }
      )

      expect(order).toEqual([1, 2])
    })

    test('first plugin modifications should be visible to second plugin', () => {
      let secondValue: any

      createForm(
        {
          schema: defineSchema({
            text: { type: 'text', default: 'original' },
          }),
        },
        {
          plugins: [
            definePlugin(() => ({
              apply: 'VfText',
              extend(props, api) {
                ;(api as any).__pluginMarker = 'first'
              },
            }))(),
            definePlugin(() => ({
              apply: 'VfText',
              extend(props, api) {
                secondValue = (api as any).__pluginMarker
              },
            }))(),
          ],
        }
      )

      expect(secondValue).toBe('first')
    })
  })
})
