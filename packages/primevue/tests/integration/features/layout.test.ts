import { defineSchema, defineSlot } from '@vueform/primevue'
import InputGroupAddon from 'primevue/inputgroupaddon'
import { defineComponent, h, markRaw, nextTick } from 'vue'

import { createForm, mountApp } from '../../helpers'

// =============================================================================
// Plain input
// =============================================================================
describe('Plain input', () => {
  test('renders input without wrappers', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text', placeholder: 'Plain input' },
      }),
    })

    expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(false)
    expect(form.findComponent({ name: 'IconField' }).exists()).toBe(false)
    expect(form.findComponent({ name: 'FloatLabel' }).exists()).toBe(false)
    expect(form.findComponent({ name: 'IftaLabel' }).exists()).toBe(false)
    expect(form.findComponent({ name: 'InputText' }).exists()).toBe(true)
  })
})

// =============================================================================
// IFTA Label
// =============================================================================
describe('IFTA Label', () => {
  describe('via props', () => {
    test('renders IftaLabel wrapper', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', ifta: 'IFTA Label' },
        }),
      })

      expect(form.findComponent({ name: 'IftaLabel' }).exists()).toBe(true)
    })

    test('renders label text inside IftaLabel', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', ifta: 'IFTA Label' },
        }),
      })

      const iftaLabel = form.findComponent({ name: 'IftaLabel' })
      const label = iftaLabel.find('label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('IFTA Label')
    })

    test('label has for attribute pointing to input id', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', ifta: 'IFTA Label' },
        }),
      })

      const iftaLabel = form.findComponent({ name: 'IftaLabel' })
      const label = iftaLabel.find('label')
      const input = form.findComponent({ name: 'InputText' })
      expect(label.attributes('for')).toBe(input.attributes('id'))
    })

    test('main label group uses span instead of label tag', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', ifta: 'IFTA Label', label: 'Main Label' },
        }),
      })

      const labelGroup = form.find('.vf-label-group')
      const labelEl = labelGroup.find('.vf-label')
      expect(labelEl.element.tagName).toBe('SPAN')
    })

    test('does not render FloatLabel', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', ifta: 'IFTA Label' },
        }),
      })

      expect(form.findComponent({ name: 'FloatLabel' }).exists()).toBe(false)
    })
  })

  describe('via slot prop', () => {
    test('renders IftaLabel wrapper with slot content', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            slots: {
              ifta: defineSlot('VfInputText.ifta', {
                setup() {
                  return () => 'IFTA via slot'
                },
              }),
            },
          },
        }),
      })

      const iftaLabel = form.findComponent({ name: 'IftaLabel' })
      expect(iftaLabel.exists()).toBe(true)
      expect(iftaLabel.text()).toContain('IFTA via slot')
    })

    test('wraps slot content in label tag', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            slots: {
              ifta: defineSlot('VfInputText.ifta', {
                setup() {
                  return () => 'IFTA via slot'
                },
              }),
            },
          },
        }),
      })

      const iftaLabel = form.findComponent({ name: 'IftaLabel' })
      const label = iftaLabel.find('label')
      expect(label.exists()).toBe(true)
      expect(label.attributes('for')).toBeTruthy()
    })
  })
})

// =============================================================================
// Float Label
// =============================================================================
describe('Float Label', () => {
  describe('via props', () => {
    test('renders FloatLabel wrapper', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', floatLabel: 'Float Label' },
        }),
      })

      expect(form.findComponent({ name: 'FloatLabel' }).exists()).toBe(true)
    })

    test('renders label text inside FloatLabel', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', floatLabel: 'Float Label' },
        }),
      })

      const floatLabel = form.findComponent({ name: 'FloatLabel' })
      const label = floatLabel.find('label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Float Label')
    })

    test('label has for attribute pointing to input id', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', floatLabel: 'Float Label' },
        }),
      })

      const floatLabel = form.findComponent({ name: 'FloatLabel' })
      const label = floatLabel.find('label')
      const input = form.findComponent({ name: 'InputText' })
      expect(label.attributes('for')).toBe(input.attributes('id'))
    })

    test('main label group uses span instead of label tag', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            floatLabel: 'Float Label',
            label: 'Main Label',
          },
        }),
      })

      const labelGroup = form.find('.vf-label-group')
      const labelEl = labelGroup.find('.vf-label')
      expect(labelEl.element.tagName).toBe('SPAN')
    })

    test('does not render IftaLabel', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', floatLabel: 'Float Label' },
        }),
      })

      expect(form.findComponent({ name: 'IftaLabel' }).exists()).toBe(false)
    })
  })

  describe('via slot prop', () => {
    test('renders FloatLabel wrapper with slot content', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            slots: {
              'float-label': defineSlot('VfInputText.floatLabel', {
                setup() {
                  return () => 'Float via slot'
                },
              }),
            },
          },
        }),
      })

      const floatLabel = form.findComponent({ name: 'FloatLabel' })
      expect(floatLabel.exists()).toBe(true)
      expect(floatLabel.text()).toContain('Float via slot')
    })

    test('wraps slot content in label tag', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            slots: {
              'float-label': defineSlot('VfInputText.floatLabel', {
                setup() {
                  return () => 'Float via slot'
                },
              }),
            },
          },
        }),
      })

      const floatLabel = form.findComponent({ name: 'FloatLabel' })
      const label = floatLabel.find('label')
      expect(label.exists()).toBe(true)
      expect(label.attributes('for')).toBeTruthy()
    })
  })
})

