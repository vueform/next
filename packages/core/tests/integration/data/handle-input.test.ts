import { defineSchema } from '@vueform/core'
import { defineComponent, h, markRaw, nextTick } from 'vue'
import { createForm } from '../../helpers'

// `handleInput` accepts a native `input` / `change` event as well as a plain
// value, so custom templates can bind `@input="handleInput"` directly. Event
// values are read the way `v-model` reads them.

const template = (render: (ctx: any) => any) =>
  markRaw(
    defineComponent({
      props: { context: { type: Object, required: true } },
      setup: (props) => () => render(props.context),
    })
  )

const TextTpl = template((ctx) =>
  h('input', { type: 'text', onInput: ctx.handleInput })
)
const NumberTpl = template((ctx) =>
  h('input', { type: 'number', onInput: ctx.handleInput })
)
const CheckboxTpl = template((ctx) =>
  h('input', {
    type: 'checkbox',
    'true-value': ctx.props.trueValue,
    'false-value': ctx.props.falseValue,
    onChange: ctx.handleInput,
  })
)
const CheckboxUnboundTpl = template((ctx) =>
  h('input', { type: 'checkbox', onChange: ctx.handleInput })
)
const RadioTpl = template((ctx) =>
  h('input', {
    type: 'radio',
    value: ctx.props.radioValue,
    onChange: ctx.handleInput,
  })
)
const SelectTpl = template((ctx) =>
  h('select', { onChange: ctx.handleInput }, [
    h('option', { value: 1 }, 'One'),
    h('option', { value: 2 }, 'Two'),
  ])
)
const MultiSelectTpl = template((ctx) =>
  h('select', { multiple: true, onChange: ctx.handleInput }, [
    h('option', { value: 'a' }, 'A'),
    h('option', { value: 'b' }, 'B'),
  ])
)
const FileTpl = template((ctx) =>
  h('input', { type: 'file', onInput: ctx.handleInput })
)

const mountWith = async (entry: Record<string, any>) => {
  const result = createForm({ schema: defineSchema({ el: entry }) })
  await nextTick()
  return result
}

describe('handleInput with native events', () => {
  it('should read a text input value without touching the interaction states', async () => {
    const { form, el } = await mountWith({ type: 'text', template: TextTpl })
    const input = form.find('input')

    expect(el.touched).toBe(false)
    expect(el.visited).toBe(false)
    ;(input.element as HTMLInputElement).value = 'hello'
    await input.trigger('input')

    expect(el.value).toBe('hello')
    // `touched` / `visited` come from focus / blur only.
    expect(el.touched).toBe(false)
    expect(el.visited).toBe(false)
  })

  it('should pass the value and the event to `input` listeners', async () => {
    const { form, el } = await mountWith({ type: 'text', template: TextTpl })
    let payload: any
    let event: any

    el.on('input', (v: any, e: any) => {
      payload = v
      event = e
    })

    const input = form.find('input')
    ;(input.element as HTMLInputElement).value = 'x'
    await input.trigger('input')

    expect(payload).toBe('x')
    expect(event).toBeInstanceOf(Event)
  })

  it('should ignore events fired during IME composition', async () => {
    const { form, el } = await mountWith({ type: 'text', template: TextTpl })
    const input = form.find('input')
    const node = input.element as HTMLInputElement & { composing?: boolean }
    let inputs = 0

    el.on('input', () => {
      inputs++
    })

    // Mid-composition (the flag Vue's v-model sets): no write, no report.
    node.composing = true
    node.value = 'あ'
    await input.trigger('input')

    expect(el.value).toBe(null)
    expect(inputs).toBe(0)

    // Composition over: the (synthetic) input event goes through once.
    node.composing = false
    await input.trigger('input')

    expect(el.value).toBe('あ')
    expect(inputs).toBe(1)
  })

  it('should cast `type="number"` input values to numbers', async () => {
    const { form, el } = await mountWith({ type: 'text', template: NumberTpl })
    const input = form.find('input')

    ;(input.element as HTMLInputElement).value = '42.5'
    await input.trigger('input')

    expect(el.value).toBe(42.5)
  })

  it('should map checkbox `checked` onto the bound true/false values', async () => {
    const { form, el } = await mountWith({
      type: 'checkbox',
      trueValue: 'yes',
      falseValue: 'no',
      template: CheckboxTpl,
    })
    const input = form.find('input')

    ;(input.element as HTMLInputElement).checked = true
    await input.trigger('change')
    expect(el.value).toBe('yes')
    ;(input.element as HTMLInputElement).checked = false
    await input.trigger('change')
    expect(el.value).toBe('no')
  })

  it('should fall back to the trueValue / falseValue props when unbound', async () => {
    const { form, el } = await mountWith({
      type: 'checkbox',
      trueValue: 'yes',
      falseValue: 'no',
      template: CheckboxUnboundTpl,
    })
    const input = form.find('input')

    ;(input.element as HTMLInputElement).checked = true
    await input.trigger('change')
    expect(el.value).toBe('yes')
  })

  it('should use the bound `:value` of a radio, keeping its type', async () => {
    const { form, el } = await mountWith({
      type: 'radio',
      radioValue: 5,
      template: RadioTpl,
    })
    const input = form.find('input')

    ;(input.element as HTMLInputElement).checked = true
    await input.trigger('change')

    expect(el.value).toBe(5)
  })

  it('should use the selected option of a native select, keeping its type', async () => {
    const { form, el } = await mountWith({
      type: 'select',
      items: [1, 2],
      template: SelectTpl,
    })
    const select = form.find('select')
    const options = select.findAll('option')

    ;(options[1].element as HTMLOptionElement).selected = true
    await select.trigger('change')

    expect(el.value).toBe(2)
  })

  it('should collect every selected option of a multiple select', async () => {
    const { form, el } = await mountWith({
      type: 'select',
      multiple: true,
      items: ['a', 'b'],
      template: MultiSelectTpl,
    })
    const select = form.find('select')

    for (const option of select.findAll('option')) {
      ;(option.element as HTMLOptionElement).selected = true
    }
    await select.trigger('change')

    expect(el.value).toEqual(['a', 'b'])
  })

  it('should read the selected files of a file input through VfFile', async () => {
    const { form, el } = await mountWith({ type: 'file', template: FileTpl })
    const input = form.find('input')
    const file = new File(['content'], 'note.txt', { type: 'text/plain' })
    const added: File[] = []

    el.on('add', (f: File) => {
      added.push(f)
    })

    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('input')

    // The model holds the file behind a reactive wrapper — compare identity
    // fields rather than the reference.
    expect(el.value).toBeInstanceOf(File)
    expect(el.value.name).toBe('note.txt')
    expect(el.value.size).toBe(file.size)
    expect(added.map((f) => f.name)).toEqual(['note.txt'])
    expect(el.touched).toBe(true)
    expect(el.visited).toBe(true)
  })

  it('should let VfFile take a plain value as the model', async () => {
    const { el } = await mountWith({ type: 'file', template: FileTpl })
    const file = new File(['content'], 'direct.txt', { type: 'text/plain' })

    el.handleInput(file)

    expect(el.value.name).toBe('direct.txt')
    expect(el.touched).toBe(true)
  })

  it('should still accept a plain value', async () => {
    const { el } = await mountWith({ type: 'text', template: TextTpl })
    let payload: any

    el.on('input', (v: any) => {
      payload = v
    })

    el.handleInput('direct')

    expect(el.value).toBe('direct')
    expect(payload).toBe('direct')
    expect(el.touched).toBe(false)
  })
})

