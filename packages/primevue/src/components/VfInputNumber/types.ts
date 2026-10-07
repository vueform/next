import type {
  ClassValue,
  AddonsSlots,
  IconsSlots,
  AddonsParts,
  IconsParts,
  AddonGroupParts,
  DefineElementContext,
  DefineRegistryEntry,
} from '@vueform/core'
import type {
  InputNumberProps as PvInputNumberProps,
  InputNumberSlots as AInputNumberSlots,
} from 'primevue'

import type {
  InputNumberApi,
  InputNumberClasses,
  InputNumberEmits,
  InputNumberExpose,
  InputNumberParts,
  InputNumberProps,
  InputNumberSlots,
  forwards,
} from '#src/blueprints/input-number'
import type {
  FloatLabelClasses,
  FloatLabelParts,
  FloatLabelSlots,
  IftaClasses,
  IftaParts,
  IftaSlots,
} from '#src/features'
import type { ForwardedSlots } from '#src/types'

/**
 * Props for the VfInputNumber component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfInputNumberProps extends InputNumberProps<
  'input-number',
  VfInputNumberSlots,
  VfInputNumberParts,
  VfInputNumberClasses,
  VfInputNumberContext
> {}

/**
 * Events emitted by the VfInputNumber component.
 */
export interface VfInputNumberEmits extends InputNumberEmits<VfInputNumberContext> {}

/**
 * Slots available in the VfInputNumber component.
 */
export interface VfInputNumberSlots
  extends
    InputNumberSlots<VfInputNumberContext>,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ ForwardedSlots<
      AInputNumberSlots,
      (typeof forwards.slots)[number]
    > {}

/**
 * Structural parts of the VfInputNumber component.
 */
export interface VfInputNumberParts
  extends
    InputNumberParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The number input element.
   *
   * @tag InputNumber
   */
  input: PvInputNumberProps
}

/**
 * CSS classes for the VfInputNumber component's structural parts.
 */
export interface VfInputNumberClasses
  extends InputNumberClasses, FloatLabelClasses, IftaClasses {
  /**
   * The number input element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfInputNumber.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `InputNumberExpose` for all input-number-based
 * components) so they appear on `ContextOf<'VfInputNumber'>` / `context$` /
 * `defineExpose`.
 */
export interface VfInputNumberExpose extends InputNumberExpose {}

/**
 * Public context for VfInputNumber.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfInputNumberContext extends DefineElementContext<
  VfInputNumberProps,
  VfInputNumberEmits,
  VfInputNumberSlots,
  VfInputNumberParts,
  VfInputNumberClasses,
  VfInputNumberExpose,
  InputNumberApi
> {}

/**
 * Registry entry for VfInputNumber. `TEntry` is accepted for registry
 * uniformity but does not narrow anything — VfInputNumber has no prop-driven
 * generics.
 */
export interface VfInputNumberEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfInputNumberProps,
  VfInputNumberEmits,
  VfInputNumberSlots,
  VfInputNumberParts,
  VfInputNumberClasses,
  VfInputNumberContext
> {}
