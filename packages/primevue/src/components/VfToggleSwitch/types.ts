import type {
  InputAriaA11y,
  ClassValue,
  DomAttrsOf,
  PartBindings,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  EntryPropOr,
} from '@vueform/core'
import type { ToggleSwitchProps as PvToggleSwitchProps } from 'primevue'
import type { ToggleSwitchSlots as AToggleSwitchSlots } from 'primevue/toggleswitch'
import type { VNode } from 'vue'

import type {
  ToggleSwitchA11y,
  ToggleSwitchApi,
  ToggleSwitchClasses,
  ToggleSwitchEmits,
  ToggleSwitchExpose,
  ToggleSwitchModifiers,
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
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
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
   * @param scope The handle slot's params.
   */
  handle(scope: {
    /**
     * Current checked state of the item as a boolean.
     */
    checked: boolean

    /**
     * The handle element's resolved bindings (classes, part overrides); apply
     * with `v-bind`.
     */
    bindings: PartBindings<
      'handle',
      VfToggleSwitchParts,
      VfToggleSwitchModifiers,
      VfToggleSwitchA11y
    >
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

  /**
   * The toggle switch handle element.
   *
   * @tag i
   */
  handle: DomAttrsOf<'i'>
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
 * Accessibility bindings of the VfToggleSwitch component, produced by the
 * `inputAria` pattern the component registers via `useA11y`.
 */
export interface VfToggleSwitchA11y extends ToggleSwitchA11y, InputAriaA11y {}

/**
 * Styling modifiers of the VfToggleSwitch component.
 */
export interface VfToggleSwitchModifiers extends ToggleSwitchModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The toggle-switch control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
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
  VfToggleSwitchModifiers,
  VfToggleSwitchA11y,
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
