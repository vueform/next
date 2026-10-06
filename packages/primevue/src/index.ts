import { createVueformFactory } from '@vueform/core'

import defaultConfig from '#primevue/config'

export * from '@vueform/core'
export { makeTAria, makeAria } from '#primevue/features'
export * from '#primevue/directives'
export * from '#primevue/features'
export * from '#primevue/helpers'
export * from '#primevue/types'

export { defaultConfig }

/**
 * Creates a Vueform Vue plugin instance from user-provided configuration merged
 * with the PrimeVue adapter defaults. This bare entry bundles no modules or
 * locales, so the `model` module must be registered (everything else is
 * optional). The tooltip directive is registered by the config's plugin.
 */
export const createVueform = createVueformFactory<'model'>(defaultConfig)
