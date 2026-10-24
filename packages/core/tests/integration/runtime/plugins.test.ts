import { definePlugin, defineSchema } from '@vueform/core'
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

    // test('should support onBefore/on/onAfter ordering', async () => {
    //   const order: string[] = []

    //   const { text } = createForm(
    //     {
    //       schema: defineSchema({
    //         text: { type: 'text' },
    //       }),
    //     },
    //     {
    //       plugins: [
    //         definePlugin(() => ({
    //           apply: 'VfText',
    //           extend(props, api) {
    //             api.onBefore('change', () => {
    //               order.push('before')
    //             })
    //             api.on('change', () => {
    //               order.push('on')
    //             })
    //             api.onAfter('change', () => {
    //               order.push('after')
    //             })
    //           },
    //         }))(),
    //       ],
    //     }
    //   )

    //   text.update('value')
    //   await nextTick()

    //   expect(order).toEqual(['before', 'on', 'after'])
    // })

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
