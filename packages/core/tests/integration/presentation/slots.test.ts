import {
  defineComponent,
  h,
  markRaw,
  nextTick,
  type FunctionalComponent,
} from 'vue'
import { createForm, mountApp } from '../../helpers'
import { defineSchema } from '#core'

// =============================================================================
// C1 — inline `template` slot receives unwrapped (raw) values, not refs
// =============================================================================
describe('Inline template slot context', () => {
  test('it should expose raw values (not refs) to the inline template slot', async () => {
    const App = defineComponent({
      template: `
        <VfForm>
          <VfText name="el" default="hello">
            <template #template="{ context }">
              <input
                class="probe"
                :id="context.id"
                :value="context.value"
                :data-value-type="typeof context.value"
                :data-id-type="typeof context.id"
              />
            </template>
          </VfText>
        </VfForm>
      `,
    })

    const app = mountApp(App)
    await nextTick()
    await nextTick()

    const probe = app.find('.probe')
    // The bound value is the raw string, not `[object Object]` (a ref).
    expect(probe.attributes('value')).toBe('hello')
    expect(probe.attributes('data-value-type')).toBe('string')
    expect(probe.attributes('data-id-type')).toBe('string')
  })

  test('it should keep the inline template slot reactive', async () => {
    const App = defineComponent({
      template: `
        <VfForm>
          <VfText name="el" default="hello">
            <template #template="{ context }">
              <span class="probe">{{ context.value }}</span>
            </template>
          </VfText>
        </VfForm>
      `,
    })

    const app = mountApp(App)
    await nextTick()
    expect(app.find('.probe').text()).toBe('hello')

    const form$ = app.findComponent({ name: 'VfForm' }).vm as any
    form$.find('el').update('world')
    await nextTick()

    expect(app.find('.probe').text()).toBe('world')
  })
})

// =============================================================================
// C2 — prop-supplied slot components must not leak undeclared bindings to DOM
// =============================================================================
describe('Prop-supplied slot attribute leaking', () => {
  test('it should not leak bound props of a VfForm slot to the DOM', async () => {
    const errorsSlot = markRaw(
      defineComponent({
        name: 'CustomFormErrors',
        // No props declared — `errors` would fall through as a DOM attribute
        // unless the slot component is rendered with `inheritAttrs: false`.
        render: () => h('div', { class: 'custom-errors' }, 'errors'),
      })
    )

    const App = defineComponent({
      data: () => ({
        schema: defineSchema({ el: { type: 'text', rules: 'required' } }),
        slots: markRaw({ errors: errorsSlot }),
      }),
      template: `<VfForm :schema="schema" :slots="slots" :display-errors="true" />`,
    })

    const app = mountApp(App)
    await nextTick()

    const form$ = app.findComponent({ name: 'VfForm' }).vm as any
    await form$.validate?.()
    await nextTick()

    const node = app.find('.custom-errors')
    expect(node.exists()).toBe(true)
    // The `:errors` binding must not have leaked to the DOM.
    expect(node.attributes('errors')).toBeUndefined()
  })

  test('it should not leak bound props of an element slot to the DOM', async () => {
    const labelSlot = markRaw(
      defineComponent({
        name: 'CustomLabel',
        render: () => h('span', { class: 'custom-label' }, 'Label'),
      })
    )

    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'text', label: 'Foo', slots: { label: labelSlot } },
      }),
    })

    await nextTick()

    const node = form.find('.custom-label')
    expect(node.exists()).toBe(true)
    // The element binds `:label`, `:for`, `:id`, `:tag` to the label slot; none
    // should appear as DOM attributes on the rendered component.
    expect(node.attributes('label')).toBeUndefined()
    expect(node.attributes('tag')).toBeUndefined()
  })
})

