import type { VNode } from 'vue'

import {
  type RadioApi,
  type RadioClasses,
  type RadioEmits,
  type RadioExpose,
  type RadioParts,
  type RadioProps,
  type RadioSlots,
} from '#src/blueprints/radio'
import type {
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  AriaProp,
  ClassValue,
  DomAttrsOf,
  EntryPropOr,
} from '#src/types'

/**
 * VfRadio props narrowed from a registry `TEntry` payload, applying the entry's
 * `radioValue` prop as a generic.
 */
export type EntryProps<TEntry> = VfRadioProps<
  EntryPropOr<TEntry, 'radioValue', true>
>

/**
 * Generic props interface for the VfRadio component, parameterized by the
 * model-driving type argument (e.g. `VfRadioProps<'a'>`). Reach for
 * `VfRadioProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
export interface VfRadioProps<TRadioValue = any> extends RadioProps<
  'radio',
  TRadioValue,
  VfRadioSlots<TRadioValue>,
  VfRadioParts,
  VfRadioClasses,
  VfRadioContext<VfRadioProps<TRadioValue>>
> {}

/**
 * Events emitted by the VfRadio component, parameterized by the model-driving
 * type argument so event handlers (e.g. `@change`) receive the narrowed context
 * — same pattern as `VfRadioSlots`. Plain usage (`VfRadioEmits`) keeps the
 * context wide.
 */
export interface VfRadioEmits<TRadioValue = any> extends RadioEmits<
  VfRadioContext<VfRadioProps<TRadioValue>>
> {}

/**
 * Slots available in the VfRadio component.
 */
export interface VfRadioSlots<TRadioValue = any> extends RadioSlots<
  VfRadioContext<VfRadioProps<TRadioValue>>
> {
  /**
   * Slot that replaces the default radio input rendering. Receives
   * input-specific props.
   */
  default: (props: {
    value: TRadioValue
    model: TRadioValue | null
    aria: AriaProp
    inputName: string
    id: string
    disabled: boolean
    input: any
    text: string | undefined
    handleBlur: (e: FocusEvent) => void
    handleFocus: (e: FocusEvent) => void
    handleModelUpdate: (e: Event) => void
  }) => VNode[]

  /**
   * Slot that replaces the text/label portion of the radio.
   */
  text: (props: {
    text: string | undefined
    id: string
    genericName: string
  }) => VNode[]
}

/**
 * Structural parts of the VfRadio component.
 */
export interface VfRadioParts extends RadioParts {
  /**
   * The wrapper element surrounding the input and text.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The radio input element.
   *
   * @tag input
   */
  input: DomAttrsOf<'input'>

  /**
   * The label/text element.
   *
   * @tag label
   */
  text: DomAttrsOf<'label'>

  /**
   * The screen-reader-only text element.
   *
   * @tag label
   */
  srOnlyText: DomAttrsOf<'label'>
}

/**
 * CSS classes for the VfRadio component's structural parts.
 */
export interface VfRadioClasses extends RadioClasses {
  /**
   * The wrapper element surrounding the input and text.
   */
  wrapper: ClassValue

  /**
   * The radio input element.
   */
  input: ClassValue

  /**
   * The label/text element.
   */
  text: ClassValue
}

/**
 * Augmentable public API surface for VfRadio.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `RadioExpose` for all radio-based components) so they
 * appear on `ContextOf<'VfRadio'>` / `context$` / `defineExpose`.
 */
export interface VfRadioExpose extends RadioExpose {}

/**
 * Public context for VfRadio, optionally parameterized by concrete props (e.g.
 * `VfRadioContext<VfRadioProps<'a'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfRadioContext<
  TProps extends WidenProps<VfRadioProps, RadioProps> = VfRadioProps,
> extends DefineElementContext<
  TProps,
  VfRadioEmits,
  VfRadioSlots,
  VfRadioParts,
  VfRadioClasses,
  VfRadioExpose,
  RadioApi<TProps>
> {}

/**
 * Registry entry for VfRadio. `TEntry` narrows the props / emits / context by
 * the entry's model-driving props, the same way SFC generics do.
 */
export interface VfRadioEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfRadioEmits<EntryPropOr<TEntry, 'radioValue', true>>,
  VfRadioSlots,
  VfRadioParts,
  VfRadioClasses,
  VfRadioContext<EntryProps<TEntry>>
> {}