describe('handleInput DOM recovery', () => {
  const RecoveryTpl = template((ctx) =>
    h('input', {
      type: 'text',
      ref: ctx.setInputRef,
      onInput: ctx.handleInput,
    })
  )

  it('should adopt a change-only value the bound events missed (autofill)', async () => {
    const { form, el } = await mountWith({
      type: 'text',
      template: RecoveryTpl,
    })
    const input = form.find('input')
    let inputs = 0

    el.on('input', () => {
      inputs++
    })

    // A password-manager-style fill: sets the value and fires only `change`.
    ;(input.element as HTMLInputElement).value = 'filled@example.com'
    await input.trigger('change')

    expect(el.value).toBe('filled@example.com')
    expect(inputs).toBe(1)
  })

  it('should stay silent on `change` when the model is already in sync', async () => {
    const { form, el } = await mountWith({
      type: 'text',
      template: RecoveryTpl,
    })
    const input = form.find('input')
    let inputs = 0

    ;(input.element as HTMLInputElement).value = 'typed'
    await input.trigger('input')

    el.on('input', () => {
      inputs++
    })

    // The blur-commit `change` after normal typing observes nothing new.
    await input.trigger('change')

    expect(el.value).toBe('typed')
    expect(inputs).toBe(0)
  })

  it('should sync programmatic model changes back into a bag-wired input', async () => {
    const BagTpl = template((ctx) =>
      h('input', { type: 'text', ...ctx.inputBindings })
    )
    const { form, el } = await mountWith({ type: 'text', template: BagTpl })
    const input = form.find('input')

    // User input flows through the bag's onInput (no v-model involved).
    ;(input.element as HTMLInputElement).value = 'typed'
    await input.trigger('input')
    expect(el.value).toBe('typed')

    // Programmatic writes reach the DOM through the write-back watcher.
    el.update('loaded')
    await nextTick()
    expect((input.element as HTMLInputElement).value).toBe('loaded')
  })

  it('should wire a component through componentBindings', async () => {
    const { el } = await mountWith({ type: 'text', template: TextTpl })
    const bag = el.componentBindings

    expect(bag.modelValue).toBe(null)

    let inputs = 0
    el.on('input', () => {
      inputs++
    })

    // A component's update:modelValue payload is the value itself.
    bag['onUpdate:modelValue']('picked')

    expect(el.value).toBe('picked')
    expect(el.componentBindings.modelValue).toBe('picked')
    expect(inputs).toBe(1)
  })

  it('should adopt the final composed text on `compositionend` without v-model', async () => {
    const { form, el } = await mountWith({
      type: 'text',
      template: RecoveryTpl,
    })
    const input = form.find('input')
    const node = input.element as HTMLInputElement & { composing?: boolean }

    // Chrome fires the last real `input` with `isComposing: true` before
    // `compositionend` — without v-model nothing re-dispatches it, so the
    // recovery listener adopts the composed text at the session's end.
    node.composing = true
    node.value = '日本'
    await input.trigger('input')
    expect(el.value).toBe(null)

    node.composing = false
    await input.trigger('compositionend')

    expect(el.value).toBe('日本')
  })
})