// =============================================================================
// Icon Before
// =============================================================================
describe('Icon Before', () => {
  describe('via props', () => {
    test('renders IconField wrapper', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', iconBefore: 'pi pi-search' },
        }),
      })

      expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)
    })

    test('renders InputIcon with correct class', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', iconBefore: 'pi pi-search' },
        }),
      })

      const inputIcon = form.findComponent({ name: 'InputIcon' })
      expect(inputIcon.exists()).toBe(true)
      expect(inputIcon.classes()).toContain('pi')
      expect(inputIcon.classes()).toContain('pi-search')
    })
  })

  describe('via slot prop', () => {
    test('renders IconField wrapper', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            placeholder: 'Icon before slot',
            slots: {
              'icon-before': defineSlot('VfInputText.iconBefore', {
                setup() {
                  return () => h('i', { class: 'pi pi-search' })
                },
              }),
            },
          },
        }),
      })

      expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)
    })

    test('wraps slot content in InputIcon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            placeholder: 'Icon before slot',
            slots: {
              'icon-before': defineSlot('VfInputText.iconBefore', {
                setup() {
                  return () => h('i', { class: 'pi pi-search' })
                },
              }),
            },
          },
        }),
      })

      const inputIcon = form.findComponent({ name: 'InputIcon' })
      expect(inputIcon.exists()).toBe(true)
      expect(inputIcon.find('i.pi.pi-search').exists()).toBe(true)
    })
  })
})

// =============================================================================
// Icon After
// =============================================================================
describe('Icon After', () => {
  describe('via props', () => {
    test('renders IconField wrapper', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', iconAfter: 'pi pi-lock' },
        }),
      })

      expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)
    })

    test('renders InputIcon with correct class', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', iconAfter: 'pi pi-lock' },
        }),
      })

      const inputIcon = form.findComponent({ name: 'InputIcon' })
      expect(inputIcon.exists()).toBe(true)
      expect(inputIcon.classes()).toContain('pi')
      expect(inputIcon.classes()).toContain('pi-lock')
    })
  })

  describe('via slot prop', () => {
    test('renders IconField wrapper', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            slots: {
              'icon-after': defineSlot('VfInputText.iconAfter', {
                setup() {
                  return () => h('i', { class: 'pi pi-lock' })
                },
              }),
            },
          },
        }),
      })

      expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)
    })

    test('wraps slot content in InputIcon', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            slots: {
              'icon-after': defineSlot('VfInputText.iconAfter', {
                setup() {
                  return () => h('i', { class: 'pi pi-lock' })
                },
              }),
            },
          },
        }),
      })

      const inputIcon = form.findComponent({ name: 'InputIcon' })
      expect(inputIcon.exists()).toBe(true)
      expect(inputIcon.find('i.pi.pi-lock').exists()).toBe(true)
    })
  })
})

// =============================================================================
// Icons Both
// =============================================================================
describe('Icons Both', () => {
  test('renders IconField with two InputIcons', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          iconBefore: 'pi pi-search',
          iconAfter: 'pi pi-lock',
        },
      }),
    })

    expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)

    const icons = form.findAllComponents({ name: 'InputIcon' })
    expect(icons.length).toBe(2)
  })
})

// =============================================================================
// Addon Before
// =============================================================================
describe('Addon Before', () => {
  describe('via props', () => {
    test('renders InputGroup wrapper', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', addonBefore: '$' },
        }),
      })

      expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
    })

    test('renders InputGroupAddon with text content', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', addonBefore: '$' },
        }),
      })

      const addon = form.findComponent({ name: 'InputGroupAddon' })
      expect(addon.exists()).toBe(true)
      expect(addon.text()).toBe('$')
    })
  })

  describe('via slot prop', () => {
    test('renders InputGroup with custom addon slot', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            placeholder: 'Addon before slot',
            slots: {
              'addon-before': defineSlot('VfInputText.addonBefore', {
                setup() {
                  return () => h(InputGroupAddon, null, () => '$')
                },
              }),
            },
          },
        }),
      })

      expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
      const addon = form.findComponent({ name: 'InputGroupAddon' })
      expect(addon.exists()).toBe(true)
      expect(addon.text()).toBe('$')
    })
  })
})

// =============================================================================
// Addon After
// =============================================================================
describe('Addon After', () => {
  describe('via props', () => {
    test('renders InputGroup wrapper', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', addonAfter: '.00' },
        }),
      })

      expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
    })

    test('renders InputGroupAddon with text content', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', addonAfter: '.00' },
        }),
      })

      const addon = form.findComponent({ name: 'InputGroupAddon' })
      expect(addon.exists()).toBe(true)
      expect(addon.text()).toBe('.00')
    })
  })

  describe('via slot prop', () => {
    test('renders InputGroup with custom addon slot', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            placeholder: 'Addon after slot',
            slots: {
              'addon-after': defineSlot('VfInputText.addonAfter', {
                setup() {
                  return () => h(InputGroupAddon, null, () => '.00')
                },
              }),
            },
          },
        }),
      })

      expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
      const addon = form.findComponent({ name: 'InputGroupAddon' })
      expect(addon.exists()).toBe(true)
      expect(addon.text()).toBe('.00')
    })
  })
})

