import type { ModelProps } from '@vueform/core'

/**
 * `ModelProps` plus a PrimeVue-style `defaultValue` prop (same type as
 * `modelValue`).
 */
export interface ModelPropsWithDefaultValue<
  T = any,
  TContext = any,
> extends ModelProps<T, TContext> {
  /**
   * The default/initial value of the element.
   */
  defaultValue?: T
}
