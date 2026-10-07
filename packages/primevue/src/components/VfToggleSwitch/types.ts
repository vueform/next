import type {
  ClassValue,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  EntryPropOr,
} from '@vueform/core'
import type { ToggleSwitchProps as PvToggleSwitchProps } from 'primevue'
import type { ToggleSwitchSlots as AToggleSwitchSlots } from 'primevue/toggleswitch'
import type { VNode } from 'vue'

import type {
  ToggleSwitchApi,
  ToggleSwitchClasses,
  ToggleSwitchEmits,
  ToggleSwitchExpose,
  ToggleSwitchParts,
  ToggleSwitchProps,
  ToggleSwitchSlots,
  forwards,
} from '#src/blueprints/toggle-switch'
import type { ForwardedSlots } from '#src/types'

/**
 * VfToggleSwitch props narrowed from a registry `TEntry` payload, applying the
 * entry's `trueValue` / `falseValue` props as generics.
 */
export type EntryProps<TEntry> = VfToggleSwitchProps<
  EntryPropOr<TEntry, 'trueValue', true>,
  EntryPropOr<TEntry, 'falseValue', false>
>

/**
 * Generic props interface for the VfToggleSwitch component, parameterized by
 * the model-driving type arguments (e.g. `VfToggleSwitchProps<1, 0>`). Reach
 * for `VfToggleSwitchProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfToggleSwitchProps<
  TTrueValue = true,
  TFalseValue = false,
> extends ToggleSwitchProps<
  'toggle-switch',
  TTrueValue,
  TFalseValue,
  VfToggleSwitchSlots<TTrueValue, TFalseValue>,
  VfToggleSwitchParts,
  VfToggleSwitchClasses,
  VfToggleSwitchContext<VfToggleSwitchProps<TTrueValue, TFalseValue>>
> {}

/**
 * Events emitted by the VfToggleSwitch component, parameterized by the
 * model-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfToggleSwitchSlots`. Plain usage
 * (`VfToggleSwitchEmits`) keeps the context wide.
 */
export interface VfToggleSwitchEmits<
  TTrueValue = true,
  TFalseValue = false,
> extends ToggleSwitchEmits<
  VfToggleSwitchContext<VfToggleSwitchProps<TTrueValue, TFalseValue>>
> {}

/**
 * Slots available in the VfToggleSwitch component.
 */
export interface VfToggleSwitchSlots<TTrueValue = true, TFalseValue = false>
  extends
    ToggleSwitchSlots<
      VfToggleSwitchContext<VfToggleSwitchProps<TTrueValue, TFalseValue>>
    >,
    /* @vue-ignore */ ForwardedSlots<
      AToggleSwitchSlots,
      (typeof forwards.slots)[number]
    > {
  /**
   * Custom handle template.
   *
   * @param props.checked Current checked state of the item as a boolean.
   */
  handle(props: {
    /**
     * Current checked state of the item as a boolean.
     */
    checked: boolean
  }): VNode[]
}

/**
 * Structural parts of the VfToggleSwitch component.
 */
export interface VfToggleSwitchParts extends ToggleSwitchParts {
  /**
   * The toggle switch element.
   *
   * @tag ToggleSwitch
   */
  input: PvToggleSwitchProps
}

/**
 * CSS classes for the VfToggleSwitch component's structural parts.
 */
export interface VfToggleSwitchClasses extends ToggleSwitchClasses {
  /**
   * The toggle switch element.
   */
  input: ClassValue

  /**
   * The switch handle icon element.
   */
  handle: ClassValue
}

/**
 * Augmentable public API surface for VfToggleSwitch.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `ToggleSwitchExpose` for all toggle-switch-based
 * components) so they appear on `ContextOf<'VfToggleSwitch'>` / `context$` /
 * `defineExpose`.
 */
export interface VfToggleSwitchExpose extends ToggleSwitchExpose {}

/**
 * Public context for VfToggleSwitch, optionally parameterized by concrete props
 * (e.g. `VfToggleSwitchContext<VfToggleSwitchProps<1, 0>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfToggleSwitchContext<
  TProps extends WidenProps<VfToggleSwitchProps, ToggleSwitchProps> =
    VfToggleSwitchProps,
> extends DefineElementContext<
  TProps,
  VfToggleSwitchEmits,
  VfToggleSwitchSlots,
  VfToggleSwitchParts,
  VfToggleSwitchClasses,
  VfToggleSwitchExpose,
  ToggleSwitchApi<TProps>
> {}

/**
 * Registry entry for VfToggleSwitch. `TEntry` narrows the props / emits /
 * context by the entry's model-driving props, the same way SFC generics do.
 */
export interface VfToggleSwitchEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfToggleSwitchEmits<
    EntryPropOr<TEntry, 'trueValue', true>,
    EntryPropOr<TEntry, 'falseValue', false>
  >,
  VfToggleSwitchSlots,
  VfToggleSwitchParts,
  VfToggleSwitchClasses,
  VfToggleSwitchContext<EntryProps<TEntry>>
> {}
