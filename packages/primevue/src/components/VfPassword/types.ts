import type {
  ClassValue,
  AddonsSlots,
  IconsSlots,
  TranslateSlots,
  AddonsParts,
  IconsParts,
  TranslateParts,
  AddonGroupParts,
  EntryTranslateOf,
  EntryLanguagesOf,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  LanguagesProp,
} from '@vueform/core'
import type { PasswordProps as PvPasswordProps } from 'primevue'
import type { PasswordSlots as APasswordSlots } from 'primevue/password'

import type {
  PasswordApi,
  PasswordClasses,
  PasswordEmits,
  PasswordExpose,
  PasswordParts,
  PasswordProps,
  PasswordSlots,
  forwards,
} from '#src/blueprints/password'
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
 * VfPassword props narrowed from a registry `TEntry` payload, applying the
 * entry's `translate` / `languages` props as generics (so `translate: true`
 * forces a locale-keyed `modelValue`).
 */
export type EntryProps<TEntry> = VfPasswordProps<
  EntryTranslateOf<TEntry>,
  EntryLanguagesOf<TEntry>
>

/**
 * Generic props interface for the VfPassword component, parameterized by the
 * model-driving type arguments (e.g. `VfPasswordProps<true, typeof
 * languages>`). Reach for `VfPasswordProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfPasswordProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends PasswordProps<
  'password',
  TTranslate,
  TLanguages,
  VfPasswordSlots<TTranslate, TLanguages>,
  VfPasswordParts,
  VfPasswordClasses,
  VfPasswordContext<VfPasswordProps<TTranslate, TLanguages>>
> {}

/**
 * Events emitted by the VfPassword component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfPasswordSlots`. Plain usage
 * (`VfPasswordEmits`) keeps the context wide.
 */
export interface VfPasswordEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends PasswordEmits<
  VfPasswordContext<VfPasswordProps<TTranslate, TLanguages>>
> {}

/**
 * Slots available in the VfPassword component.
 */
export interface VfPasswordSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    PasswordSlots<VfPasswordContext<VfPasswordProps<TTranslate, TLanguages>>>,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    TranslateSlots,
    /* @vue-ignore */ ForwardedSlots<
      APasswordSlots,
      (typeof forwards.slots)[number]
    > {}

/**
 * Structural parts of the VfPassword component.
 */
export interface VfPasswordParts
  extends
    PasswordParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    TranslateParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The password input element.
   *
   * @tag Password
   */
  input: PvPasswordProps
}

/**
 * CSS classes for the VfPassword component's structural parts.
 */
export interface VfPasswordClasses
  extends PasswordClasses, FloatLabelClasses, IftaClasses {
  /**
   * The password input element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfPassword.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `PasswordExpose` for all password-based components) so
 * they appear on `ContextOf<'VfPassword'>` / `context$` / `defineExpose`.
 */
export interface VfPasswordExpose extends PasswordExpose {}

/**
 * Public context for VfPassword, optionally parameterized by concrete props
 * (e.g. `VfPasswordContext<VfPasswordProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfPasswordContext<
  TProps extends WidenProps<VfPasswordProps, PasswordProps> = VfPasswordProps,
> extends DefineElementContext<
  TProps,
  VfPasswordEmits,
  VfPasswordSlots,
  VfPasswordParts,
  VfPasswordClasses,
  VfPasswordExpose,
  PasswordApi<TProps>
> {}

/**
 * Registry entry for VfPassword. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
export interface VfPasswordEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfPasswordEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfPasswordSlots,
  VfPasswordParts,
  VfPasswordClasses,
  VfPasswordContext<EntryProps<TEntry>>
> {}
