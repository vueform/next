import { defineComponent, h, markRaw, nextTick, ref } from 'vue'
import { createForm } from '../../helpers'
import { defineSchema, useClasses, useContext } from '#core'

// `useClasses()` called from a custom template registers class definitions on
// the host component's own registrar: a key the template sets replaces the
// component's own value for that key, keys it leaves alone keep theirs, the
// regular `classes` / `reclass` chain still applies on top, and keys the
// component never declared are accepted.

const flag = ref(false)

const TemplateDef = defineComponent({
  name: 'TemplateClasses',
  props: { context: { type: Object, required: true } },
  setup: () => {
    const { classes } = useContext('VfText')

    useClasses('VfText', { input: 'tpl-input', icon: 'tpl-icon' })
    useClasses('VfText', (el$) => ({
      wrapper: `wrapper-${el$.name}`,
      badge: { 'tpl-on': flag.value },
    }))

    return () =>
      h('div', [
        h('input', { class: classes.input, 'data-key': 'input' }),
        h('span', { class: classes.icon, 'data-key': 'icon' }),
        h('span', { class: classes.wrapper, 'data-key': 'wrapper' }),
        h('span', { class: classes.badge, 'data-key': 'badge' }),
      ])
  },
})

const Template = markRaw(TemplateDef)

// Registers only a key of its own — `input` must keep the component's value.
const IconOnly = markRaw(
  defineComponent({
    name: 'TemplateIconOnly',
    props: { context: { type: Object, required: true } },
    setup: () => {
      const { classes } = useContext('VfText')

      useClasses('VfText', { icon: 'tpl-icon' })

      return () =>
        h('div', [
          h('input', { class: classes.input, 'data-key': 'input' }),
          h('span', { class: classes.icon, 'data-key': 'icon' }),
        ])
    },
  })
)

// Binds from the object `useClasses` returns instead of `context.classes` —
// the two must be the same proxy, resolved through the same chain.
const Returned = markRaw(
  defineComponent({
    name: 'TemplateReturned',
    props: { context: { type: Object, required: true } },
    setup: () => {
      const classes = useClasses('VfText', { icon: 'ret-icon' })

      return () =>
        h('div', [
          h('input', { class: classes.input, 'data-key': 'input' }),
          h('span', { class: classes.icon, 'data-key': 'icon' }),
        ])
    },
  })
)

const classesOf = (form: any, key: string, nth = 0) =>
  form.findAll(`[data-key="${key}"]`)[nth].classes()

describe('useClasses from templates', () => {
  it('should replace the component-defined value for keys the template sets', async () => {
    const { form } = createForm({
      schema: defineSchema({
        email: { type: 'text', template: Template },
      }),
    })
    await nextTick()

    expect(classesOf(form, 'input')).toEqual(['tpl-input'])
    expect(classesOf(form, 'icon')).toEqual(['tpl-icon'])
  })

  it('should keep the component-defined value for keys the template leaves alone', async () => {
    const { form } = createForm({
      schema: defineSchema({
        email: { type: 'text', template: IconOnly },
      }),
    })
    await nextTick()

    expect(classesOf(form, 'input')).toEqual(
      expect.arrayContaining(['vf-input', 'vf-text-input'])
    )
    expect(classesOf(form, 'input')).not.toContain('tpl-input')
    expect(classesOf(form, 'icon')).toEqual(['tpl-icon'])
  })

  it('should keep classes and reclass props applying on top', async () => {
    const { form } = createForm({
      schema: defineSchema({
        added: {
          type: 'text',
          template: Template,
          classes: { icon: 'user-icon', input: 'user-input' },
        },
        replaced: {
          type: 'text',
          template: Template,
          reclass: { icon: 'only-icon' },
        },
      }),
    })
    await nextTick()

    expect(classesOf(form, 'icon', 0)).toEqual(['tpl-icon', 'user-icon'])
    expect(classesOf(form, 'input', 0)).toEqual(['tpl-input', 'user-input'])
    expect(classesOf(form, 'icon', 1)).toEqual(['only-icon'])
  })

  it('should pass the host context to factories and stay reactive', async () => {
    flag.value = false

    const { form } = createForm({
      schema: defineSchema({
        email: { type: 'text', template: Template },
      }),
    })
    await nextTick()

    expect(classesOf(form, 'wrapper')).toEqual(['wrapper-email'])
    expect(classesOf(form, 'badge')).toEqual([])

    flag.value = true
    await nextTick()

    expect(classesOf(form, 'badge')).toEqual(['tpl-on'])
  })

  it('should register per host instance', async () => {
    const { form } = createForm({
      schema: defineSchema({
        first: { type: 'text', template: Template },
        second: { type: 'text', template: Template },
      }),
    })
    await nextTick()

    for (const nth of [0, 1]) {
      const input = classesOf(form, 'input', nth)
      expect(input.filter((c: string) => c === 'tpl-input')).toHaveLength(1)
    }
    expect(classesOf(form, 'wrapper', 0)).toEqual(['wrapper-first'])
    expect(classesOf(form, 'wrapper', 1)).toEqual(['wrapper-second'])
  })

  it('should work from a slots.template entry', async () => {
    const { form } = createForm({
      schema: defineSchema({
        email: { type: 'text', slots: { template: Template } },
      }),
    })
    await nextTick()

    expect(classesOf(form, 'input')).toEqual(['tpl-input'])
    expect(classesOf(form, 'icon')).toEqual(['tpl-icon'])
  })

  it('should return the host classes object with template keys resolving through the chain', async () => {
    const { form } = createForm({
      schema: defineSchema({
        email: {
          type: 'text',
          template: Returned,
          classes: { icon: 'user-icon' },
        },
      }),
    })
    await nextTick()

    expect(classesOf(form, 'input')).toEqual(
      expect.arrayContaining(['vf-input', 'vf-text-input'])
    )
    expect(classesOf(form, 'icon')).toEqual(['ret-icon', 'user-icon'])
  })

  it('should throw outside a Vueform component', () => {
    expect(() => useClasses('VfText', { input: 'x' })).toThrow()
  })
})