// =============================================================================
// Addons Both
// =============================================================================
describe('Addons Both', () => {
  test('renders InputGroup with before and after addons', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          addonBefore: '$',
          addonAfter: '.00',
        },
      }),
    })

    expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)

    const addons = form.findAllComponents({ name: 'InputGroupAddon' })
    expect(addons.length).toBe(2)
    expect(addons[0].text()).toBe('$')
    expect(addons[1].text()).toBe('.00')
  })
})

// =============================================================================
// Translate (Language Addon)
// =============================================================================
describe('Translate', () => {
  describe('via props', () => {
    test('renders InputGroup with language Select', () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: { type: 'input-text', translate: true },
          }),
        },
        {
          languages: { en: 'English', fr: 'French' },
        }
      )

      expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
      expect(form.findComponent({ name: 'Select' }).exists()).toBe(true)
    })

    test('renders sr-only language announcement', () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: { type: 'input-text', translate: true },
          }),
        },
        {
          languages: { en: 'English', fr: 'French' },
        }
      )

      const srOnly = form.find('.sr-only')
      expect(srOnly.exists()).toBe(true)
      expect(srOnly.attributes('aria-live')).toBeTruthy()
    })
  })

  describe('via slot prop', () => {
    test('renders custom language slot content', () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'input-text',
              translate: true,
              slots: {
                language: defineSlot('VfInputText.language', {
                  props: ['language', 'languages'],
                  setup(props: any) {
                    return () =>
                      h(InputGroupAddon, null, () =>
                        h(
                          'span',
                          { class: 'custom-lang' },
                          props.language?.toUpperCase()
                        )
                      )
                  },
                }),
              },
            },
          }),
        },
        {
          languages: { en: 'English', fr: 'French' },
        }
      )

      expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
      expect(form.find('.custom-lang').exists()).toBe(true)
    })
  })
})

// =============================================================================
// FloatLabel + Icons
// =============================================================================
describe('FloatLabel + Icons', () => {
  test('renders FloatLabel wrapping IconField', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          floatLabel: 'Float + Icons',
          iconBefore: 'pi pi-search',
          iconAfter: 'pi pi-lock',
        },
      }),
    })

    expect(form.findComponent({ name: 'FloatLabel' }).exists()).toBe(true)
    expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)

    const icons = form.findAllComponents({ name: 'InputIcon' })
    expect(icons.length).toBe(2)
  })

  test('FloatLabel contains IconField as descendant', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          floatLabel: 'Float + Icons',
          iconBefore: 'pi pi-search',
        },
      }),
    })

    const floatLabel = form.findComponent({ name: 'FloatLabel' })
    expect(floatLabel.findComponent({ name: 'IconField' }).exists()).toBe(true)
  })
})

// =============================================================================
// IFTA + Icons
// =============================================================================
describe('IFTA + Icons', () => {
  test('renders IftaLabel wrapping IconField', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          ifta: 'IFTA + Icons',
          iconBefore: 'pi pi-search',
          iconAfter: 'pi pi-lock',
        },
      }),
    })

    expect(form.findComponent({ name: 'IftaLabel' }).exists()).toBe(true)
    expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)
  })

  test('IftaLabel contains IconField as descendant', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          ifta: 'IFTA + Icons',
          iconBefore: 'pi pi-search',
        },
      }),
    })

    const iftaLabel = form.findComponent({ name: 'IftaLabel' })
    expect(iftaLabel.findComponent({ name: 'IconField' }).exists()).toBe(true)
  })
})

// =============================================================================
// FloatLabel + Addons
// =============================================================================
describe('FloatLabel + Addons', () => {
  test('renders InputGroup with FloatLabel and addons', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          floatLabel: 'Float + Addons',
          addonBefore: '$',
          addonAfter: '.00',
        },
      }),
    })

    expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
    expect(form.findComponent({ name: 'FloatLabel' }).exists()).toBe(true)

    const addons = form.findAllComponents({ name: 'InputGroupAddon' })
    expect(addons.length).toBe(2)
  })

  test('FloatLabel is inside InputGroup', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          floatLabel: 'Float + Addons',
          addonBefore: '$',
        },
      }),
    })

    const inputGroup = form.findComponent({ name: 'InputGroup' })
    expect(inputGroup.findComponent({ name: 'FloatLabel' }).exists()).toBe(true)
  })
})

// =============================================================================
// IFTA + Addons
// =============================================================================
describe('IFTA + Addons', () => {
  test('renders InputGroup with IftaLabel and addons', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          ifta: 'IFTA + Addons',
          addonBefore: '$',
          addonAfter: '.00',
        },
      }),
    })

    expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
    expect(form.findComponent({ name: 'IftaLabel' }).exists()).toBe(true)

    const addons = form.findAllComponents({ name: 'InputGroupAddon' })
    expect(addons.length).toBe(2)
  })
})

