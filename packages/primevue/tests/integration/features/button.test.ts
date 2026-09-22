import { defineSchema, defineSlot } from '@vueform/primevue'
import { defineComponent, h } from 'vue'
import { createForm, mountApp } from '../../helpers'

// =============================================================================
// BASIC RENDERING
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue Button component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button' },
      }),
    })

    expect(form.findComponent({ name: 'Button' }).exists()).toBe(true)
  })

  test('has button element type', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button' },
      }),
    })

    const vfButton = form.findComponent({ name: 'VfButton' })
    expect(vfButton.vm.type).toBe('button')
  })
})

// =============================================================================
// TEXT / LABEL
// =============================================================================
describe('Text / Label', () => {
  test('passes text prop as label to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', text: 'Submit' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('label')).toBe('Submit')
  })

  test('renders null label when no text is provided', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('label')).toBeFalsy()
  })
})

// =============================================================================
// ICON
// =============================================================================
describe('Icon', () => {
  test('passes icon prop to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', icon: 'pi pi-check' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('icon')).toBe('pi pi-check')
  })

  test('passes iconPos to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', icon: 'pi pi-check', iconPos: 'right' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('iconPos')).toBe('right')
  })

  test('defaults iconPos to left', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', icon: 'pi pi-check' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('iconPos')).toBe('left')
  })
})

// =============================================================================
// SEVERITY
// =============================================================================
describe('Severity', () => {
  test('passes severity to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', severity: 'danger' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('severity')).toBe('danger')
  })
})

// =============================================================================
// VARIANT
// =============================================================================
describe('Variant', () => {
  test('maps variant "outline" to PrimeVue "outlined"', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', variant: 'outlined' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('variant')).toBe('outlined')
  })

  test('maps variant "text" to PrimeVue "text"', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', variant: 'text' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('variant')).toBe('text')
  })

  test('maps variant "link" to PrimeVue "link"', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', variant: 'link' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('variant')).toBe('link')
  })
})

// =============================================================================
// SIZE
// =============================================================================
describe('Size', () => {
  test('passes size to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', size: 'small' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('size')).toBe('small')
  })

  test('passes large size to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', size: 'large' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('size')).toBe('large')
  })
})

// =============================================================================
// LOADING
// =============================================================================
describe('Loading', () => {
  test('passes loading state to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', loading: true },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('loading')).toBe(true)
  })

  test('does not fire click when loading', async () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', loading: true },
      }),
    })

    const vfButton = form.findComponent({ name: 'VfButton' })
    const button = form.findComponent({ name: 'Button' })
    await button.trigger('click')

    expect(vfButton.vm.events).not.toHaveProperty('click')
  })
})

// =============================================================================
// DISABLED
// =============================================================================
describe('Disabled', () => {
  test('passes disabled state to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', disabled: true },
      }),
    })

    const vfButton = form.findComponent({ name: 'VfButton' })
    expect(vfButton.vm.disabled).toBe(true)
  })

  test('does not fire click when disabled', async () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', disabled: true },
      }),
    })

    const vfButton = form.findComponent({ name: 'VfButton' })
    const button = form.findComponent({ name: 'Button' })
    await button.trigger('click')

    expect(vfButton.vm.events).not.toHaveProperty('click')
  })
})

// =============================================================================
// CLICK ACTION
// =============================================================================
describe('Click action', () => {
  test('calls handleClick on button click', async () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', text: 'Click me', action: 'submit' },
      }),
    })

    const form$ = form.vm
    const submitSpy = vi.spyOn(form$, 'submit').mockImplementation(() => {})
    const button = form.findComponent({ name: 'Button' })
    await button.trigger('click')

    expect(submitSpy).toHaveBeenCalled()
  })

  test('submits the form when action is submit', async () => {
    const { form, form$ } = createForm({
      schema: defineSchema({
        el: { type: 'button', action: 'submit' },
      }),
    })

    const submitSpy = vi.spyOn(form$, 'submit').mockImplementation(() => {})
    const button = form.findComponent({ name: 'Button' })
    await button.trigger('click')

    expect(submitSpy).toHaveBeenCalled()
  })

  test('resets the form when action is reset', async () => {
    const { form, form$ } = createForm({
      schema: defineSchema({
        el: { type: 'button', action: 'reset' },
      }),
    })

    const resetSpy = vi.spyOn(form$, 'reset').mockImplementation(() => {})
    const button = form.findComponent({ name: 'Button' })
    await button.trigger('click')

    expect(resetSpy).toHaveBeenCalled()
  })
})

