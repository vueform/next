import { definePlugin, defineSchema } from '@vueform/core'
import { computed, defineComponent, h, markRaw, nextTick } from 'vue'
import { createForm } from '../../helpers'

// The "Extending a Template" docs story: a plugin grows the component (prop,
// emit, exposed member) and the template consumes it through the `context`
// prop — reading the prop, firing the event, rendering the exposed member.

const plugin = definePlugin(() => ({
  apply: 'VfText',
  props: {
    prefix: { type: String, default: '' },
  },
  emits: ['prefixClick'],
  extend(_props, api: any) {
    const reversed = computed(() =>
      String(api.value.value ?? '')
        .split('')
        .reverse()
        .join('')
    )

    return { reversed }
  },
}))

const Tpl = markRaw(
  defineComponent({
    props: { context: { type: Object, required: true } },
    setup: (props) => () => {
      const ctx = props.context as any

      return h('div', [
        h(
          'span',
          {
            'data-prefix': '',
            onClick: (e: MouseEvent) => ctx.fire('prefixClick', e, ctx),
          },
          ctx.props.prefix
        ),
        h('input', { value: ctx.value, onInput: ctx.handleInput }),
        h('small', { 'data-reversed': '' }, ctx.reversed),
      ])
    },
  })
)

const mountAmount = async () => {
  const result = createForm(
    {
      schema: defineSchema({
        amount: { type: 'text', prefix: '$', default: 'abc', template: Tpl },
      } as any),
    },
    { plugins: [plugin()] }
  )
  await nextTick()
  return result
}

describe('Extending a template through a plugin', () => {
  it('should expose a plugin prop on context.props', async () => {
    const { form, amount } = await mountAmount()

    expect(amount.props.prefix).toBe('$')
    expect(form.find('[data-prefix]').text()).toBe('$')
  })

  it('should let the template fire a plugin event users can listen to', async () => {
    const { form, amount } = await mountAmount()
    const received: any[] = []

    amount.on('prefixClick', (e: MouseEvent, ctx: any) => {
      received.push([e.type, ctx.name])
    })

    await form.find('[data-prefix]').trigger('click')

    expect(received).toEqual([['click', 'amount']])
  })

  it('should render a member returned from extend', async () => {
    const { form, amount } = await mountAmount()

    expect(amount.reversed).toBe('cba')
    expect(form.find('[data-reversed]').text()).toBe('cba')

    amount.update('xy')
    await nextTick()

    expect(form.find('[data-reversed]').text()).toBe('yx')
  })
})