// =============================================================================
// FloatLabel + Addons + Icons
// =============================================================================
describe('FloatLabel + Addons + Icons', () => {
  test('renders all wrappers in correct nesting', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          floatLabel: 'Float + Addons + Icons',
          addonBefore: '$',
          addonAfter: '.00',
          iconBefore: 'pi pi-search',
          iconAfter: 'pi pi-lock',
        },
      }),
    })

    expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
    expect(form.findComponent({ name: 'FloatLabel' }).exists()).toBe(true)
    expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)

    const addons = form.findAllComponents({ name: 'InputGroupAddon' })
    expect(addons.length).toBe(2)

    const icons = form.findAllComponents({ name: 'InputIcon' })
    expect(icons.length).toBe(2)
  })

  test('correct nesting: InputGroup > FloatLabel > IconField', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          floatLabel: 'Float + Addons + Icons',
          addonBefore: '$',
          iconBefore: 'pi pi-search',
        },
      }),
    })

    const inputGroup = form.findComponent({ name: 'InputGroup' })
    const floatLabel = inputGroup.findComponent({ name: 'FloatLabel' })
    expect(floatLabel.exists()).toBe(true)
    expect(floatLabel.findComponent({ name: 'IconField' }).exists()).toBe(true)
  })
})

// =============================================================================
// IFTA + Addons + Icons
// =============================================================================
describe('IFTA + Addons + Icons', () => {
  test('renders all wrappers in correct nesting', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          ifta: 'IFTA + Addons + Icons',
          addonBefore: '$',
          addonAfter: '.00',
          iconBefore: 'pi pi-search',
          iconAfter: 'pi pi-lock',
        },
      }),
    })

    expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
    expect(form.findComponent({ name: 'IftaLabel' }).exists()).toBe(true)
    expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)

    const addons = form.findAllComponents({ name: 'InputGroupAddon' })
    expect(addons.length).toBe(2)

    const icons = form.findAllComponents({ name: 'InputIcon' })
    expect(icons.length).toBe(2)
  })

  test('correct nesting: InputGroup > IftaLabel > IconField', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          ifta: 'IFTA + Addons + Icons',
          addonBefore: '$',
          iconBefore: 'pi pi-search',
        },
      }),
    })

    const inputGroup = form.findComponent({ name: 'InputGroup' })
    const iftaLabel = inputGroup.findComponent({ name: 'IftaLabel' })
    expect(iftaLabel.exists()).toBe(true)
    expect(iftaLabel.findComponent({ name: 'IconField' }).exists()).toBe(true)
  })
})

// =============================================================================
// No wrappers when no features configured
// =============================================================================
describe('No wrappers', () => {
  test('no InputGroup without addons or translate', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text' },
      }),
    })

    expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(false)
  })

  test('no IconField without icons', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text' },
      }),
    })

    expect(form.findComponent({ name: 'IconField' }).exists()).toBe(false)
  })

  test('no FloatLabel or IftaLabel without float or ifta', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'input-text' },
      }),
    })

    expect(form.findComponent({ name: 'FloatLabel' }).exists()).toBe(false)
    expect(form.findComponent({ name: 'IftaLabel' }).exists()).toBe(false)
  })
})

// =============================================================================
// Multiple static addons
// =============================================================================
describe('Multiple static addons', () => {
  test('renders multiple InputGroupAddons before and after', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'input-text',
          addonBefore: ['$', 'USD'],
          addonAfter: ['.00', '/mo'],
        },
      }),
    })

    expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)

    const addons = form.findAllComponents({ name: 'InputGroupAddon' })
    expect(addons.length).toBe(4)
    expect(addons[0].text()).toBe('$')
    expect(addons[1].text()).toBe('USD')
    expect(addons[2].text()).toBe('.00')
    expect(addons[3].text()).toBe('/mo')
  })
})

