import { defineSchema } from '@vueform/core'
import { defineComponent, h, markRaw, nextTick } from 'vue'

import { createForm, mountApp } from '../../helpers'

// =============================================================================
// Label
// =============================================================================
describe('Label', () => {
  describe('via props', () => {
    test('renders label text', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'Label text' },
        }),
      })

      const label = form.find('.vf-label')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Label text')
    })

    test('label has correct for attribute pointing to element id', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'Label text' },
        }),
      })

      const label = form.find('.vf-label')
      const input = form.find('input')
      expect(label.attributes('for')).toBe(input.attributes('id'))
    })

    test('label has correct id attribute', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'Label text' },
        }),
      })

      const label = form.find('.vf-label')
      expect(label.attributes('id')).toBeTruthy()
    })

    test('no label renders no label group', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text' },
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
            type: 'text',
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
            type: 'text',
            label: 'Label text',
            slots: { label: labelSlot },
          },
        }),
      })

      const label = form.find('.custom-label')
      const input = form.find('input')
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
            type: 'text',
            label: 'Label text',
            slots: { label: labelSlot },
          },
        }),
      })

      const label = form.find('.custom-label')
      expect(label.attributes('id')).toBeTruthy()
    })

    test('slot receives classes prop', () => {
      const labelSlot = markRaw(
        defineComponent({
          props: ['label', 'for', 'id', 'classes'],
          inheritAttrs: false,
          setup(props) {
            return () =>
              h(
                'label',
                { class: ['custom-label', props.classes] },
                props.label
              )
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
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
            <VfText name="el" label="Label text">
              <template #label="{ label }">
                <label class="custom-label">{{ label }}</label>
              </template>
            </VfText>
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

    test('slot receives for, id, and classes', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfText name="el" label="Label text">
              <template #label="{ label, for: htmlFor, id, classes }">
                <label :for="htmlFor" :id="id" :class="['custom-label', classes]">{{ label }}</label>
              </template>
            </VfText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      const label = app.find('.custom-label')
      const input = app.find('input')
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
    test('renders description text', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', description: 'This is a description' },
        }),
      })

      const description = form.find('.vf-description')
      expect(description.exists()).toBe(true)
      expect(description.text()).toBe('This is a description')
    })

    test('description has id attribute', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', description: 'This is a description' },
        }),
      })

      const description = form.find('.vf-description')
      expect(description.attributes('id')).toBeTruthy()
    })

    test('no description renders no description element', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text' },
        }),
      })

      expect(form.find('.vf-description').exists()).toBe(false)
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
            type: 'text',
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
            type: 'text',
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
            <VfText name="el" description="This is a description">
              <template #description="{ description }">
                <div class="custom-description">{{ description }}</div>
              </template>
            </VfText>
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

    test('slot receives id and class', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfText name="el" description="This is a description">
              <template #description="{ description, id, class: cls }">
                <div :id="id" :class="['custom-description', cls]">{{ description }}</div>
              </template>
            </VfText>
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
    test('renders help text', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'With help', help: 'This is help text' },
        }),
      })

      const help = form.find('.vf-help')
      expect(help.exists()).toBe(true)
      expect(help.text()).toBe('This is help text')
    })

    test('help has id attribute', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'With help', help: 'This is help text' },
        }),
      })

      const help = form.find('.vf-help')
      expect(help.attributes('id')).toBeTruthy()
    })

    test('no help renders no help element', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', label: 'No help' },
        }),
      })

      expect(form.find('.vf-help').exists()).toBe(false)
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
            type: 'text',
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
            type: 'text',
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
            <VfText name="el" label="With help" help="This is help text">
              <template #help="{ help }">
                <div class="custom-help">{{ help }}</div>
              </template>
            </VfText>
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

    test('slot receives id and class', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfText name="el" label="With help" help="This is help text">
              <template #help="{ help, id, class: cls }">
                <div :id="id" :class="['custom-help', cls]">{{ help }}</div>
              </template>
            </VfText>
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
// Icons
// =============================================================================
describe('Icons', () => {
  describe('via props', () => {
    test('renders icon before', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', iconBefore: 'search' },
        }),
      })

      const icons = form.findAllComponents({ name: 'VfIcon' })
      expect(icons).toHaveLength(1)
      expect(icons[0].props('icon')).toBe('search')
    })

    test('renders icon after', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', iconAfter: 'lock' },
        }),
      })

      const icons = form.findAllComponents({ name: 'VfIcon' })
      expect(icons).toHaveLength(1)
      expect(icons[0].props('icon')).toBe('lock')
    })

    test('renders both icons', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text', iconBefore: 'search', iconAfter: 'lock' },
        }),
      })

      const icons = form.findAllComponents({ name: 'VfIcon' })
      expect(icons).toHaveLength(2)
      expect(icons[0].props('icon')).toBe('search')
      expect(icons[1].props('icon')).toBe('lock')
    })

    test('no icons renders no VfIcon components', () => {
      const { form } = createForm({
        schema: defineSchema({
          el: { type: 'text' },
        }),
      })

      expect(form.findAllComponents({ name: 'VfIcon' })).toHaveLength(0)
    })
  })

  describe('via slot prop', () => {
    test('renders custom icon before slot', () => {
      const iconSlot = markRaw(
        defineComponent({
          inheritAttrs: false,
          setup() {
            return () => h('i', { class: 'custom-icon-before' })
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            slots: { iconBefore: iconSlot },
          },
        }),
      })

      expect(form.find('.custom-icon-before').exists()).toBe(true)
    })

    test('renders custom icon after slot', () => {
      const iconSlot = markRaw(
        defineComponent({
          inheritAttrs: false,
          setup() {
            return () => h('i', { class: 'custom-icon-after' })
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            slots: { iconAfter: iconSlot },
          },
        }),
      })

      expect(form.find('.custom-icon-after').exists()).toBe(true)
    })
  })

  describe('via inline slot', () => {
    test('renders custom icon before', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfText name="el">
              <template #icon-before>
                <i class="custom-icon-before" />
              </template>
            </VfText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      expect(app.find('.custom-icon-before').exists()).toBe(true)
    })

    test('renders custom icon after', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfText name="el">
              <template #icon-after>
                <i class="custom-icon-after" />
              </template>
            </VfText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      expect(app.find('.custom-icon-after').exists()).toBe(true)
    })
  })
})

