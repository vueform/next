import { mount, DOMWrapper, flushPromises } from '@vue/test-utils'
import {
  createVueform,
  fetchHttpAdapter,
  mergeUntilDepth,
  nativeDateAdapter,
  upperFirst,
  type UserConfig,
  type VueformInstance,
} from '@vueform/core'
import * as components from '@vueform/core/components'
import { en_US } from '@vueform/core/locales'

import './integration/fixtures/base'
import * as modules from '@vueform/core/modules'
import * as rules from '@vueform/core/rules'
import exprEval from '@vueform/expr-eval'
import axe from 'axe-core'
import { defineComponent, nextTick, onMounted, ref, type Component } from 'vue'

import VfTest from './integration/fixtures/VfTest.vue'

export { flushPromises, mount }

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
    modules,
    components: {
      ...components,
      VfTest,
    },
    ...config,
    plugins: [exprEval(), ...(config.plugins ?? [])],
    $date: { adapter: nativeDateAdapter, ...config.$date },
    $http: { adapter: fetchHttpAdapter, ...config.$http },
    $security: { ...config.$security },
  } as any)
}

export const createForm = (
  props: Record<string, any>,
  config: UserConfig = {},
  options = {}
) => {
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

export const createForm2 = (
  props: Record<string, any>,
  config: UserConfig = {},
  options = {}
) => {
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

export const mountApp = <T extends Component>(
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
  template: string,
  structures: readonly T[] = [],
  props?: Record<string, any>
) => {
  const allStructures = ['form', ...structures] as const

  return defineComponent({
    template,
    setup(props, { emit }) {
      const mounted = ref(false)

      const mvList = ref(['foo', 'bar'])

      const queue: (() => void)[] = []

      const handleUpdate = (type: string, v: unknown) => {
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

export function vModelAndChange(structure: string) {
  return `:model-value="${structure}" v-on="${structure} !== undefined ? { 'update:modelValue': v => handleUpdate('${structure}', v) } : {}" @change="onChange${upperFirst(
    structure
  )}"`
}

export function el(form: ReturnType<typeof mount>, path: string) {
  const types = ['VfText', 'VfGroup', 'VfObject', 'VfGrid', 'VfList']

  const elements = types.reduce<Record<string, any>>(
    (elements, name) => ({
      ...elements,
      ...form
        .findAllComponents({ name })
        .reduce<Record<string, any>>((comps, { vm }) => {
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

/**
 * Asserts axe-core reports no violations for the element subtree.
 *
 * Mount helpers render detached (no `attachTo`), but axe only audits nodes
 * that are part of the document — the subtree's detached root is temporarily
 * appended to `document.body` for the run and removed afterwards, which keeps
 * the element's own position in its tree untouched.
 *
 * `color-contrast` is disabled (no real layout in happy-dom) and so is
 * `region` (a page-level landmark rule that is meaningless for a component
 * fragment).
 */
export const expectNoA11yViolations = async (el: Element) => {
  let root: Element = el
  while (root.parentElement) root = root.parentElement

  const detached = !root.isConnected
  if (detached) document.body.appendChild(root)

  try {
    const results = await axe.run(el as any, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
      },
    })

    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.html),
      }))
    ).toEqual([])
  } finally {
    if (detached) root.remove()
  }
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
