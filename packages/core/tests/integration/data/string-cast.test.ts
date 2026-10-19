import { defineSchema } from '@vueform/core'
import { defineComponent, h, markRaw, nextTick } from 'vue'

import { createForm } from '../../helpers'

// Free-text values only auto-parse into numbers when the parsed number
// round-trips to the exact typed string — a non-canonical spelling ("127.0",
// "0.50", "007") must survive typing untouched. The `string` prop opts out of
// parsing entirely: the value is always cast to a string, with `null` kept as
// the valid empty state.

const TextTpl = markRaw(
  defineComponent({
    props: { context: { type: Object, required: true } },
    setup: (props) => () =>
      h('input', { type: 'text', onInput: props.context.handleInput }),
  })
)

const mountText = async (entry: Record<string, any> = {}) => {
  const result = createForm({
    schema: defineSchema({ el: { type: 'text', template: TextTpl, ...entry } }),
  })
  await nextTick()
  return result
}

const type = async (form: any, value: string) => {
  const input = form.find('input')
  ;(input.element as HTMLInputElement).value = value
  await input.trigger('input')
}

describe('Numeric string normalization', () => {
  it('should keep canonical numeric strings as numbers', async () => {
    const { form, el } = await mountText()

    await type(form, '127')
    expect(el.value).toBe(127)

    await type(form, '12.5')
    expect(el.value).toBe(12.5)
  })

  it('should not kill the trailing ".0" while typing a float', async () => {
    const { form, el } = await mountText()

    await type(form, '127')
    expect(el.value).toBe(127)

    await type(form, '127.')
    expect(el.value).toBe('127.')

    await type(form, '127.0')
    expect(el.value).toBe('127.0')

    await type(form, '127.01')
    expect(el.value).toBe(127.01)
  })

  it('should keep non-canonical numeric spellings as strings', async () => {
    const { form, el } = await mountText()

    await type(form, '0.50')
    expect(el.value).toBe('0.50')

    await type(form, '007')
    expect(el.value).toBe('007')

    await type(form, '-0')
    expect(el.value).toBe('-0')
  })
})

describe('`string` prop', () => {
  it('should default to false and keep the parsing behavior', async () => {
    const { form, el } = await mountText()

    await type(form, '127')
    expect(el.value).toBe(127)
  })

  it('should cast typed values to strings', async () => {
    const { form, el } = await mountText({ string: true })

    await type(form, '127')
    expect(el.value).toBe('127')

    await type(form, '127.0')
    expect(el.value).toBe('127.0')
  })

  it('should cast programmatic values to strings', async () => {
    const { el } = await mountText({ string: true })

    el.update(127)
    expect(el.value).toBe('127')
  })

  it('should cast numeric defaults to strings on read', async () => {
    const { el } = await mountText({ string: true, default: 127 })

    expect(el.value).toBe('127')
  })

  it('should keep null as the valid empty state', async () => {
    const { el } = await mountText({ string: true })

    expect(el.value).toBe(null)

    el.update('127')
    expect(el.value).toBe('127')

    el.clear()
    expect(el.value).toBe(null)
  })

  it('should cast textarea values to strings as well', async () => {
    const { el } = createForm({
      schema: defineSchema({ el: { type: 'textarea', string: true } }),
    })
    await nextTick()

    el.update('127.0')
    expect(el.value).toBe('127.0')

    el.update(42)
    expect(el.value).toBe('42')
  })
})
