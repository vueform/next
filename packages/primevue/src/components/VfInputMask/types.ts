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
import type { InputMaskProps as PvInputMaskProps } from 'primevue'
import type {
  InputMaskA11y,
  InputMaskApi,
  InputMaskClasses,
  InputMaskEmits,
  InputMaskExpose,
  InputMaskModifiers,
  InputMaskParts,
  InputMaskProps,
  InputMaskSlots,
} from '#src/blueprints/input-mask'
import type {
  FloatLabelClasses,
  FloatLabelParts,
  FloatLabelSlots,
  IftaClasses,
  IftaParts,
  IftaSlots,
} from '#src/features'

/**
 * VfInputMask props narrowed from a registry `TEntry` payload, applying the
 * entry's `translate` / `languages` props as generics (so `translate: true`
 * forces a locale-keyed `modelValue`).
 */
export type EntryProps<TEntry> = VfInputMaskProps<
  EntryTranslateOf<TEntry>,
  EntryLanguagesOf<TEntry>
>

/**
 * Generic props interface for the VfInputMask component, parameterized by the
 * model-driving type arguments (e.g. `VfInputMaskProps<true, typeof
 * languages>`). Reach for `VfInputMaskProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfInputMaskProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends InputMaskProps<
  'input-mask',
  TTranslate,
  TLanguages,
  VfInputMaskSlots<TTranslate, TLanguages>,
  VfInputMaskParts,
  VfInputMaskClasses,
  VfInputMaskContext<VfInputMaskProps<TTranslate, TLanguages>>
> {}

/**
 * Events emitted by the VfInputMask component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfInputMaskSlots`. Plain usage
 * (`VfInputMaskEmits`) keeps the context wide.
 */
export interface VfInputMaskEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends InputMaskEmits<
  VfInputMaskContext<VfInputMaskProps<TTranslate, TLanguages>>
> {}

/**
 * Slots available in the VfInputMask component.
 */
export interface VfInputMaskSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    InputMaskSlots<
      VfInputMaskContext<VfInputMaskProps<TTranslate, TLanguages>>
    >,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}

/**
 * Structural parts of the VfInputMask component.
 */
export interface VfInputMaskParts
  extends
    InputMaskParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    TranslateParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The masked input element.
   *
   * @tag InputMask
   */
  input: PvInputMaskProps
}

/**
 * CSS classes for the VfInputMask component's structural parts.
 */
export interface VfInputMaskClasses
  extends InputMaskClasses, FloatLabelClasses, IftaClasses {
  /**
   * The masked input element.
   */
  input: ClassValue
}

/**
 * Accessibility bindings of the VfInputMask component.
 */
export interface VfInputMaskA11y extends InputMaskA11y {}

/**
 * Styling modifiers of the VfInputMask component.
 */
export interface VfInputMaskModifiers extends InputMaskModifiers {
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
 * Augmentable public API surface for VfInputMask.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `InputMaskExpose` for all input-mask-based components) so
 * they appear on `ContextOf<'VfInputMask'>` / `context$` / `defineExpose`.
 */
export interface VfInputMaskExpose extends InputMaskExpose {}

/**
 * Public context for VfInputMask, optionally parameterized by concrete props
 * (e.g. `VfInputMaskContext<VfInputMaskProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfInputMaskContext<
  TProps extends WidenProps<VfInputMaskProps, InputMaskProps> =
    VfInputMaskProps,
> extends DefineElementContext<
  TProps,
  VfInputMaskEmits,
  VfInputMaskSlots,
  VfInputMaskParts,
  VfInputMaskClasses,
  VfInputMaskModifiers,
  VfInputMaskA11y,
  VfInputMaskExpose,
  InputMaskApi<TProps>
> {}

/**
 * Registry entry for VfInputMask. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
export interface VfInputMaskEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfInputMaskEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfInputMaskSlots,
  VfInputMaskParts,
  VfInputMaskClasses,
  VfInputMaskContext<EntryProps<TEntry>>
> {}
