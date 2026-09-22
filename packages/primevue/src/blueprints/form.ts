import { defineDefaults } from '@vueform/core'
import {
  defaults as coreDefaults,
  type FormProps,
} from '@vueform/core/blueprints/form'

export * from '@vueform/core/blueprints/form'

declare module '@vueform/core/blueprints/form' {
  interface FormProps {
    /**
     * Whether to render steps/tabs in a vertical layout.
     *
     * @write
     */
    vertical?: boolean
  }
}

/**
 * Default prop values for the PrimeVue form blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<FormProps>()({
  ...coreDefaults,
})