// =============================================================================
// Label
// =============================================================================
describe('Label', () => {
  describe('via props', () => {
    test('renders label text', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', label: 'Label text' },
        }),
      })

      const label = form.find('.vf-label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Label text')
    })

    test('label has correct for attribute pointing to element id', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', label: 'Label text' },
        }),
      })

      const label = form.find('.vf-label')
      const input = form.findComponent({ name: 'InputText' })
      expect(label.attributes('for')).toBe(input.attributes('id'))
    })

    test('label has correct id attribute', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', label: 'Label text' },
        }),
      })

      const label = form.find('.vf-label')
      expect(label.attributes('id')).toBeTruthy()
    })

    test('label renders as <label> tag by default', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', label: 'Label text' },
        }),
      })

      const label = form.find('.vf-label')
      expect(label.element.tagName).toBe('LABEL')
    })

    test('no label renders no label group', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text' },
        }),
      })

      expect(form.find('.vf-label-group').exists()).toBe(false)
    })
  })

  describe('via slot prop', () => {
    test('renders custom label component', () => {
      const labelSlot = markRaw(
        defineComponent({
          props: ['label', 'for', 'id', 'class'],
          inheritAttrs: false,
          setup(props) {
            return () =>
              h(
                'label',
                {
                  for: props.for,
                  id: props.id,
                  class: ['custom-label', props.class],
                },
                props.label
              )
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'Label text',
            slots: { label: labelSlot },
          },
        }),
      })

      const label = form.find('.custom-label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Label text')
    })

    test('slot receives for attribute', () => {
      const labelSlot = markRaw(
        defineComponent({
          props: ['label', 'for', 'id'],
          inheritAttrs: false,
          setup(props) {
            return () =>
              h('label', { for: props.for, class: 'custom-label' }, props.label)
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'Label text',
            slots: { label: labelSlot },
          },
        }),
      })

      const label = form.find('.custom-label')
      const input = form.findComponent({ name: 'InputText' })
      expect(label.attributes('for')).toBe(input.attributes('id'))
    })

    test('slot receives id attribute', () => {
      const labelSlot = markRaw(
        defineComponent({
          props: ['label', 'for', 'id'],
          inheritAttrs: false,
          setup(props) {
            return () =>
              h('label', { id: props.id, class: 'custom-label' }, props.label)
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'Label text',
            slots: { label: labelSlot },
          },
        }),
      })

      const label = form.find('.custom-label')
      expect(label.attributes('id')).toBeTruthy()
    })

    test('slot receives class attribute', () => {
      const labelSlot = markRaw(
        defineComponent({
          props: ['label', 'for', 'id', 'class'],
          inheritAttrs: false,
          setup(props) {
            return () =>
              h('label', { class: ['custom-label', props.class] }, props.label)
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'Label text',
            slots: { label: labelSlot },
          },
        }),
      })

      const label = form.find('.custom-label')
      expect(label.classes()).toContain('vf-label')
    })
  })

  describe('via inline slot', () => {
    test('renders custom label', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfInputText name="el" label="Label text">
              <template #label="{ label }">
                <label class="custom-label">{{ label }}</label>
              </template>
            </VfInputText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      const label = app.find('.custom-label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Label text')
    })

    test('slot receives for, id, and class', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfInputText name="el" label="Label text">
              <template #label="{ label, for: htmlFor, id, class: cls }">
                <label :for="htmlFor" :id="id" :class="['custom-label', cls]">{{ label }}</label>
              </template>
            </VfInputText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      const label = app.find('.custom-label')
      const input = app.findComponent({ name: 'InputText' })
      expect(label.attributes('for')).toBe(input.attributes('id'))
      expect(label.attributes('id')).toBeTruthy()
      expect(label.classes()).toContain('vf-label')
    })
  })
})

// =============================================================================
// Description
// =============================================================================
describe('Description', () => {
  describe('via props', () => {
    test('renders description inside Message component', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', description: 'This is a description' },
        }),
      })

      const messages = form.findAllComponents({ name: 'Message' })
      const descriptionMessage = messages.find(
        (m) => m.props('severity') === 'secondary'
      )
      expect(descriptionMessage).toBeTruthy()
      expect(descriptionMessage!.text()).toBe('This is a description')
    })

    test('description Message has id attribute', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', description: 'This is a description' },
        }),
      })

      const messages = form.findAllComponents({ name: 'Message' })
      const descriptionMessage = messages.find(
        (m) => m.props('severity') === 'secondary'
      )
      expect(descriptionMessage!.attributes('id')).toBeTruthy()
    })

    test('no description renders no description Message', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text' },
        }),
      })

      const messages = form.findAllComponents({ name: 'Message' })
      const descriptionMessage = messages.find(
        (m) => m.props('severity') === 'secondary'
      )
      expect(descriptionMessage).toBeUndefined()
    })
  })

  describe('via slot prop', () => {
    test('renders custom description component', () => {
      const descriptionSlot = markRaw(
        defineComponent({
          props: ['description', 'id', 'class'],
          inheritAttrs: false,
          setup(props) {
            return () =>
              h(
                'div',
                { id: props.id, class: ['custom-description', props.class] },
                props.description
              )
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            description: 'This is a description',
            slots: { description: descriptionSlot },
          },
        }),
      })

      const description = form.find('.custom-description')
      expect(description.exists()).toBe(true)
      expect(description.text()).toBe('This is a description')
    })

    test('slot receives id attribute', () => {
      const descriptionSlot = markRaw(
        defineComponent({
          props: ['description', 'id'],
          inheritAttrs: false,
          setup(props) {
            return () =>
              h(
                'div',
                { id: props.id, class: 'custom-description' },
                props.description
              )
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            description: 'This is a description',
            slots: { description: descriptionSlot },
          },
        }),
      })

      const description = form.find('.custom-description')
      expect(description.attributes('id')).toBeTruthy()
    })
  })

  describe('via inline slot', () => {
    test('renders custom description', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfInputText name="el" description="This is a description">
              <template #description="{ description }">
                <div class="custom-description">{{ description }}</div>
              </template>
            </VfInputText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      const description = app.find('.custom-description')
      expect(description.exists()).toBe(true)
      expect(description.text()).toBe('This is a description')
    })

    test('slot receives id', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfInputText name="el" description="This is a description">
              <template #description="{ description, id }">
                <div :id="id" class="custom-description">{{ description }}</div>
              </template>
            </VfInputText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      const description = app.find('.custom-description')
      expect(description.attributes('id')).toBeTruthy()
    })
  })
})

