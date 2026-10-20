import type { VNode } from 'vue'

import type { InputAriaBag, LayoutRegionBindings } from '#src/a11y'
import {
  type FieldApi,
  type FieldClasses,
  type FieldEmits,
  type FieldExpose,
  type FieldBindings,
  type FieldParts,
  type FieldProps,
  type FieldSlots,
} from '#src/blueprints/field'
import type {
  AddonsSlots,
  IconsClasses,
  IconsParts,
  IconsSlots,
  TranslateSlots,
  AddonsParts,
  TranslateParts,
  AddonGroupClasses,
  EntryTranslateOf,
  EntryLanguagesOf,
} from '#src/features'
import type {
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  DomAttrsOf,
  EntryPropOr,
  LanguagesProp,
} from '#src/types'

/**
 * `TNullValue` fallback for a registry `TEntry` payload without a `nullValue`
 * prop: the text scalar when the entry translates (each language's entry),
 * `any` otherwise — an undeclared model shape stays unconstrained. Mirrors the
 * SFC's generic default.
 */
export type EntryNullValueOf<TEntry> = EntryPropOr<
  TEntry,
  'nullValue',
  [EntryTranslateOf<TEntry>] extends [true] ? string | number | null : any
>

/**
 * VfField props narrowed from a registry `TEntry` payload, applying the entry's
 * `translate` / `languages` / `nullValue` props as generics.
 */
export type EntryProps<TEntry> = VfFieldProps<
  EntryTranslateOf<TEntry>,
  EntryLanguagesOf<TEntry>,
  EntryNullValueOf<TEntry>
>

/**
 * Generic props interface for the VfField component, parameterized by the
 * model-driving type arguments (e.g. `VfFieldProps<true, typeof languages>` /
 * `VfFieldProps<false, LanguagesProp, 0>`). `nullValue` types one value: the
 * model when `translate` is false, each language's entry when it is true. Reach
 * for `VfFieldProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfFieldProps<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
> extends FieldProps<
  'field',
  TTranslate,
  TLanguages,
  TNullValue,
  VfFieldSlots<TTranslate, TLanguages, TNullValue>,
  VfFieldParts,
  VfFieldClasses,
  VfFieldContext<VfFieldProps<TTranslate, TLanguages, TNullValue>>
> {}

/**
 * Events emitted by the VfField component, parameterized by the model-driving
 * type arguments so event handlers (e.g. `@change`) receive the narrowed
 * context — same pattern as `VfFieldSlots`. Plain usage (`VfFieldEmits`) keeps
 * the context wide.
 */
export interface VfFieldEmits<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
> extends FieldEmits<
  VfFieldContext<VfFieldProps<TTranslate, TLanguages, TNullValue>>
> {}

/**
 * Slots available in the VfField component.
 */
export interface VfFieldSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
>
  extends
    FieldSlots<
      VfFieldContext<VfFieldProps<TTranslate, TLanguages, TNullValue>>
    >,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {
  /**
   * Default slot where the user renders their 3rd party component. Receives the
   * full component context.
   *
   * @param scope The default slot's params.
   */
  default: (scope: {
    /**
     * The component's context.
     */
    context: VfFieldContext<VfFieldProps<TTranslate, TLanguages, TNullValue>>
  }) => VNode[]
}

/**
 * Structural parts of the VfField component.
 */
export interface VfFieldParts
  extends FieldParts, AddonsParts, IconsParts, TranslateParts {
  /**
   * The user-rendered control. VfField does not render it — the default slot
   * supplies the markup and applies `bindings.input` (ARIA state and part
   * overrides) to whichever element acts as the control.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>

  /**
   * The addon group wrapper element.
   *
   * @tag div
   */
  addonGroup: DomAttrsOf<'div'>
}

/**
 * CSS classes for the VfField component's structural parts.
 */
export interface VfFieldClasses
  extends FieldClasses, AddonGroupClasses, IconsClasses {}

/**
 * Part-keyed binding definitions of the VfField component: the `inputAria`
 * pattern entries it registers via `useBindings`. Zero-argument resolver
 * entries — resolved at each part's consuming site, keys stay static.
 */
export interface VfFieldBindings extends FieldBindings, LayoutRegionBindings {
  /**
   * ARIA state for the input control, from the `inputAria` pattern.
   */
  input: InputAriaBag
}

/**
 * Augmentable public API surface for VfField.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `FieldExpose` for all field-based components) so they
 * appear on `ContextOf<'VfField'>` / `context$` / `defineExpose`.
 */
export interface VfFieldExpose extends FieldExpose {}

/**
 * Public context for VfField, optionally parameterized by concrete props (e.g.
 * `VfFieldContext<VfFieldProps<true, typeof languages>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfFieldContext<
  TProps extends WidenProps<VfFieldProps, FieldProps> = VfFieldProps,
> extends DefineElementContext<
  TProps,
  VfFieldEmits,
  VfFieldSlots,
  VfFieldParts,
  VfFieldClasses,
  VfFieldBindings,
  VfFieldExpose,
  FieldApi<TProps>
> {}

/**
 * Registry entry for VfField. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
export interface VfFieldEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfFieldEmits<
    EntryTranslateOf<TEntry>,
    EntryLanguagesOf<TEntry>,
    EntryNullValueOf<TEntry>
  >,
  VfFieldSlots,
  VfFieldParts,
  VfFieldClasses,
  VfFieldContext<EntryProps<TEntry>>
> {}
