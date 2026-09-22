import type { FormContext } from './component'
import type { IntrinsicElementAttributes } from 'vue'

// ============== GENERAL ===============

declare const compContextBrand: unique symbol

/**
 * Marker mixed into `LooseContext` so refined event maps can find `context$`
 * slots by type (not by argument position).
 */
export type LooseContext = {
  readonly [compContextBrand]?: true
} & { form$: FormContext }

/**
 * A unique identifier string used internally to track component instances.
 */
export type UID = string

/**
 * An element's field name, typically a string but may be a numeric index in
 * list contexts.
 */
export type ElementName = string | number

/**
 * A page or step name identifier.
 */
export type PageName = string | number

/**
 * A map of intrinsic HTML element attributes used for DOM attribute typing.
 */
export type DOMAttrs = IntrinsicElementAttributes

export type DomAttrsOf<T extends keyof IntrinsicElementAttributes> =
  IntrinsicElementAttributes[T] & Record<string, string>

/**
 * @write
 */
export type Booleanish = boolean | 'true' | 'false'
