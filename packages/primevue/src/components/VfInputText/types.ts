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
  LayoutRegionBindings,
  TInputAriaBag,
} from '@vueform/core'
import type { InputTextProps as PvInputTextProps } from 'primevue'

import type {
  InputTextApi,
  InputTextBindings,
  InputTextClasses,
  InputTextEmits,
  InputTextExpose,
  InputTextParts,
  InputTextProps,
  InputTextSlots,
} from '#src/blueprints/input-text'
import type {
  FloatLabelClasses,
  FloatLabelParts,
  FloatLabelSlots,
  IftaClasses,
  IftaParts,
  IftaSlots,
} from '#src/features'

/**
 * VfInputText props narrowed from a registry `TEntry` payload, applying the
 * entry's `translate` / `languages` props as generics (so `translate: true`
 * forces a locale-keyed `modelValue`).
 */
export type EntryProps<TEntry> = VfInputTextProps<
  EntryTranslateOf<TEntry>,
  EntryLanguagesOf<TEntry>
>

/**
 * Generic props interface for the VfInputText component, parameterized by the
 * model-driving type arguments (e.g. `VfInputTextProps<true, typeof
 * languages>`). Reach for `VfInputTextProps` instead when no narrowing is
 * needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfInputTextProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends InputTextProps<
  'input-text',
  TTranslate,
  TLanguages,
  VfInputTextSlots<TTranslate, TLanguages>,
  VfInputTextParts,
  VfInputTextClasses,
  VfInputTextContext<VfInputTextProps<TTranslate, TLanguages>>
> {}

/**
 * Events emitted by the VfInputText component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfInputTextSlots`. Plain usage
 * (`VfInputTextEmits`) keeps the context wide.
 */
export interface VfInputTextEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
> extends InputTextEmits<
  VfInputTextContext<VfInputTextProps<TTranslate, TLanguages>>
> {}

/**
 * Slots available in the VfInputText component.
 */
export interface VfInputTextSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    InputTextSlots<
      VfInputTextContext<VfInputTextProps<TTranslate, TLanguages>>
    >,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}

/**
 * Structural parts of the VfInputText component.
 */
export interface VfInputTextParts
  extends
    InputTextParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    TranslateParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The text input element.
   *
   * @tag InputText
   */
  input: PvInputTextProps
}

/**
 * CSS classes for the VfInputText component's structural parts.
 */
export interface VfInputTextClasses
  extends InputTextClasses, FloatLabelClasses, IftaClasses {
  /**
   * The text input element.
   */
  input: ClassValue
}

/**
 * Part-keyed binding definitions of the VfInputText component: its own state
 * markers merged with the `tInputAria` pattern entries it registers via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
export interface VfInputTextBindings
  extends InputTextBindings, LayoutRegionBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The input control's validation and ARIA state, including the active
   * editing language for translatable inputs.
   */
  input: {
    'data-invalid'?: ''
  } & TInputAriaBag
}

/**
 * Augmentable public API surface for VfInputText.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `InputTextExpose` for all input-text-based components) so
 * they appear on `ContextOf<'VfInputText'>` / `context$` / `defineExpose`.
 */
export interface VfInputTextExpose extends InputTextExpose {}

/**
 * Public context for VfInputText, optionally parameterized by concrete props
 * (e.g. `VfInputTextContext<VfInputTextProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfInputTextContext<
  TProps extends WidenProps<VfInputTextProps, InputTextProps> =
    VfInputTextProps,
> extends DefineElementContext<
  TProps,
  VfInputTextEmits,
  VfInputTextSlots,
  VfInputTextParts,
  VfInputTextClasses,
  VfInputTextBindings,
  VfInputTextExpose,
  InputTextApi<TProps>
> {}

/**
 * Registry entry for VfInputText. `TEntry` narrows the props / emits / context
 * by the entry's model-driving props, the same way SFC generics do.
 */
export interface VfInputTextEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfInputTextEmits<EntryTranslateOf<TEntry>, EntryLanguagesOf<TEntry>>,
  VfInputTextSlots,
  VfInputTextParts,
  VfInputTextClasses,
  VfInputTextContext<EntryProps<TEntry>>
> {}
