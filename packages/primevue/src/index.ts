import { createVueformFactory } from '@vueform/core'
import defaultConfig from '@/config'

export * from '@vueform/core'
export { makeTAria, makeAria } from '@/features'
export * from '@/directives'
export * from '@/features'
export * from '@/helpers'
export * from '@/types'

export { defaultConfig }

/**
 * Creates a Vueform Vue plugin instance from user-provided configuration merged
 * with the PrimeVue adapter defaults. This bare entry bundles no modules or
 * locales, so the `model` module must be registered (everything else is
 * optional). The tooltip directive is registered by the config's plugin.
 */
export const createVueform = createVueformFactory<'model'>(defaultConfig)