// =============================================================================
// C3 — string-based slot values
// =============================================================================
describe('String-based slots', () => {
  test('it should pass through an allowlisted PascalCase component name string as-is', async () => {
    const CustomLabel: FunctionalComponent = () =>
      h('span', { class: 'resolved-label' }, 'Resolved')
    CustomLabel.inheritAttrs = false

    const { form } = createForm(
      {
        schema: defineSchema({
          el: { type: 'text', label: 'Foo', slots: { label: 'CustomLabel' } },
        }),
      },
      { $security: { allowComponents: ['CustomLabel'] } },
      {
        global: {
          components: { CustomLabel },
        },
      }
    )

    await nextTick()

    const node = form.find('.resolved-label')
    expect(node.exists()).toBe(true)
    expect(node.text()).toBe('Resolved')
  })

  test('it should render a plain text string inside a <span>', async () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'text', label: 'Foo', slots: { label: 'Hello world' } },
      }),
    })

    await nextTick()

    expect(form.find('.vf-label-group').text()).toBe('Hello world')
  })

  test('it should render an HTML string with a matching wrapper tag', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            slots: { label: '<p>Styled label</p>' },
          },
        }),
      },
      {
        // HTML slot rendering is opt-in: enable the area and consciously opt
        // out of sanitization with an identity engine.
        $security: {
          allowHtml: ['slots'],
          sanitizer: (html: string) => html,
        },
      }
    )

    await nextTick()

    const slot = form.find('.vf-label-group > p')
    expect(slot.exists()).toBe(true)
    expect(slot.text()).toBe('Styled label')
  })

  test('it should preserve attributes from the outer HTML tag', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            slots: { label: '<div class="custom" data-x="1">Content</div>' },
          },
        }),
      },
      {
        // HTML slot rendering is opt-in: enable the area and consciously opt
        // out of sanitization with an identity engine.
        $security: {
          allowHtml: ['slots'],
          sanitizer: (html: string) => html,
        },
      }
    )

    await nextTick()

    const slot = form.find('.vf-label-group > div.custom')
    expect(slot.exists()).toBe(true)
    expect(slot.attributes('data-x')).toBe('1')
    expect(slot.text()).toBe('Content')
  })

  test('it should render HTML fragments as their own nodes, no wrapper', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            slots: { label: '<b>bold</b> and <i>italic</i>' },
          },
        }),
      },
      {
        // HTML slot rendering is opt-in: enable the area and consciously opt
        // out of sanitization with an identity engine.
        $security: {
          allowHtml: ['slots'],
          sanitizer: (html: string) => html,
        },
      }
    )

    await nextTick()

    const group = form.find('.vf-label-group')
    expect(group.find('b').text()).toBe('bold')
    expect(group.find('i').text()).toBe('italic')
    // The markup renders exactly as authored — no injected wrapper element.
    expect(group.find('span').exists()).toBe(false)
  })

  test('it should not leak slot bindings to the DOM on string-based slots', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            slots: { label: '<em>Label</em>' },
          },
        }),
      },
      {
        // HTML slot rendering is opt-in: enable the area and consciously opt
        // out of sanitization with an identity engine.
        $security: {
          allowHtml: ['slots'],
          sanitizer: (html: string) => html,
        },
      }
    )

    await nextTick()

    const slot = form.find('.vf-label-group > em')
    expect(slot.exists()).toBe(true)
    expect(slot.attributes('label')).toBeUndefined()
    expect(slot.attributes('tag')).toBeUndefined()
    expect(slot.attributes('for')).toBeUndefined()
  })
})

// =============================================================================
// C4 — slot components need no user-side `markRaw`
// =============================================================================
describe('Slot components in reactive schema storage', () => {
  test('it should render a slot component from a reactive schema without warnings', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const LabelSlot = defineComponent({
      name: 'ReactiveStoredLabel',
      render: () => h('span', { class: 'reactive-label' }, 'Label'),
    })

    const App = defineComponent({
      // `data` is made deeply reactive by Vue, so the slot component arrives
      // as a reactive proxy — the outlets pipeline must unwrap it without the
      // user ever calling `markRaw`.
      data: () => ({
        schema: defineSchema({
          el: { type: 'text', label: 'Foo', slots: { label: LabelSlot } },
        }),
      }),
      template: `<VfForm :schema="schema" />`,
    })

    const app = mountApp(App)
    await nextTick()

    expect(app.find('.reactive-label').exists()).toBe(true)
    expect(warnSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('made a reactive object'),
      expect.anything()
    )

    warnSpy.mockRestore()
  })

  test('it should keep slot component identity stable across outlet re-evaluations', async () => {
    let mounts = 0
    let unmounts = 0

    const Tpl = defineComponent({
      name: 'StableTemplate',
      props: ['context'],
      mounted: () => {
        mounts++
      },
      unmounted: () => {
        unmounts++
      },
      render: () => h('input', { class: 'stable-input' }),
    })

    const App = defineComponent({
      data: () => ({ slots: { template: Tpl } }),
      template: `
        <VfForm>
          <VfText name="el" label="Foo" :slots="slots" />
        </VfForm>
      `,
    })

    const app = mountApp(App)
    await nextTick()
    expect(app.find('.stable-input').exists()).toBe(true)
    expect(mounts).toBe(1)

    // A fresh wrapper object forces the outlets computed to re-evaluate; the
    // cached normalized copy must be reused so the rendered template keeps its
    // vnode type and isn't remounted.
    ;(app.vm as any).slots = { template: Tpl }
    await nextTick()

    expect(app.find('.stable-input').exists()).toBe(true)
    expect(mounts).toBe(1)
    expect(unmounts).toBe(0)
  })
})
