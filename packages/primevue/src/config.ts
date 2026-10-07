import {
  defaultConfig as defaultConfigBase,
  defineConfig,
  definePlugin,
  type TProp,
} from '@vueform/core'
import type { PropType } from 'vue'

import { vTooltip } from '#src/directives'
import { makeInfo } from '#src/features'

/**
 * Registers the `v-tooltip` directive used by info icons unless the app already
 * provides one.
 */
const tooltipPlugin = definePlugin(() => ({
  name: 'tooltip',
  install: ({ app }) => {
    if (!app.directive('tooltip')) {
      app.directive('tooltip', vTooltip as any)
    }
  },
}))

/**
 * Adds `info` / `infoPosition` props with tooltip rendering to container
 * components.
 */
const infoIconsPlugin = definePlugin(() => ({
  name: 'info-icons',
  apply: ['VfGroup', 'VfGrid', 'VfMatrix', 'VfList'],
  props: {
    info: {
      type: [Object, String, Function] as PropType<TProp>,
    },
    infoPosition: {
      type: [Object, String, Function] as PropType<TProp>,
    },
  },
  extend: (props, api) => makeInfo()({ props, deps: api } as any),
}))

const defaultConfig = defineConfig({
  ...defaultConfigBase,
  matrixTypes: {
    single: ['radio-button', 'radio-button-group'],
    multiple: ['checkbox', 'checkbox-group'],
    auto: ['input-text', 'group'],
  },
  icon: (name: string) =>
    !name ? '' : name.startsWith('pi pi-') ? name : `pi pi-${name}`,
  icons: {
    add: 'plus',
    remove: 'times',
    sort: 'bars',
  },
  plugins: [tooltipPlugin(), infoIconsPlugin()],
})

export default defaultConfig
export { defaultConfig }
