import { defineSchema, useContext } from '@vueform/core'
import {
  defineComponent,
  h,
  isProxy,
  isRef,
  markRaw,
  nextTick,
  ref,
  resolveComponent,
  toRaw,
  toRef,
  toRefs,
} from 'vue'

import { createForm } from '../../helpers'

// A custom template reaches its host two ways: the `context` prop and
// `useContext()`. Both hand out the same public context object — the component
// context proxy. Reactive members read unwrapped and can be assigned (the
// proxy writes the underlying ref), a destructured member is a snapshot, and
// `toRef(context, key)` is a live, writable ref. The input element can be
// registered through `setInputRef` as a function ref.

let seen: any

const Tpl = markRaw(
  defineComponent({
    props: { context: { type: Object, required: true } },
    setup: (props) => {
      const ctx = useContext('VfText')
      const live = toRef(props.context, 'value')
      const snapshot = props.context.value

      seen = { ctx, live, snapshot }

      return () =>
        h('input', {
          ref: props.context.setInputRef,
          value: props.context.value,
          onInput: props.context.handleInput,
        })
    },
  })
)

const mountText = async () => {
  const result = createForm({
    schema: defineSchema({ el: { type: 'text', default: 'a', template: Tpl } }),
  })
  await nextTick()
  return result
}

describe('useContext', () => {
  it('should return the same context object the template receives as a prop', async () => {
    const { form } = await mountText()
    const tpl = form.findComponent(Tpl)

    expect(seen.ctx === tpl.props('context')).toBe(true)
  })

  it('should read reactive members unwrapped — live on access, snapshot on destructure', async () => {
    const { el } = await mountText()

    expect(seen.snapshot).toBe('a')
    expect(seen.live.value).toBe('a')

    el.update('b')
    await nextTick()

    expect(seen.ctx.value).toBe('b')
    expect(seen.live.value).toBe('b')
    expect(seen.snapshot).toBe('a')
  })
})

describe('writing context members', () => {
  it('should write the value through the prop, useContext, and a toRef', async () => {
    const { form, el } = await mountText()
    const context = form.findComponent(Tpl).props('context') as any

    context.value = 'via-prop'
    expect(el.value).toBe('via-prop')

    seen.ctx.value = 'via-useContext'
    expect(el.value).toBe('via-useContext')

    seen.live.value = 'via-toRef'
    expect(el.value).toBe('via-toRef')

    await nextTick()
    expect((form.find('input').element as HTMLInputElement).value).toBe(
      'via-toRef'
    )
  })

  it('should treat a value write as a programmatic update, not user input', async () => {
    const { form, el } = await mountText()
    const context = form.findComponent(Tpl).props('context') as any

    context.value = 'x'

    expect(el.value).toBe('x')
    expect(el.touched).toBe(false)
    expect(el.visited).toBe(false)
  })

  it('should write interaction state', async () => {
    const { form, el } = await mountText()
    const context = form.findComponent(Tpl).props('context') as any

    context.touched = true
    context.visited = true

    expect(el.touched).toBe(true)
    expect(el.visited).toBe(true)
  })
})

describe('useContext from nested components', () => {
  const nested: Record<string, any> = {}

  const Helper = defineComponent({
    props: { where: { type: String, required: true } },
    setup: (props) => {
      nested[props.where] = useContext('VfText') as any
      return () => h('span')
    },
  })

  const NestedTpl = markRaw(
    defineComponent({
      props: { context: { type: Object, required: true } },
      setup: () => {
        const VfLayout = resolveComponent('VfLayout') as any
        return () =>
          h('div', [
            h(Helper, { where: 'outside' }),
            h(VfLayout, null, {
              default: () => [h(Helper, { where: 'inside' })],
            }),
          ])
      },
    })
  )

  it('should resolve the nearest Vueform component — the element outside VfLayout, the layout inside it', async () => {
    const { form } = createForm({
      schema: defineSchema({ el: { type: 'text', template: NestedTpl } }),
    })
    await nextTick()

    const context = form.findComponent(NestedTpl).props('context')

    // Identity checks as booleans: a failed `toBe` on a context object makes
    // vitest serialize the whole graph (form$, $config, …) and crashes the
    // worker.
    expect(nested.outside === context).toBe(true)
    expect(nested.inside === context).toBe(false)
    expect(typeof nested.inside.handleInput).toBe('undefined')
    // The layout exposes the element it frames as `el$`.
    expect(nested.inside.el$?.name).toBe('el')
    expect(typeof nested.inside.el$?.handleInput).toBe('function')
  })
})

describe('setInputRef', () => {
  it('should register the input element through a function ref', async () => {
    const { form, el } = await mountText()

    expect(el.inputRef).toBe(form.find('input').element)
  })

  it('should clear the input ref on unmount', async () => {
    const { form, el } = await mountText()

    form.unmount()

    expect(el.inputRef).toBeNull()
  })
})

describe('the context as a Vue reactive proxy', () => {
  // The context is a real `reactive()` proxy over the object the component
  // exposes, so Vue's own semantics apply: `isProxy`, `toRaw`, `toRefs`, and
  // round-trips through `ref` / reactive collections.

  it('should be a reactive proxy over the exposed object', async () => {
    const { form } = await mountText()
    const context = form.findComponent(Tpl).props('context') as any

    expect(isProxy(context)).toBe(true)
    // `toRaw` is the exposed object — refs intact.
    expect(isRef(toRaw(context).value)).toBe(true)
    // Storing the context in a ref hands back Vue's deep view over the same
    // raw object (`proxyRefs` semantics, like `shallowReactive`): not the
    // same proxy, but the same underlying object and members.
    const stored = ref(context).value as any
    expect(toRaw(stored) === toRaw(context)).toBe(true)
    expect(stored.value).toBe('a')
  })

  it('should give live, writable refs through toRefs without warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { form, el } = await mountText()
    const context = form.findComponent(Tpl).props('context') as any

    const { value, touched, handleInput } = toRefs(context)

    expect(warn).not.toHaveBeenCalled()
    expect(value.value).toBe('a')
    expect(touched.value).toBe(false)
    expect(typeof handleInput.value).toBe('function')

    el.update('b')
    expect(value.value).toBe('b')

    value.value = 'c'
    touched.value = true
    expect(el.value).toBe('c')
    expect(el.touched).toBe(true)

    warn.mockRestore()
  })

  it('should hand out props, classes, and bindings as-is (not re-wrapped)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { form } = await mountText()
    const context = form.findComponent(Tpl).props('context') as any
    const raw = toRaw(context)

    expect(context.props === raw.props).toBe(true)
    expect(context.classes === raw.classes).toBe(true)
    expect(context.parts === raw.parts).toBe(true)
    expect(context.bindings === raw.bindings).toBe(true)

    // `context.props` answers Vue's raw probe, so `toRefs` destructures it
    // without the dev warning, live per key.
    const { inputType, name } = toRefs(context.props)
    expect(inputType.value).toBe('text')
    expect(name.value).toBe('el')
    expect(warn).not.toHaveBeenCalled()

    warn.mockRestore()
  })
})