// =============================================================================
// Help
// =============================================================================
describe('Help', () => {
  describe('via props', () => {
    test('renders help inside Message component', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With help',
            help: 'This is help text',
          },
        }),
      })

      const labelGroup = form.find('.vf-label-group')
      const message = labelGroup.findComponent({ name: 'Message' })
      expect(message.exists()).toBe(true)
      expect(message.text()).toBe('This is help text')
    })

    test('help Message has id attribute', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With help',
            help: 'This is help text',
          },
        }),
      })

      const labelGroup = form.find('.vf-label-group')
      const message = labelGroup.findComponent({ name: 'Message' })
      expect(message.attributes('id')).toBeTruthy()
    })

    test('help Message has severity secondary', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With help',
            help: 'This is help text',
          },
        }),
      })

      const labelGroup = form.find('.vf-label-group')
      const message = labelGroup.findComponent({ name: 'Message' })
      expect(message.props('severity')).toBe('secondary')
    })

    test('no help renders no help Message in label group', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', label: 'No help' },
        }),
      })

      const labelGroup = form.find('.vf-label-group')
      expect(labelGroup.findComponent({ name: 'Message' }).exists()).toBe(false)
    })
  })

  describe('via slot prop', () => {
    test('renders custom help component', () => {
      const helpSlot = markRaw(
        defineComponent({
          props: ['help', 'id', 'class'],
          inheritAttrs: false,
          setup(props) {
            return () =>
              h(
                'div',
                { id: props.id, class: ['custom-help', props.class] },
                props.help
              )
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With help',
            help: 'This is help text',
            slots: { help: helpSlot },
          },
        }),
      })

      const help = form.find('.custom-help')
      expect(help.exists()).toBe(true)
      expect(help.text()).toBe('This is help text')
    })

    test('slot receives id attribute', () => {
      const helpSlot = markRaw(
        defineComponent({
          props: ['help', 'id'],
          inheritAttrs: false,
          setup(props) {
            return () =>
              h('div', { id: props.id, class: 'custom-help' }, props.help)
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With help',
            help: 'This is help text',
            slots: { help: helpSlot },
          },
        }),
      })

      const help = form.find('.custom-help')
      expect(help.attributes('id')).toBeTruthy()
    })
  })

  describe('via inline slot', () => {
    test('renders custom help', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfInputText name="el" label="With help" help="This is help text">
              <template #help="{ help }">
                <div class="custom-help">{{ help }}</div>
              </template>
            </VfInputText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      const help = app.find('.custom-help')
      expect(help.exists()).toBe(true)
      expect(help.text()).toBe('This is help text')
    })

    test('slot receives id', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfInputText name="el" label="With help" help="This is help text">
              <template #help="{ help, id }">
                <div :id="id" class="custom-help">{{ help }}</div>
              </template>
            </VfInputText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      const help = app.find('.custom-help')
      expect(help.attributes('id')).toBeTruthy()
    })
  })
})

