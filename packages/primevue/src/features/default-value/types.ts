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

/**
 * Props for the element's default/initial value (PrimeVue `defaultValue`
 * naming).
 *
 * @deprecated Use `ModelPropsWithDefaultValue` instead.
 */
export type DefaultValueProps<T = any> = Pick<
  ModelPropsWithDefaultValue<T>,
  'defaultValue'
>
