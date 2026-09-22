import { mount, DOMWrapper, flushPromises } from '@vue/test-utils'
import {
  createVueform,
  fetchHttpAdapter,
  mergeUntilDepth,
  model,
  nativeDateAdapter,
  upperFirst,
  type UserConfig,
  type VueformInstance,
} from '@vueform/core'
import * as components from '@vueform/core/components'
import { en_US } from '@vueform/core/locales'
import * as modules from '@vueform/core/modules'
import * as rules from '@vueform/core/rules'
import exprEval from '@vueform/expr-eval'
import {
  defineComponent,
  nextTick,
  onMounted,
  ref,
  type DefineComponent,
} from 'vue'
import VfTest from './integration/.fixture/VfTest.vue'

export { flushPromises, mount }

// Per-key overrides for the shared element classes VfLayout installs —
// applied via the `layoutClasses` config option, which also keeps the option
// covered by the whole suite.
const layoutClasses = {
  root: ({
    spaceTop,
    spaceBottom,
    lineTop,
    lineBottom,
  }: {
    spaceTop?: number
    spaceBottom?: number
    lineTop?: boolean
    lineBottom?: boolean
  } = {}) => {
    return {
      'vf-element': true,
      [`vf-space-top-${spaceTop}`]: !!spaceTop,
      [`vf-space-bottom-${spaceBottom}`]: !!spaceBottom,
      'vf-line-top': !!lineTop,
      'vf-line-bottom': !!lineBottom,
    }
  },
  rootInline: ({
    spaceTop,
    spaceBottom,
    lineTop,
    lineBottom,
  }: {
    spaceTop?: number
    spaceBottom?: number
    lineTop?: boolean
    lineBottom?: boolean
  } = {}) => ({
    'vf-inline-element': true,
    [`vf-space-top-${spaceTop}`]: !!spaceTop,
    [`vf-space-bottom-${spaceBottom}`]: !!spaceBottom,
    'vf-line-top': !!lineTop,
    'vf-line-bottom': !!lineBottom,
  }),
  panel: 'vf-panel',
  labelGroup: (heading?: HeadingProp) => ({
    'vf-label-group': true,
    [`vf-h${heading}`]: !!heading,
  }),
  label: 'vf-label',
  required: 'vf-required',
  elementGroup: 'vf-element-group',
  elementWrapper: 'vf-element-wrapper',
  loading: 'vf-icon vf-icon-loading',
  help: 'vf-help',
  description: 'vf-description',
  errors: 'vf-errors',
  error: 'vf-error',
  messages: 'vf-messages',
  message: 'vf-message',
}

/**
 * Creates a test Vueform instance. Mount helpers expose it (`vueform`) so test
 * bodies — which run outside any component context — use the instance API
 * (`vueform.useModel(...)`, `useHttp(vueform)`) like real out-of-component
 * code.
 */
const makeTestVueform = (config: UserConfig = {}) => {
  return createVueform({
    locales: { en_US },
    rules,
    modules: { ...modules, model },
    components: {
      ...components,
      VfTest,
    },
    layoutClasses,
    ...config,
    // User plugins add to the expression plugin rather than replacing it —
    // tests routinely need both (e.g. dompurify + expressions).
    plugins: [exprEval(), ...(config.plugins ?? [])],
    $date: { adapter: nativeDateAdapter, ...config.$date },
    $http: { adapter: fetchHttpAdapter, ...config.$http },
  } as any)
}

export const createForm = (props, config: UserConfig = {}, options = {}) => {
  const vueform = makeTestVueform(config)

  const form$ = mount(components.VfForm, {
    props,
    ...mergeUntilDepth(
      {
        global: {
          plugins: [vueform],
        },
      },
      options,
      2
    ),
  })

  const elements$ = form$.vm.elements$

  return {
    form$: form$.vm,
    form: form$,
    // The instance the form was created with — for out-of-setup calls in test
    // bodies (`vueform.useModel(...)`, `useHttp(vueform)`).
    vueform,
    ...[...(elements$.entries() as any)].reduce(
      (all, [key, value]) => ({
        ...all,
        [key]: value,
      }),
      {}
    ),
    vm: form$.vm,
  } as {
    form$: typeof form$.vm
    form: typeof form$
    vm: typeof form$.vm
    vueform: VueformInstance
  } & Record<string, any>
}