// =============================================================================
// Info
// =============================================================================
describe('Info', () => {
  describe('via props', () => {
    test('renders info container when info prop is set', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            info: 'Some helpful information',
          },
        }),
      })

      expect(form.find('.vf-info').exists()).toBe(true)
    })

    test('renders info icon with PrimeIcon classes', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            info: 'Some helpful information',
          },
        }),
      })

      const infoIcon = form.find('.vf-info-icon')
      expect(infoIcon.exists()).toBe(true)
      expect(infoIcon.classes()).toContain('pi')
      expect(infoIcon.classes()).toContain('pi-info-circle')
    })

    test('info icon is a span element', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            info: 'Some helpful information',
          },
        }),
      })

      const infoIcon = form.find('.vf-info-icon')
      expect(infoIcon.element.tagName).toBe('SPAN')
    })

    test('info is inside the label group', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            info: 'Some helpful information',
          },
        }),
      })

      const labelGroup = form.find('.vf-label-group')
      expect(labelGroup.find('.vf-info').exists()).toBe(true)
    })

    test('info appears alongside label', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            info: 'Some helpful information',
          },
        }),
      })

      const labelGroup = form.find('.vf-label-group')
      expect(labelGroup.find('.vf-label').exists()).toBe(true)
      expect(labelGroup.find('.vf-info').exists()).toBe(true)
    })

    test('no info renders when info prop is absent', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', label: 'No info' },
        }),
      })

      expect(form.find('.vf-info').exists()).toBe(false)
      expect(form.find('.vf-info-icon').exists()).toBe(false)
    })

    test('no info renders when label is absent', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'input-text', info: 'Some info' },
        }),
      })

      expect(form.find('.vf-info').exists()).toBe(false)
    })

    test('infoPosition can be set to bottom', () => {
      const { el: el$ } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            info: 'Some helpful information',
            infoPosition: 'bottom',
          },
        }),
      })

      expect(el$.infoPosition).toBe('bottom')
    })

    test('infoPosition can be set to left', () => {
      const { el: el$ } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            info: 'Some helpful information',
            infoPosition: 'left',
          },
        }),
      })

      expect(el$.infoPosition).toBe('left')
    })

    test('infoPosition can be set to right', () => {
      const { el: el$ } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            info: 'Some helpful information',
            infoPosition: 'right',
          },
        }),
      })

      expect(el$.infoPosition).toBe('right')
    })

    test('info renders with floatLabel', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'Email',
            info: 'We will never share your email.',
            floatLabel: 'Email address',
          },
        }),
      })

      expect(form.find('.vf-info').exists()).toBe(true)
      expect(form.find('.vf-info-icon').exists()).toBe(true)
      expect(form.findComponent({ name: 'FloatLabel' }).exists()).toBe(true)
    })

    test('info renders with ifta', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'Phone',
            info: 'Include country code.',
            ifta: 'Phone number',
          },
        }),
      })

      expect(form.find('.vf-info').exists()).toBe(true)
      expect(form.find('.vf-info-icon').exists()).toBe(true)
      expect(form.findComponent({ name: 'IftaLabel' }).exists()).toBe(true)
    })

    test('info renders with icons', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'Search',
            info: 'Search across all records.',
            iconBefore: 'pi pi-search',
          },
        }),
      })

      expect(form.find('.vf-info').exists()).toBe(true)
      expect(form.findComponent({ name: 'IconField' }).exists()).toBe(true)
    })

    test('info renders with addons', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'Price',
            info: 'Enter the price in USD.',
            addonBefore: '$',
            addonAfter: '.00',
          },
        }),
      })

      expect(form.find('.vf-info').exists()).toBe(true)
      expect(form.findComponent({ name: 'InputGroup' }).exists()).toBe(true)
    })
  })

  describe('via slot prop', () => {
    test('renders custom info component with info text', () => {
      const infoSlot = markRaw(
        defineComponent({
          props: ['info'],
          inheritAttrs: false,
          setup(props) {
            return () => h('span', { class: 'custom-info' }, props.info)
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            info: 'Custom info text',
            slots: { info: infoSlot },
          },
        }),
      })

      const info = form.find('.custom-info')
      expect(info.exists()).toBe(true)
      expect(info.text()).toBe('Custom info text')
    })

    test('slot replaces default info icon', () => {
      const infoSlot = markRaw(
        defineComponent({
          props: ['info'],
          inheritAttrs: false,
          setup(props) {
            return () => h('span', { class: 'custom-info' }, props.info)
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            info: 'Custom info text',
            slots: { info: infoSlot },
          },
        }),
      })

      expect(form.find('.vf-info-icon').exists()).toBe(false)
      expect(form.find('.custom-info').exists()).toBe(true)
    })

    test('info container still has vf-info class when slot is used', () => {
      const infoSlot = markRaw(
        defineComponent({
          props: ['info'],
          inheritAttrs: false,
          setup(props) {
            return () => h('span', { class: 'custom-info' }, props.info)
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            info: 'Custom info text',
            slots: { info: infoSlot },
          },
        }),
      })

      expect(form.find('.vf-info').exists()).toBe(true)
    })

    test('info renders when slot is defined without info prop', () => {
      const infoSlot = markRaw(
        defineComponent({
          inheritAttrs: false,
          setup() {
            return () => h('span', { class: 'custom-info' }, 'Slot-only info')
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'With info',
            slots: { info: infoSlot },
          },
        }),
      })

      const info = form.find('.custom-info')
      expect(info.exists()).toBe(true)
      expect(info.text()).toBe('Slot-only info')
    })

    test('info slot works with floatLabel', () => {
      const infoSlot = markRaw(
        defineComponent({
          props: ['info'],
          inheritAttrs: false,
          setup(props) {
            return () => h('span', { class: 'custom-info' }, props.info)
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'input-text',
            label: 'Email',
            info: 'Email info',
            floatLabel: 'Email address',
            slots: { info: infoSlot },
          },
        }),
      })

      expect(form.find('.custom-info').exists()).toBe(true)
      expect(form.find('.custom-info').text()).toBe('Email info')
      expect(form.findComponent({ name: 'FloatLabel' }).exists()).toBe(true)
    })
  })

  describe('via inline slot', () => {
    test('renders custom info content', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfInputText name="el" label="With info" info="Info text">
              <template #info="{ info }">
                <span class="custom-info">{{ info }}</span>
              </template>
            </VfInputText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      const info = app.find('.custom-info')
      expect(info.exists()).toBe(true)
      expect(info.text()).toBe('Info text')
    })

    test('inline slot replaces default info icon', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfInputText name="el" label="With info" info="Info text">
              <template #info="{ info }">
                <span class="custom-info">{{ info }}</span>
              </template>
            </VfInputText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      expect(app.find('.vf-info-icon').exists()).toBe(false)
      expect(app.find('.custom-info').exists()).toBe(true)
    })

    test('inline slot renders without info prop', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfInputText name="el" label="With info">
              <template #info>
                <span class="custom-info">Slot-only</span>
              </template>
            </VfInputText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      expect(app.find('.custom-info').exists()).toBe(true)
      expect(app.find('.custom-info').text()).toBe('Slot-only')
    })

    test('info inline slot with floatLabel', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfInputText name="el" label="Email" info="Email info">
              <template #float-label>Email address</template>
              <template #info="{ info }">
                <span class="custom-info">{{ info }}</span>
              </template>
            </VfInputText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      expect(app.find('.custom-info').exists()).toBe(true)
      expect(app.find('.custom-info').text()).toBe('Email info')
    })
  })
})

