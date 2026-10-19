import type {
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
  InputAriaA11y,
} from '@vueform/core'
import type {
  InputOtpProps as PvInputOtpProps,
  InputOtpSlots as AInputOtpSlots,
} from 'primevue'

import type {
  InputOtpA11y,
  InputOtpApi,
  InputOtpClasses,
  InputOtpEmits,
  InputOtpExpose,
  InputOtpModifiers,
  InputOtpParts,
  InputOtpProps,
  InputOtpSlots,
  forwards,
} from '#src/blueprints/input-otp'
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
 * Props for the VfInputOtp component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfInputOtpProps extends InputOtpProps<
  'input-otp',
  VfInputOtpSlots,
  VfInputOtpParts,
  VfInputOtpClasses,
  VfInputOtpContext
> {}

/**
 * Events emitted by the VfInputOtp component.
 */
export interface VfInputOtpEmits extends InputOtpEmits<VfInputOtpContext> {}

/**
 * Slots available in the VfInputOtp component.
 */
export interface VfInputOtpSlots
  extends
    InputOtpSlots<VfInputOtpContext>,
    FloatLabelSlots,
    IftaSlots,
    /* @vue-ignore */ ForwardedSlots<
      AInputOtpSlots,
      (typeof forwards.slots)[number]
    > {}

/**
 * Structural parts of the VfInputOtp component.
 */
export interface VfInputOtpParts
  extends InputOtpParts, FloatLabelParts, IftaParts {
  /**
   * The OTP input element.
   *
   * @tag InputOtp
   */
  input: PvInputOtpProps
}

/**
 * CSS classes for the VfInputOtp component's structural parts.
 */
export interface VfInputOtpClasses
  extends InputOtpClasses, FloatLabelClasses, IftaClasses {
  /**
   * The OTP input element.
   */
  input: ClassValue
}

/**
 * Accessibility bindings of the VfInputOtp component, produced by the `inputAria`
 * pattern the component registers via `useA11y`.
 */
export interface VfInputOtpA11y extends InputOtpA11y, InputAriaA11y {}

/**
 * Styling modifiers of the VfInputOtp component.
 */
export interface VfInputOtpModifiers extends InputOtpModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The input control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}

/**
 * Augmentable public API surface for VfInputOtp.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `InputOtpExpose` for all input-otp-based components) so
 * they appear on `ContextOf<'VfInputOtp'>` / `context$` / `defineExpose`.
 */
export interface VfInputOtpExpose extends InputOtpExpose {}

/**
 * Public context for VfInputOtp.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 *
 * Non-generic: no `TProps` parameter — the api has nothing to narrow from
 * props, so the context is a fixed `DefineElementContext` instantiation.
 */
export interface VfInputOtpContext extends DefineElementContext<
  VfInputOtpProps,
  VfInputOtpEmits,
  VfInputOtpSlots,
  VfInputOtpParts,
  VfInputOtpClasses,
  VfInputOtpModifiers,
  VfInputOtpA11y,
  VfInputOtpExpose,
  InputOtpApi
> {}

/**
 * Registry entry for VfInputOtp. `TEntry` is accepted for registry uniformity
 * but does not narrow anything — VfInputOtp has no prop-driven generics.
 */
export interface VfInputOtpEntry<
  _TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  VfInputOtpProps,
  VfInputOtpEmits,
  VfInputOtpSlots,
  VfInputOtpParts,
  VfInputOtpClasses,
  VfInputOtpContext
> {}
