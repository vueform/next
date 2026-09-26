import type {
  InputOtpApi,
  InputOtpClasses,
  InputOtpEmits,
  InputOtpExpose,
  InputOtpParts,
  InputOtpProps,
  InputOtpSlots,
  forwards,
} from '#primevue/blueprints/input-otp'
import type {
  FloatLabelClasses,
  FloatLabelParts,
  FloatLabelSlots,
  IftaClasses,
  IftaParts,
  IftaSlots,
} from '#primevue/features'
import type { ForwardedSlots } from '#primevue/types'
import type {
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
} from '@vueform/core'
import type {
  InputOtpProps as PvInputOtpProps,
  InputOtpSlots as AInputOtpSlots,
} from 'primevue'

/**
 * Props for the VfInputOtp component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
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