// =============================================================================
// HREF / ANCHOR
// =============================================================================
describe('Href / Anchor', () => {
  test('renders as anchor when href is set', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', href: 'https://example.com', text: 'Link' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('as')).toBe('a')
  })

  test('renders with default as prop when no href', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', text: 'Button' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('as')).not.toBe('a')
  })

  test('passes target and rel to anchor', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'button',
          href: 'https://example.com',
          target: '_blank',
          rel: 'noopener',
        },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.attributes('target')).toBe('_blank')
    expect(button.attributes('rel')).toBe('noopener')
  })
})

// =============================================================================
// FLUID
// =============================================================================
describe('Fluid', () => {
  test('passes fluid prop to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', fluid: true },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('fluid')).toBe(true)
  })

  test('fluid defaults to undefined', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('fluid')).toBeFalsy()
  })
})

// =============================================================================
// FORWARDED PRIMEVUE PROPS
// =============================================================================
describe('Forwarded PrimeVue props', () => {
  test('passes badge to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', text: 'Notifications', badge: '5' },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('badge')).toBe('5')
  })

  test('passes raised to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', text: 'Raised', raised: true },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('raised')).toBe(true)
  })

  test('passes rounded to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', text: 'Rounded', rounded: true },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.props('rounded')).toBe(true)
  })
})

// =============================================================================
// FORWARDED SLOTS
// =============================================================================
describe('Forwarded slots', () => {
  test('forwards icon slot to PrimeVue Button', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'button',
          text: 'Custom Icon',
          slots: {
            icon: defineSlot('VfButton.icon' as any, {
              props: ['class'],
              setup(props: any) {
                return () => h('i', { class: [props.class, 'custom-icon'] })
              },
            }),
          },
        },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.find('.custom-icon').exists()).toBe(true)
  })
})

// =============================================================================
// DEFAULT SLOT OVERRIDE
// =============================================================================
describe('Default slot override', () => {
  test('overrides button content via inline default slot', () => {
    const App = defineComponent({
      template: `
        <VfForm :schema>
          <template #default>
            <VfButton name="el">
              <template #default>
                <span class="custom-content">Custom</span>
              </template>
            </VfButton>
          </template>
        </VfForm>
      `,
      setup() {
        return { schema: defineSchema({ el: { type: 'button' } }) }
      },
    })

    const wrapper = mountApp(App)
    expect(wrapper.find('.custom-content').exists()).toBe(true)
  })

  test('overrides button content via slot prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'button',
          slots: {
            default: defineSlot('VfButton.default' as any, {
              setup() {
                return () =>
                  h('span', { class: 'slot-prop-content' }, 'From slot prop')
              },
            }),
          },
        },
      }),
    })

    const button = form.findComponent({ name: 'Button' })
    expect(button.find('.slot-prop-content').exists()).toBe(true)
  })
})

// =============================================================================
// ALIGNMENT
// =============================================================================
describe('Alignment', () => {
  test('applies left alignment class to root', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', align: 'left' },
      }),
    })

    const vfButton = form.findComponent({ name: 'VfButton' })
    expect(vfButton.find('.vf-left').exists()).toBe(true)
  })

  test('applies center alignment class to root', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', align: 'center' },
      }),
    })

    const vfButton = form.findComponent({ name: 'VfButton' })
    expect(vfButton.find('.vf-center').exists()).toBe(true)
  })

  test('applies right alignment class to root', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'button', align: 'right' },
      }),
    })

    const vfButton = form.findComponent({ name: 'VfButton' })
    expect(vfButton.find('.vf-right').exists()).toBe(true)
  })
})