// =============================================================================
// Addons (layout-level: rendering, not adoption)
// =============================================================================
describe('Addon slots', () => {
  describe('via slot prop', () => {
    test('renders custom addon before slot', () => {
      const addonSlot = markRaw(
        defineComponent({
          inheritAttrs: false,
          setup() {
            return () => h('span', { class: 'custom-addon-before' }, '$')
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            slots: { addonBefore: addonSlot },
          },
        }),
      })

      expect(form.find('.custom-addon-before').exists()).toBe(true)
      expect(form.find('.custom-addon-before').text()).toBe('$')
    })

    test('renders custom addon after slot', () => {
      const addonSlot = markRaw(
        defineComponent({
          inheritAttrs: false,
          setup() {
            return () => h('span', { class: 'custom-addon-after' }, '.00')
          },
        })
      )

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            slots: { addonAfter: addonSlot },
          },
        }),
      })

      expect(form.find('.custom-addon-after').exists()).toBe(true)
      expect(form.find('.custom-addon-after').text()).toBe('.00')
    })
  })

  describe('via inline slot', () => {
    test('renders custom addon before', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfText name="el">
              <template #addon-before>
                <span class="custom-addon-before">$</span>
              </template>
            </VfText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      expect(app.find('.custom-addon-before').exists()).toBe(true)
      expect(app.find('.custom-addon-before').text()).toBe('$')
    })

    test('renders custom addon after', async () => {
      const App = defineComponent({
        template: `
          <VfForm>
            <VfText name="el">
              <template #addon-after>
                <span class="custom-addon-after">.00</span>
              </template>
            </VfText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      expect(app.find('.custom-addon-after').exists()).toBe(true)
      expect(app.find('.custom-addon-after').text()).toBe('.00')
    })
  })
})

// =============================================================================
// Language addon
// =============================================================================
describe('Language slot', () => {
  describe('via props', () => {
    test('renders language addon when translate is true', () => {
      const { form } = createForm({
        languages: { en: 'English', de: 'German' },
        schema: defineSchema({
          el: { type: 'text', translate: true },
        }),
      })

      const addons = form.findAllComponents({ name: 'VfAddon' })
      expect(addons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('via slot prop', () => {
    test('renders custom language slot', () => {
      const languageSlot = markRaw(
        defineComponent({
          props: ['language', 'languages'],
          inheritAttrs: false,
          setup(props: any) {
            return () =>
              h(
                'span',
                { class: 'custom-language' },
                props.languages?.[props.language]
              )
          },
        })
      )

      const { form } = createForm({
        languages: { en: 'English', de: 'German' },
        schema: defineSchema({
          el: {
            type: 'text',
            translate: true,
            slots: { language: languageSlot },
          },
        }),
      })

      const lang = form.find('.custom-language')
      expect(lang.exists()).toBe(true)
      expect(lang.text()).toBe('English')
    })
  })

  describe('via inline slot', () => {
    test('renders custom language', async () => {
      const App = defineComponent({
        template: `
          <VfForm :languages="{ en: 'English', de: 'German' }">
            <VfText name="el" :translate="true">
              <template #language="{ language, languages }">
                <span class="custom-language">{{ languages[language] }}</span>
              </template>
            </VfText>
          </VfForm>
        `,
      })

      const app = mountApp(App)
      await nextTick()
      await nextTick()

      const lang = app.find('.custom-language')
      expect(lang.exists()).toBe(true)
      expect(lang.text()).toBe('English')
    })
  })
})

// =============================================================================
// Combined: addons + icons together
// =============================================================================
describe('Combined addons and icons', () => {
  test('renders both addons and icons via props', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: {
          type: 'text',
          addonBefore: '$',
          addonAfter: '.00',
          iconBefore: 'search',
          iconAfter: 'lock',
        },
      }),
    })

    const addons = form.findAllComponents({ name: 'VfAddon' })
    expect(addons).toHaveLength(2)

    const icons = form.findAllComponents({ name: 'VfIcon' })
    expect(icons).toHaveLength(2)
  })

  test('renders both addons and icons via inline slots', async () => {
    const App = defineComponent({
      template: `
        <VfForm>
          <VfText name="el">
            <template #addon-before><span class="custom-ab">$</span></template>
            <template #addon-after><span class="custom-aa">.00</span></template>
            <template #icon-before><i class="custom-ib" /></template>
            <template #icon-after><i class="custom-ia" /></template>
          </VfText>
        </VfForm>
      `,
    })

    const app = mountApp(App)
    await nextTick()
    await nextTick()

    expect(app.find('.custom-ab').exists()).toBe(true)
    expect(app.find('.custom-aa').exists()).toBe(true)
    expect(app.find('.custom-ib').exists()).toBe(true)
    expect(app.find('.custom-ia').exists()).toBe(true)
  })
})
