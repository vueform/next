import { defineSchema } from '@vueform/primevue'
import { defineComponent, h, markRaw, nextTick } from 'vue'
import { createForm, mountApp } from '../helpers'

// =============================================================================
// Plain textarea
// =============================================================================
describe('Plain textarea', () => {
  test('renders Textarea component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea' },
      }),
    })

    expect(form.findComponent({ name: 'Textarea' }).exists()).toBe(true)
  })

  test('renders without addon/icon/float wrappers', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea' },
      }),
    })

    expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(false)
    expect(form.findComponent({ name: 'IconField' }).exists()).toBe(false)
    expect(form.findComponent({ name: 'FloatLabel' }).exists()).toBe(false)
    expect(form.findComponent({ name: 'IftaLabel' }).exists()).toBe(false)
  })
})

// =============================================================================
// v-model
// =============================================================================
describe('v-model', () => {
  test('binds value to textarea', async () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', defaultValue: 'hello' },
      }),
    })

    await nextTick()

    const textarea = form.findComponent({ name: 'Textarea' })
    expect(textarea.props('modelValue')).toBe('hello')
  })

  test('updates value programmatically', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'textarea' },
      }),
    })

    el.update('updated text')
    await nextTick()

    const textarea = form.findComponent({ name: 'Textarea' })
    expect(textarea.props('modelValue')).toBe('updated text')
  })
})

// =============================================================================
// Disabled
// =============================================================================
describe('Disabled', () => {
  test('passes disabled prop to Textarea', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', disabled: true },
      }),
    })

    const textarea = form.findComponent({ name: 'Textarea' })
    expect(textarea.props('disabled')).toBe(true)
  })

  test('not disabled by default', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea' },
      }),
    })

    const textarea = form.findComponent({ name: 'Textarea' })
    expect(textarea.props('disabled')).toBeFalsy()
  })
})

// =============================================================================
// Readonly
// =============================================================================
describe('Readonly', () => {
  test('passes readonly prop to Textarea', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', readonly: true },
      }),
    })

    const textarea = form.findComponent({ name: 'Textarea' })
    expect(textarea.attributes('readonly')).toBeDefined()
  })
})

// =============================================================================
// Placeholder
// =============================================================================
describe('Placeholder', () => {
  test('passes placeholder to Textarea', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', placeholder: 'Enter text...' },
      }),
    })

    const textarea = form.findComponent({ name: 'Textarea' })
    expect(textarea.attributes('placeholder')).toBe('Enter text...')
  })
})

// =============================================================================
// IFTA Label
// =============================================================================
describe('IFTA Label', () => {
  test('renders IftaLabel wrapper', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', ifta: 'Description' },
      }),
    })

    expect(form.findComponent({ name: 'IftaLabel' }).exists()).toBe(true)
  })

  test('renders label text inside IftaLabel', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', ifta: 'Description' },
      }),
    })

    const iftaLabel = form.findComponent({ name: 'IftaLabel' })
    const label = iftaLabel.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Description')
  })
})

// =============================================================================
// FloatLabel
// =============================================================================
describe('FloatLabel', () => {
  test('renders FloatLabel wrapper', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', floatLabel: 'Description' },
      }),
    })

    expect(form.findComponent({ name: 'FloatLabel' }).exists()).toBe(true)
  })

  test('renders label text inside FloatLabel', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', floatLabel: 'Description' },
      }),
    })

    const floatLabel = form.findComponent({ name: 'FloatLabel' })
    const label = floatLabel.find('label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('Description')
  })
})

// =============================================================================
// Addons
// =============================================================================
describe('Addons', () => {
  test('renders InputGroup when addonBefore is set', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', addonBefore: '#' },
      }),
    })

    expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
  })

  test('renders InputGroup when addonAfter is set', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', addonAfter: 'chars' },
      }),
    })

    expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
  })
})

// =============================================================================
// Icons
// =============================================================================
describe('Icons', () => {
  test('renders IconField when iconBefore is set', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', iconBefore: 'pi pi-pencil' },
      }),
    })

    expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)
  })

  test('renders IconField when iconAfter is set', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', iconAfter: 'pi pi-pencil' },
      }),
    })

    expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)
  })
})

// =============================================================================
// PrimeVue native props
// =============================================================================
describe('PrimeVue native props', () => {
  test('passes autoResize prop to Textarea', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', autoResize: true },
      }),
    })

    const textarea = form.findComponent({ name: 'Textarea' })
    expect(textarea.props('autoResize')).toBe(true)
  })

  test('passes rows attribute to Textarea', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', rows: 10 },
      }),
    })

    const textarea = form.findComponent({ name: 'Textarea' })
    expect(textarea.attributes('rows')).toBe('10')
  })
})

// =============================================================================
// Focus / Blur
// =============================================================================
describe('Focus / Blur', () => {
  test('emits focus event', async () => {
    const onFocus = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', onFocus },
      }),
    })

    const textarea = form.find('textarea')
    await textarea.trigger('focus')
    expect(onFocus).toHaveBeenCalled()
  })

  test('emits blur event', async () => {
    const onBlur = vi.fn()
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', onBlur },
      }),
    })

    const textarea = form.find('textarea')
    await textarea.trigger('blur')
    expect(onBlur).toHaveBeenCalled()
  })
})

// =============================================================================
// Validation
// =============================================================================
describe('Validation', () => {
  test('passes invalid state to Textarea', async () => {
    const { form, form$ } = createForm({
      schema: defineSchema({
        el: { type: 'textarea', rules: 'required' },
      }),
    })

    await form$.validate()
    await nextTick()

    const textarea = form.findComponent({ name: 'Textarea' })
    expect(textarea.props('invalid')).toBe(true)
  })
})

// =============================================================================
// Template slot
// =============================================================================
describe('Template slot', () => {
  test('renders custom template via slot prop', () => {
    const CustomTemplate = defineComponent({
      props: ['context'],
      render() {
        return h('div', { class: 'custom-textarea' }, 'Custom')
      },
    })

    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'textarea',
          slots: { template: markRaw(CustomTemplate) },
        },
      }),
    })

    expect(form.find('.custom-textarea').exists()).toBe(true)
    expect(form.findComponent({ name: 'Textarea' }).exists()).toBe(false)
  })
})

// =============================================================================
// Inline template
// =============================================================================
describe('Inline template', () => {
  test('renders VfTextarea with inline template', async () => {
    const App = defineComponent({
      template: `
        <VfForm>
          <VfTextarea name="el" placeholder="Write here..." />
        </VfForm>
      `,
    })

    const app = mountApp(App)
    await nextTick()
    await nextTick()

    expect(app.findComponent({ name: 'Textarea' }).exists()).toBe(true)
    expect(
      app.findComponent({ name: 'Textarea' }).attributes('placeholder')
    ).toBe('Write here...')
  })
})
