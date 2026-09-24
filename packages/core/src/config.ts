import { computed, useId } from 'vue'
import { defineConfig } from '@core/helpers'

/**
 * The default Vueform configuration including all built-in rules, modules,
 * breakpoints, and grid settings.
 */
const defaultConfig = defineConfig({
  modules: {},
  $autosave: {},
  $conditions: {
    strict: false,
    debounce: 300,
  },
  $date: {},
  $expression: {},
  $http: {
    defaultMethod: 'GET',
    base64: false,
    requestType: 'json',
    responseType: 'json',
    timeout: 0,
    withCredentials: false,
    headers: {},
  },
  $locale: {},
  $model: {},
  $router: {},
  $security: {},
  $theme: {},
  $validation: {},
  lazy: true,
  matrixTypes: {
    single: ['radio', 'radios'],
    multiple: ['checkbox', 'checkboxes'],
    auto: ['text', 'group'],
  },
  grid: true,
  nativeEmit: false,
  mobileFirst: true,
  useHead: true,
  nonce: undefined,
  classHelpers: false,
  locale: '',
  fallbackLocale: '',
  plugins: [],
  globals: () => ({
    defaultBreakpoint: computed(() => 'base'),
  }),
  globalWarns: true,
  locales: {},
  languages: {},
  components: {},
  presets: {},
  reclass: {},
  defaults: {},
  tokens: {},
  build: {
    styleId: 'vueform-theme',
    scopedDarkMode: false,
    darkClass: 'vf-dark',
    lightClass: 'vf-light',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  rules: {},

  localeParamPattern: /\{(\w+)\}/g,
  icons: {
    add: 'vf-icon-add',
    remove: 'vf-icon-remove',
    sort: 'vf-icon-sort',
  },
  icon: (name: string) => name,
  uid: () => useId(),
  cols: (size, breakpoint) => {
    return breakpoint === undefined
      ? size === undefined
        ? `vf-col`
        : `vf-col-${size}`
      : size === undefined
        ? `vf-col-${breakpoint}`
        : `vf-col-${breakpoint}-${size}`
  },
  label: (size, breakpoint) => {
    return breakpoint === undefined
      ? size < 12
        ? `vf-horizontal`
        : 'vf-vertical'
      : size < 12
        ? `vf-col-${breakpoint}:vf-horizontal`
        : `vf-col-${breakpoint}:vf-vertical`
  },
  classHelper: (key) => `[__${key}__]`,
  ruleMessageTag: (name, type) =>
    type ? `rule_${name}_${type}_error` : `rule_${name}_error`,
})

// eslint-disable-next-line
export default defaultConfig
export { defaultConfig }
