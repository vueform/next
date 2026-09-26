import { mount, flushPromises } from '@vue/test-utils'
import { createVueform, mergeUntilDepth, type UserConfig } from '@vueform/core'
import { en_US } from '@vueform/core/locales'
import * as modules from '@vueform/core/modules'
import * as rules from '@vueform/core/rules'
import PrimeVue from 'primevue/config'
import tooltip from 'primevue/tooltip'
import type { DefineComponent } from 'vue'
import exprEval from '#expr-eval'
import * as components from '#primevue/components'
import defaultConfig from '#primevue/config'
import { theme } from '#primevue/themes'

export { flushPromises, mount }

export const createForm = (
  props: any,
  config: UserConfig = {},
  options: any = {}
) => {
  const form$ = mount(components.VfForm, {
    props,
    ...mergeUntilDepth(
      {
        global: {
          directives: { tooltip },
          plugins: [
            [PrimeVue, { unstyled: true }],
            createVueform({
              locales: { en_US },
              rules,
              modules,
              components,
              defaults: defaultConfig.defaults,
              theme,
              plugins: [exprEval()],
              ...config,
              // String slot entries are off by default; the suite uses them
              // broadly, so opt in here.
              $security: { stringSlots: true, ...config.$security },
            } as any),
          ],
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
    ...[...(elements$.entries() as any)].reduce(
      (all: any, [key, value]: [string, any]) => ({
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
  } & Record<string, any>
}

export const mountApp = <T extends DefineComponent<any, any, any>>(
  component: T,
  options = {}
) => {
  return mount(component, {
    ...options,
    global: {
      directives: { tooltip },
      plugins: [
        [PrimeVue, { unstyled: true }],
        createVueform({
          locales: { en_US },
          components,
          rules,
          modules,
          theme,
          plugins: [exprEval()],
          $security: { stringSlots: true },
        } as any),
      ],
    },
  })
}