// =============================================================================
// Group with heading
// =============================================================================
describe('Group with heading', () => {
  describe('via props', () => {
    test('renders group as fieldset', () => {
      const { form } = createForm({
        schema: defineSchema({
          address: {
            type: 'group',
            label: 'Address',
            heading: 3,
            schema: {
              street: { type: 'input-text' },
            },
          },
        }),
      })

      expect(form.find('fieldset').exists()).toBe(true)
    })

    test('renders label as heading tag', () => {
      const { form } = createForm({
        schema: defineSchema({
          address: {
            type: 'group',
            label: 'Address',
            heading: 3,
            schema: {
              street: { type: 'input-text' },
            },
          },
        }),
      })

      const heading = form.find('h3')
      expect(heading.exists()).toBe(true)
      expect(heading.text()).toBe('Address')
    })

    test('heading has label id', () => {
      const { form } = createForm({
        schema: defineSchema({
          address: {
            type: 'group',
            label: 'Address',
            heading: 3,
            schema: {
              street: { type: 'input-text' },
            },
          },
        }),
      })

      const heading = form.find('h3')
      expect(heading.attributes('id')).toBeTruthy()
    })

    test('heading has vf-label class', () => {
      const { form } = createForm({
        schema: defineSchema({
          address: {
            type: 'group',
            label: 'Address',
            heading: 3,
            schema: {
              street: { type: 'input-text' },
            },
          },
        }),
      })

      const heading = form.find('h3')
      expect(heading.classes()).toContain('vf-label')
    })

    test('heading does not have for attribute', () => {
      const { form } = createForm({
        schema: defineSchema({
          address: {
            type: 'group',
            label: 'Address',
            heading: 3,
            schema: {
              street: { type: 'input-text' },
            },
          },
        }),
      })

      const heading = form.find('h3')
      expect(heading.attributes('for')).toBeUndefined()
    })

    test('renders h1 for heading: 1', () => {
      const { form } = createForm({
        schema: defineSchema({
          g: {
            type: 'group',
            label: 'Title',
            heading: 1,
            schema: { a: { type: 'input-text' } },
          },
        }),
      })

      expect(form.find('h1').exists()).toBe(true)
      expect(form.find('h1').text()).toBe('Title')
    })

    test('renders h6 for heading: 6', () => {
      const { form } = createForm({
        schema: defineSchema({
          g: {
            type: 'group',
            label: 'Small',
            heading: 6,
            schema: { a: { type: 'input-text' } },
          },
        }),
      })

      expect(form.find('h6').exists()).toBe(true)
      expect(form.find('h6').text()).toBe('Small')
    })

    test('fieldset has aria-labelledby pointing to heading', () => {
      const { form } = createForm({
        schema: defineSchema({
          address: {
            type: 'group',
            label: 'Address',
            heading: 3,
            schema: {
              street: { type: 'input-text' },
            },
          },
        }),
      })

      const fieldset = form.find('fieldset')
      const heading = form.find('h3')
      expect(fieldset.attributes('aria-labelledby')).toBe(
        heading.attributes('id')
      )
    })

    test('group without heading renders span label', () => {
      const { form } = createForm({
        schema: defineSchema({
          g: {
            type: 'group',
            label: 'No heading',
            schema: { a: { type: 'input-text' } },
          },
        }),
      })

      expect(form.find('h1').exists()).toBe(false)
      expect(form.find('h2').exists()).toBe(false)
      expect(form.find('h3').exists()).toBe(false)
      const label = form.find('.vf-label')
      expect(label.exists()).toBe(true)
      expect(label.element.tagName).toBe('SPAN')
    })

    test('group with heading + help renders both', () => {
      const { form } = createForm({
        schema: defineSchema({
          g: {
            type: 'group',
            label: 'Contact',
            heading: 4,
            help: 'Provide contact info.',
            schema: { a: { type: 'input-text' } },
          },
        }),
      })

      expect(form.find('h4').exists()).toBe(true)
      expect(form.find('h4').text()).toBe('Contact')
      const helpMsg = form.findComponent({ name: 'Message' })
      expect(helpMsg.exists()).toBe(true)
    })

    test('group with heading + description renders both', () => {
      const { form } = createForm({
        schema: defineSchema({
          g: {
            type: 'group',
            label: 'Contact',
            heading: 4,
            description: 'Fill in all fields.',
            schema: { a: { type: 'input-text' } },
          },
        }),
      })

      expect(form.find('h4').exists()).toBe(true)
      expect(form.find('h4').text()).toBe('Contact')
      const descriptionMsgs = form.findAllComponents({ name: 'Message' })
      expect(descriptionMsgs.length).toBeGreaterThan(0)
    })
  })

  describe('via inline slot', () => {
    test('renders group with heading and children', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfGroup name="billing" label="Billing" :heading="3">
              <VfInputText name="street" placeholder="Street" />
            </VfGroup>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      expect(app.find('fieldset').exists()).toBe(true)
      expect(app.find('h3').exists()).toBe(true)
      expect(app.find('h3').text()).toBe('Billing')
    })

    test('renders group with heading + help inline', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfGroup
              name="emergency"
              label="Emergency Contact"
              :heading="4"
              help="Someone we can reach."
            >
              <VfInputText name="name" placeholder="Name" />
            </VfGroup>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      expect(app.find('h4').exists()).toBe(true)
      expect(app.find('h4').text()).toBe('Emergency Contact')
    })
  })
})
