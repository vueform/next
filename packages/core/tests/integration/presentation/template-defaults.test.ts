import { defineComponent, h, nextTick } from 'vue'

import { defineSchema, isComponentDefinition, mergeProp } from '#core'

import { createForm } from '../../helpers'

// `template` and `layout` are ordinary props, so app-wide templates are config
// `defaults`. The catch: a compiled SFC / `defineComponent` result is a plain
// object, and plain-object props merge — a default template merged with an
// instance template would yield a hybrid component. These tests pin that
// component definitions are treated atomically end to end.

const TemplateA = defineComponent({
  name: 'TemplateA',
  props: { context: { type: Object, required: true } },
  // A key the instance template doesn't have — it must not leak into it.
  inheritAttrs: false,
  setup: () => () => h('div', { class: 'tpl-a' }, 'A'),
})

const TemplateB = defineComponent({
  name: 'TemplateB',
  props: { context: { type: Object, required: true } },
  setup: () => () => h('div', { class: 'tpl-b' }, 'B'),
})

const LayoutX = defineComponent({
  name: 'LayoutX',
  props: { context: { type: Object, required: true } },
  setup:
    (_, { slots }) =>
    () =>
      h('div', { class: 'layout-x' }, slots.default?.()),
})

describe('mergeProp with component definitions', () => {
  it('should recognize component definitions', () => {
    expect(isComponentDefinition(TemplateA as any)).toBe(true)
    expect(isComponentDefinition({ setup: () => {} })).toBe(true)
    expect(isComponentDefinition({ render: () => null })).toBe(true)
    expect(isComponentDefinition({ template: '<div />' })).toBe(true)
    expect(isComponentDefinition({ label: 'Foo', help: 'Bar' })).toBe(false)
  })

  it('should replace a component definition instead of merging it', () => {
    const merged = mergeProp(TemplateA, TemplateB, 'template')

    expect(merged).toBe(TemplateB)
    expect('inheritAttrs' in merged).toBe(false)
  })

  it('should still merge plain-object props and slot maps', () => {
    expect(mergeProp({ a: 1 }, { b: 2 }, 'any')).toEqual({ a: 1, b: 2 })

    const slots = mergeProp({ label: TemplateA }, { help: TemplateB }, 'slots')
    expect(slots.label).toBe(TemplateA)
    expect(slots.help).toBe(TemplateB)
  })
})

describe('Templates as config defaults', () => {
  it('should render a template set as a component default', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          el: { type: 'text', label: 'Foo' },
        }),
      },
      { defaults: { VfText: { template: TemplateA } } }
    )

    await nextTick()

    expect(form.find('.tpl-a').exists()).toBe(true)
    expect(form.find('input').exists()).toBe(false)
  })

  it('should let an instance template replace the default intact', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          el: { type: 'text', label: 'Foo', template: TemplateB },
        }),
      },
      { defaults: { VfText: { template: TemplateA } } }
    )

    await nextTick()

    expect(form.find('.tpl-b').exists()).toBe(true)
    expect(form.find('.tpl-a').exists()).toBe(false)
  })

  it('should let `template: null` opt an instance back to the built-in markup', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          el: { type: 'text', label: 'Foo', template: null },
        }),
      },
      { defaults: { VfText: { template: TemplateA } } }
    )

    await nextTick()

    expect(form.find('.tpl-a').exists()).toBe(false)
    expect(form.find('input').exists()).toBe(true)
  })

  it('should apply a layout set as an *element default', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          el: { type: 'text', label: 'Foo' },
        }),
      },
      { defaults: { '*element': { layout: LayoutX } } }
    )

    await nextTick()

    // the custom layout replaces the standard frame (a layout template renders
    // the control itself — it gets the context, not a default slot)
    expect(form.find('.layout-x').exists()).toBe(true)
    expect(form.find('.vf-label-group').exists()).toBe(false)
  })

  it('should pass a default component through by identity, not as a copy', async () => {
    const { el } = createForm(
      {
        schema: defineSchema({
          el: { type: 'text', label: 'Foo' },
        }),
      },
      {
        defaults: {
          VfText: { template: TemplateA },
          '*element': { layout: LayoutX },
        },
      }
    )

    await nextTick()

    // a shallow copy would drop `markRaw`'s non-enumerable flag and break
    // component identity for Vue's caches
    expect(el.props.template).toBe(TemplateA)
    expect(el.props.layout).toBe(LayoutX)
  })
})
