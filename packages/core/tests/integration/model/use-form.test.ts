import { describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, nextTick, reactive, ref } from 'vue'

import {
  NotInstalledError,
  useModel,
  useForm,
  type HttpAdapter,
  type HttpRequestConfig,
  type ModelInstance,
  type UseFormReturn,
  defineSchema,
} from '#core'

import { createForm, flushPromises, mountApp } from '../../helpers'

/**
 * Runs a factory inside a mounted component's setup (so `useConfig()` resolves)
 * and returns its result.
 */
const inSetup = <T>(fn: () => T): T => {
  let result!: T
  mountApp(
    defineComponent({
      template: '<div />',
      setup() {
        result = fn()
        return {}
      },
    }) as any
  )
  return result
}

const mockAdapter = (): {
  adapter: HttpAdapter
  calls: HttpRequestConfig[]
} => {
  const calls: HttpRequestConfig[] = []

  const adapter: HttpAdapter = async (config) => {
    calls.push(config)
    return {
      data: null,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    } as any
  }

  return { adapter, calls }
}

const createModel = (data?: Record<string, any>): ModelInstance<any> =>
  inSetup(() =>
    useModel(
      {
        name: { type: 'text' },
        email: { type: 'text' },
      },
      data as any
    )
  ) as any

describe('VfForm adoption of useModel instances', () => {
  it('adopts the store: shared data, adopted state', async () => {
    const model$ = createModel({ name: 'John' })

    const { form$, name } = createForm({
      schema: {
        name: { type: 'text' },
        email: { type: 'text' },
      },
      modelValue: model$,
    })

    await nextTick()

    expect(model$.adopted).toBe(true)

    // The form reads the store's data (same object, not a clone).
    expect(form$.model).toBe(model$.model)
    expect(name.value).toBe('John')

    // Element -> model
    name.update('Jane')
    await nextTick()
    expect(model$.model.name).toBe('Jane')

    // Model -> element
    model$.set('email', 'jane@example.com')
    await nextTick()
    expect(form$.model.email).toBe('jane@example.com')
  })

  it('submits the adopting form through the model', async () => {
    const { adapter, calls } = mockAdapter()
    const model$ = createModel({ name: 'John' })

    createForm(
      {
        schema: {
          name: { type: 'text' },
          email: { type: 'text' },
        },
        modelValue: model$,
        endpoint: '/api/users',
      },
      { $http: { adapter } }
    )

    await nextTick()

    const result: any = await model$.submit()

    expect(calls).toHaveLength(1)
    expect(calls[0].data).toEqual({ name: 'John', email: null })
    expect(result).toEqual(expect.objectContaining({ type: 'success' }))
  })

  it('exposes serialization and adoption state on the context', async () => {
    const model$ = createModel({ name: 'John' })

    const { form$ } = createForm({
      schema: {
        name: { type: 'text' },
        email: { type: 'text' },
      },
      modelValue: model$,
    })

    await nextTick()

    expect(form$.hasAdoptedModel).toBe(true)
    expect(form$.data).toBe(form$.model)
    expect(JSON.parse(form$.toJSON())).toEqual({ name: 'John', email: null })
    expect(form$.toFormData()).toBeInstanceOf(FormData)
  })

  it('reports no adopted model on plain forms', async () => {
    const { form$ } = createForm({
      schema: { name: { type: 'text' } },
    })

    await nextTick()

    expect(form$.hasAdoptedModel).toBe(false)
  })

  it('releases on unmount, keeping the data', async () => {
    const model$ = createModel({ name: 'John' })

    const { form } = createForm({
      schema: { name: { type: 'text' } },
      modelValue: model$,
    })

    await nextTick()
    expect(model$.adopted).toBe(true)

    form.unmount()

    expect(model$.adopted).toBe(false)
    expect(model$.model.name).toBe('John')
  })
})

