import { createVueformFactory } from '@vueform/core'
import defaultConfig from '#ui/config'

export * from '@vueform/core'
export type * from '#ui/features'

export { defaultConfig }

/**
 * Creates a Vueform Vue plugin instance from user-provided configuration merged
 * with the UI defaults. This bare entry bundles no modules or locales, so the
 * `model` module must be registered (everything else is optional).
 */
export const createVueform = createVueformFactory<'model'>(defaultConfig)