export const createForm2 = (props, config: UserConfig = {}, options = {}) => {
  return mount(components.VfForm, {
    props,
    ...mergeUntilDepth(
      {
        global: {
          plugins: [makeTestVueform(config)],
        },
      },
      options,
      2
    ),
  })
}

export const mountApp = <T extends DefineComponent<any, any, any>>(
  component: T,
  options = {},
  config: UserConfig = {}
) => {
  const vueform = makeTestVueform({ components, ...config } as any)
  const fullOptions = {
    ...options,
    global: {
      plugins: [vueform],
    },
  }
  // The instance is exposed on the wrapper for out-of-setup calls in tests.
  return Object.assign(mount(component, fullOptions), { vueform })
}

export const makeApp = <T extends string>(
  template,
  structures: readonly T[] = [],
  props?: Record<string, any>
) => {
  const allStructures = ['form', ...structures] as const

  return defineComponent({
    template,
    setup(props, { emit }) {
      const mounted = ref(false)

      const mvList = ref(['foo', 'bar'])

      const queue = []

      const handleUpdate = (type, v) => {
        if (!mounted.value) {
          queue.push(() => emit(`update:${type}`, v))
          return
        }

        emit(`update:${type}`, v)
      }

      const refs: Partial<
        Record<(typeof allStructures)[number] | (string & {}), any>
      > = {}

      allStructures.forEach((s) => (refs[`${s}$`] = ref()))

      onMounted(() => {
        mounted.value = true

        nextTick(() => {
          queue.forEach((q) => q())
        })
      })

      return {
        mvList,
        handleUpdate,
        ...refs,
      }
    },
    emits: allStructures.map((s) => `update:${s}`),
    props: {
      ...allStructures.reduce(
        (prev, curr) => ({
          ...prev,
          [curr]: {
            type: [Object, Array, String, Number, Boolean],
            default: undefined,
          },
          [`onChange${upperFirst(curr)}`]: {
            type: Function,
          },
        }),
        {} as Record<(typeof allStructures)[number] | (string & {}), any>
      ),
      ...props,
    },
  })
}

export function vModelAndChange(structure) {
  return `:model-value="${structure}" v-on="${structure} !== undefined ? { 'update:modelValue': v => handleUpdate('${structure}', v) } : {}" @change="onChange${upperFirst(
    structure
  )}"`
}

export function el(form, path) {
  const types = ['VfText', 'VfGroup', 'VfObject', 'VfGrid', 'VfList']

  const elements = types.reduce(
    (elements, name) => ({
      ...elements,
      ...form.findAllComponents({ name }).reduce((comps, { vm }) => {
        return {
          ...comps,
          [vm.path]: vm,
        }
      }, {}),
    }),
    {}
  )

  return elements[path]
}

export function getAttr(
  parent: ReturnType<typeof mount>,
  selector: string | { name: string },
  attr: string,
  nth = 0
) {
  const $el =
    typeof selector === 'string'
      ? parent.findAll(selector)[nth]
      : parent.findAllComponents(selector)[nth]

  return $el?.attributes?.(attr)
}

export function getClass(
  parent: ReturnType<typeof mount>,
  selector?: string | { name: string },
  nth = 0
) {
  let $el = selector
    ? typeof selector === 'string'
      ? parent.findAll(selector)[nth]
      : parent.findAllComponents(selector)[nth].vm.$el
    : parent.vm.$el

  if ($el instanceof DOMWrapper) {
    return $el.attributes('class')
  }

  if (!($el instanceof HTMLElement)) {
    $el = $el?.nextElementSibling
  }

  return $el?.getAttribute('class')
}