describe('useForm', () => {
  const schema = defineSchema({
    name: { type: 'text' },
    email: { type: 'text' },
  })

  const mountUseForm = (model?: any) => {
    let tuple!: UseFormReturn<typeof schema>
    const wrapper = mountApp(
      defineComponent({
        template: '<component :is="MyForm" />',
        setup() {
          tuple = useForm({ schema }, model)
          return { MyForm: tuple[0] }
        },
      }) as any
    )
    const [, form$, formReady] = tuple
    return { wrapper, form$, formReady }
  }

  it('returns a renderable form with a live context and ready callback', async () => {
    let readyArg: any = null

    let tuple!: UseFormReturn<typeof schema>
    const wrapper = mountApp(
      defineComponent({
        template: '<component :is="MyForm" />',
        setup() {
          tuple = useForm({ schema })
          tuple[2]((form$) => {
            readyArg = form$
          })
          return { MyForm: tuple[0] }
        },
      }) as any
    )

    const [, form$, formReady] = tuple

    await nextTick()

    // Ready callback registered before mount fired with the live context.
    expect(readyArg).toBe(form$)

    // Promise form resolves immediately after mount.
    await expect(formReady()).resolves.toBe(form$)

    // The context proxies the mounted form.
    expect(form$.model).toEqual({ name: null, email: null })
    expect(form$.find('name')).toBeTruthy()

    expect(wrapper.findAll('input')).toHaveLength(2)
  })

  it('two-way syncs a ref model', async () => {
    const data = ref<Record<string, any> | undefined>({ name: 'John' })

    const { wrapper, form$ } = mountUseForm(data)
    await nextTick()

    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('John')

    // Form -> ref
    await input.setValue('Jane')
    await nextTick()
    expect(data.value?.name).toBe('Jane')

    // Ref -> form
    data.value = { name: 'Judy', email: 'judy@example.com' }
    await nextTick()
    expect(form$.model.name).toBe('Judy')
  })

  it('syncs keys back into a reactive model', async () => {
    const data = reactive<Record<string, any>>({ name: 'John' })

    const { wrapper, form$ } = mountUseForm(data)
    await nextTick()

    // Form -> reactive
    await wrapper.find('input').setValue('Jane')
    await nextTick()
    expect(data.name).toBe('Jane')
    expect(data.email).toBe(null)

    // Reactive -> form
    data.name = 'Judy'
    await nextTick()
    await flushPromises()
    expect(form$.model.name).toBe('Judy')
  })

  it('uses a plain object as initial value without writing back', async () => {
    const data: Record<string, any> = { name: 'John' }

    const { wrapper } = mountUseForm(data)
    await nextTick()

    expect((wrapper.find('input').element as HTMLInputElement).value).toBe(
      'John'
    )

    await wrapper.find('input').setValue('Jane')
    await nextTick()

    expect(data).toEqual({ name: 'John' })
  })

  it('adopts a useModel instance', async () => {
    const model$ = createModel({ name: 'John' })

    const { wrapper, form$ } = mountUseForm(model$)
    await nextTick()

    expect(model$.adopted).toBe(true)
    expect(form$.model).toBe(model$.model)

    await wrapper.find('input').setValue('Jane')
    await nextTick()
    expect(model$.model.name).toBe('Jane')
  })

  it('answers shared model members from a useModel instance before mount', async () => {
    const model$ = createModel({ name: 'John' })
    const show = ref(false)

    let tuple!: UseFormReturn<typeof schema>
    mountApp(
      defineComponent({
        template: '<component :is="MyForm" v-if="show" />',
        setup() {
          tuple = useForm({ schema }, model$)
          return { MyForm: tuple[0], show }
        },
      }) as any
    )

    const [, form$] = tuple

    // Shared members answer from the instance while the form isn't mounted.
    expect(form$.model.name).toBe('John')
    expect('model' in form$).toBe(true)
    expect(typeof form$.toJSON()).toBe('string')

    form$.set('email', 'john@example.com')
    expect(model$.model.email).toBe('john@example.com')

    // Instance-only and mount-only members stay hidden.
    expect((form$ as any).adopted).toBeUndefined()
    expect((form$ as any).input).toBeUndefined()
    expect(form$.submitting).toBeUndefined()

    // After mount the context takes over — same store, values survive.
    show.value = true
    await nextTick()

    expect(model$.adopted).toBe(true)
    expect(form$.model).toBe(model$.model)
    expect(form$.model.email).toBe('john@example.com')
    expect(form$.hasAdoptedModel).toBe(true)
    expect(form$.submitting).toBe(false)
  })

  it('answers nothing before mount for non-instance models', () => {
    const data = ref({ name: 'John' })
    const show = ref(false)

    let tuple!: UseFormReturn<typeof schema>
    mountApp(
      defineComponent({
        template: '<component :is="MyForm" v-if="show" />',
        setup() {
          tuple = useForm({ schema }, data)
          return { MyForm: tuple[0], show }
        },
      }) as any
    )

    const [, form$] = tuple

    expect(form$.model).toBeUndefined()
    expect('model' in form$).toBe(false)
  })

  it('is available on the instance for code outside component setup', async () => {
    const { vueform } = mountApp(
      defineComponent({ template: '<div />' }) as any
    )

    const model$ = vueform.useModel(schema, { name: 'John' } as any)
    const [MyForm, form$] = vueform.useForm({ schema }, model$)

    expect(form$.model.name).toBe('John')
    form$.set('email', 'john@example.com')
    expect(model$.model.email).toBe('john@example.com')

    const wrapper = mountApp(
      defineComponent({
        template: '<component :is="MyForm" />',
        setup: () => ({ MyForm }),
      }) as any
    )

    await nextTick()

    expect(model$.adopted).toBe(true)
    expect(form$.model).toBe(model$.model)
    expect(wrapper.findAll('input')).toHaveLength(2)
  })

  it('throws outside component setup when called as a bare composable', () => {
    expect(() => useForm({ schema })).toThrow(NotInstalledError)
    expect(() => useModel(schema)).toThrow(NotInstalledError)
  })

  it('accepts the instance as an explicit source outside component setup', () => {
    const { vueform } = mountApp(
      defineComponent({ template: '<div />' }) as any
    )

    const model$ = vueform.useModel(schema, { name: 'John' } as any)
    const [MyForm, form$] = useForm({ schema }, model$, vueform)

    expect(MyForm).toBeTruthy()
    expect(form$.model.name).toBe('John')
  })

  it('forwards slots and template children to VfForm', async () => {
    let tuple!: UseFormReturn

    const wrapper = mountApp(
      defineComponent({
        template: `
          <component :is="MyForm">
            <VfText name="name" />
            <div class="custom-content">Custom</div>
          </component>
        `,
        setup() {
          tuple = useForm({})
          return { MyForm: tuple[0] }
        },
      }) as any
    )

    await nextTick()

    expect(wrapper.find('.custom-content').exists()).toBe(true)
    expect(wrapper.findAll('input')).toHaveLength(1)

    const [, form$] = tuple
    expect(form$.model).toEqual({ name: null })
  })

  it('unwraps ref options reactively', async () => {
    const disabled = ref(false)

    let tuple!: UseFormReturn<typeof schema>
    mountApp(
      defineComponent({
        template: '<component :is="MyForm" />',
        setup() {
          tuple = useForm({ schema, disabled })
          return { MyForm: tuple[0] }
        },
      }) as any
    )

    const [, form$] = tuple

    await nextTick()
    expect(form$.disabled).toBe(false)

    disabled.value = true
    await nextTick()
    expect(form$.disabled).toBe(true)
  })

  it('accepts a computed autosave config, toggling autosave reactively', async () => {
    vi.useFakeTimers()
    const { adapter, calls } = mockAdapter()

    const isDraft = ref(true)
    const autosave = computed(() =>
      isDraft.value
        ? { endpoint: '/api/drafts', interval: 5000, on: [] }
        : undefined
    )

    mountApp(
      defineComponent({
        template: '<component :is="MyForm" />',
        setup() {
          const [MyForm] = useForm({ schema, autosave })
          return { MyForm }
        },
      }) as any,
      {},
      { $http: { adapter } }
    )

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(1)

    // flipping the computed to undefined turns autosave off
    isDraft.value = false
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(1)

    vi.useRealTimers()
  })
})
