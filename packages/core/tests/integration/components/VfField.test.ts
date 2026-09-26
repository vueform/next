import { nextTick } from 'vue'
import { createForm, makeApp, mountApp, vModelAndChange } from '../../helpers'
import { defineSchema, defineSlot } from '#core'

// =============================================================================
// PROPS
// =============================================================================
describe('VfField props', () => {
  describe('modelValue / default', () => {
    it('should store null value by default', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'field' },
        }),
      })

      expect(el.value).toBeNull()
    })

    it('should store a string default in the data model', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'field', default: 'hello' },
        }),
      })

      expect(el.value).toBe('hello')
    })

    it('should store a number default in the data model', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'field', default: 42 },
        }),
      })

      expect(el.value).toBe(42)
    })

    it('should store an object default in the data model', () => {
      const obj = { foo: 'bar', nested: { a: 1 } }

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'field', default: obj },
        }),
      })

      expect(el.value).toEqual(obj)
    })

    it('should store an array default in the data model', () => {
      const arr = [1, 'two', { three: 3 }]

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'field', default: arr },
        }),
      })

      expect(el.value).toEqual(arr)
    })

    it('should include value in form data by default', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          el: { type: 'field', default: 'included' },
        }),
      })

      expect(form$.payload).toEqual({ el: 'included' })
    })

    it('should exclude value from form data when submit is false', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          el: { type: 'field', default: 'excluded', submit: false },
        }),
      })

      expect(form$.payload).toEqual({})
    })
  })

  describe('nullValue', () => {
    it('should use null as the empty value by default', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'field' },
        }),
      })

      expect(el.value).toBeNull()
    })

    it('should use a custom nullValue as the empty value', () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'field', nullValue: '' },
        }),
      })

      expect(el.value).toBe('')
    })

    it('should reset to custom nullValue when cleared', async () => {
      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'field', default: 'filled', nullValue: [] as any },
        }),
      })

      expect(el.value).toBe('filled')

      el.clear()
      await nextTick()

      expect(el.value).toEqual([])
    })
  })

  describe('options', () => {
    it('should expose options in the component context', () => {
      const opts = { format: 'hex', swatches: ['#ff0000'] }

      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'field', options: opts },
        }),
      })

      const comp = form.findComponent({ name: 'VfField' })
      expect(comp.vm.options).toEqual(opts)
    })

    it('should be undefined by default', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'field' },
        }),
      })

      const comp = form.findComponent({ name: 'VfField' })
      expect(comp.vm.options).toEqual({})
    })
  })

  describe('readonly', () => {
    it('should expose readonly state in the component context', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'field', readonly: true },
        }),
      })

      const comp = form.findComponent({ name: 'VfField' })
      expect(comp.vm.readonly).toBe(true)
    })
  })
})

// =============================================================================
// EVENTS
// =============================================================================
describe('VfField events', () => {
  describe('change', () => {
    it('should emit change when value is updated programmatically', async () => {
      const onChange = vi.fn()

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'field', default: 'old', onChange },
        }),
      })

      el.update('new')
      await nextTick()

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange.mock.calls[0][0]).toBe('new')
      expect(onChange.mock.calls[0][1]).toBe('old')
    })

    it('should not emit change when the value does not change', async () => {
      const onChange = vi.fn()

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'field', default: 'same', onChange },
        }),
      })

      el.update('same')
      await nextTick()

      expect(onChange).not.toHaveBeenCalled()
    })

    it('should emit change with object values', async () => {
      const onChange = vi.fn()
      const oldVal = { a: 1 }
      const newVal = { b: 2 }

      const { el } = createForm({
        schema: defineSchema({
          el: { type: 'field', default: oldVal, onChange },
        }),
      })

      el.update(newVal)
      await nextTick()

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange.mock.calls[0][0]).toEqual(newVal)
      expect(onChange.mock.calls[0][1]).toEqual(oldVal)
    })
  })

  describe('focus', () => {
    it('should emit focus event when handleFocus is called', async () => {
      const onFocus = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'field', onFocus },
        }),
      })

      const comp = form.findComponent({ name: 'VfField' })
      comp.vm.handleFocus()
      await nextTick()

      expect(onFocus).toHaveBeenCalledTimes(1)
    })
  })

  describe('blur', () => {
    it('should emit blur event when handleBlur is called', async () => {
      const onBlur = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'field', onBlur },
        }),
      })

      const comp = form.findComponent({ name: 'VfField' })
      comp.vm.fire('blur', comp)
      await nextTick()

      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('keydown', () => {
    it('should emit keydown event when handleKeydown is called', async () => {
      const onKeydown = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'field', onKeydown },
        }),
      })

      const comp = form.findComponent({ name: 'VfField' })
      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      comp.vm.handleKeydown(event)
      await nextTick()

      expect(onKeydown).toHaveBeenCalledTimes(1)
      expect(onKeydown.mock.calls[0][0]).toBe(event)
    })
  })

  describe('keyup', () => {
    it('should emit keyup event when handleKeyup is called', async () => {
      const onKeyup = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'field', onKeyup },
        }),
      })

      const comp = form.findComponent({ name: 'VfField' })
      const event = new KeyboardEvent('keyup', { key: 'a' })
      comp.vm.handleKeyup(event)
      await nextTick()

      expect(onKeyup).toHaveBeenCalledTimes(1)
      expect(onKeyup.mock.calls[0][0]).toBe(event)
    })
  })

  describe('keypress', () => {
    it('should emit keypress event when handleKeypress is called', async () => {
      const onKeypress = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'field', onKeypress },
        }),
      })

      const comp = form.findComponent({ name: 'VfField' })
      const event = new KeyboardEvent('keypress', { key: 'z' })
      comp.vm.handleKeypress(event)
      await nextTick()

      expect(onKeypress).toHaveBeenCalledTimes(1)
      expect(onKeypress.mock.calls[0][0]).toBe(event)
    })
  })

  describe('update:modelValue', () => {
    it('should sync v-model when value changes programmatically', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfField name="el" :default="'initial'" ${vModelAndChange('form')} />
        </VfForm>`
      )

      const app = mountApp(App, {
        props: {
          form: 'initial',
          'onUpdate:form': (v: any) => app.setProps({ form: v }),
        },
      })

      const comp = app.findComponent({ name: 'VfField' })
      comp.vm.update('updated')
      await nextTick()

      expect(app.props('form')).toBe('updated')
    })

    it('should accept external v-model updates', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfField name="el" ${vModelAndChange('form')} />
        </VfForm>`
      )

      const app = mountApp(App, {
        props: {
          form: 'initial',
          'onUpdate:form': (v: any) => app.setProps({ form: v }),
        },
      })

      await app.setProps({ form: 'external' })
      await nextTick()

      const comp = app.findComponent({ name: 'VfField' })
      expect(comp.vm.value).toBe('external')
    })

    it('should sync v-model with object values', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfField name="el" ${vModelAndChange('form')} />
        </VfForm>`
      )

      const app = mountApp(App, {
        props: {
          form: null,
          'onUpdate:form': (v: any) => app.setProps({ form: v }),
        },
      })

      const obj = { key: 'value' }
      const comp = app.findComponent({ name: 'VfField' })
      comp.vm.update(obj)
      await nextTick()

      expect(app.props('form')).toEqual(obj)
    })
  })
})

// =============================================================================
// SLOTS (inline template)
// =============================================================================
describe('VfField slots (inline)', () => {
  describe('default slot', () => {
    it('should expose value in the default slot', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfField name="el" :default="'hello'">
            <template #default="{ context: { value } }">
              <span class="slot-value">{{ value }}</span>
            </template>
          </VfField>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      expect(app.find('.slot-value').text()).toBe('hello')
    })

    it('should expose update function that changes the value', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfField name="el" :default="'before'">
            <template #default="{ context: { value, update } }">
              <span class="slot-value">{{ value }}</span>
              <button class="slot-update" @click="update('after')">Update</button>
            </template>
          </VfField>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      expect(app.find('.slot-value').text()).toBe('before')

      await app.find('.slot-update').trigger('click')
      await nextTick()

      expect(app.find('.slot-value').text()).toBe('after')
    })

    it('should expose handleFocus and handleBlur in the default slot', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfField name="el">
            <template #default="{ context: { handleFocus, handleBlur, focused } }">
              <span class="slot-focused">{{ focused }}</span>
              <button class="slot-focus" @click="handleFocus">Focus</button>
              <button class="slot-blur" @click="handleBlur">Blur</button>
            </template>
          </VfField>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      expect(app.find('.slot-focused').text()).toBe('false')

      await app.find('.slot-focus').trigger('click')
      await nextTick()

      expect(app.find('.slot-focused').text()).toBe('true')

      await app.find('.slot-blur').trigger('click')
      await nextTick()

      expect(app.find('.slot-focused').text()).toBe('false')
    })

    it('should expose disabled and readonly state in the default slot', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfField name="el" :disabled="true" :readonly="true">
            <template #default="{ context: { disabled, readonly } }">
              <span class="slot-disabled">{{ disabled }}</span>
              <span class="slot-readonly">{{ readonly }}</span>
            </template>
          </VfField>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      expect(app.find('.slot-disabled').text()).toBe('true')
      expect(app.find('.slot-readonly').text()).toBe('true')
    })

    it('should expose options in the default slot', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfField name="el" :options="{ format: 'hex' }">
            <template #default="{ context: { options } }">
              <span class="slot-options">{{ options.format }}</span>
            </template>
          </VfField>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      expect(app.find('.slot-options').text()).toBe('hex')
    })
  })
})

// =============================================================================
// SLOTS (prop-based via defineSlot)
// =============================================================================
describe('VfField slots (prop)', () => {
  describe('default slot via slots prop', () => {
    it('should replace rendering via slots prop and expose value', async () => {
      const slot = defineSlot('VfField.default', {
        props: ['context'],
        template: '<div class="slot-custom">{{ context.value }}</div>',
      })

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'field',
            default: 'slot-value',
            slots: { default: slot },
          },
        }),
      })

      await nextTick()
      expect(form.find('.slot-custom').text()).toBe('slot-value')
    })

    it('should expose update function via slots prop', async () => {
      const slot = defineSlot('VfField.default', {
        props: ['context'],
        template:
          '<div><span class="slot-value">{{ context.value }}</span><button class="slot-update" @click="context.update(\'changed\')">Go</button></div>',
      })

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'field',
            default: 'original',
            slots: { default: slot },
          },
        }),
      })

      await nextTick()
      expect(form.find('.slot-value').text()).toBe('original')

      await form.find('.slot-update').trigger('click')
      await nextTick()

      expect(form.find('.slot-value').text()).toBe('changed')
    })
  })
})

// =============================================================================
// PARTS
// =============================================================================
describe('VfField parts', () => {
  it('should apply attributes to the inputGroup part when addons render the group', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'field',
          addonBefore: 'x',
          parts: { addonGroup: { 'data-testid': 'field-group' } },
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfField' })
    const inputGroup = comp.find('.vf-addon-group')
    expect(inputGroup.attributes('data-testid')).toBe('field-group')
  })
})

// =============================================================================
// CLASSES
// =============================================================================
describe('VfField classes', () => {
  it('should apply vf-field root class', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'field' },
      }),
    })

    const comp = form.findComponent({ name: 'VfField' })
    expect(comp.find('.vf-field').exists()).toBe(true)
  })

  it('should not render the input group without addons', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'field' },
      }),
    })

    const comp = form.findComponent({ name: 'VfField' })
    expect(comp.find('.vf-addon-group').exists()).toBe(false)
  })

  it('should render the input group when addons are present', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'field', addonBefore: 'x' },
      }),
    })

    const comp = form.findComponent({ name: 'VfField' })
    expect(comp.find('.vf-addon-group').exists()).toBe(true)
  })

  it('should extend classes via reclass prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'field',
          addonBefore: 'x',
          reclass: {
            addonGroup: 'custom-group',
          },
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfField' })
    expect(comp.find('.custom-group').exists()).toBe(true)
  })
})
