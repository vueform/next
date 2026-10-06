import type {
  ClassValue,
  AddonsSlots,
  IconsSlots,
  AddonsParts,
  IconsParts,
  AddonGroupParts,
  EntryPropOf,
  WidenProps,
  DefineElementContext,
  DefineRegistryEntry,
  UnwrapEntryRef,
} from '@vueform/core'
import type { TreeSelectProps as PvTreeSelectProps } from 'primevue'
import type { TreeSelectSlots as ATreeSelectSlots } from 'primevue/treeselect'
import type { VNode } from 'vue'

import type {
  TreeSelectApi,
  TreeSelectClasses,
  TreeSelectEmits,
  TreeSelectExpose,
  TreeSelectParts,
  TreeSelectProps,
  TreeSelectSlots,
  forwards,
} from '#primevue/blueprints/tree-select'
import type {
  FloatLabelClasses,
  FloatLabelParts,
  FloatLabelSlots,
  IftaClasses,
  IftaParts,
  IftaSlots,
} from '#primevue/features'
import type { TreeSelectionModeProp } from '#primevue/features/tree-options'
import type {
  ForwardedSlots,
  OverrideSlots,
  TreeOptionsProp,
} from '#primevue/types'

/**
 * Resolves the `TOptions` generic from a registry `TEntry` payload's `options`
 * prop. Missing / invalid values fall back to the unconstrained
 * `TreeOptionsProp`. Literal tree keys are preserved so `TreeSelectModel` can
 * narrow selection-key maps.
 */
export type EntryTreeOptionsOf<TEntry> =
  EntryPropOf<TEntry, 'options'> extends infer I
    ? [I] extends [undefined]
      ? TreeOptionsProp
      : UnwrapEntryRef<I> extends infer U extends TreeOptionsProp
        ? U
        : TreeOptionsProp
    : TreeOptionsProp

/**
 * Resolves the `TSelectionMode` generic from a registry `TEntry` payload's
 * `selectionMode` prop, defaulting to `undefined` when absent or invalid.
 */
export type EntrySelectionModeOf<TEntry> =
  EntryPropOf<TEntry, 'selectionMode'> extends infer M
    ? M extends TreeSelectionModeProp
      ? M
      : undefined
    : undefined

/**
 * VfTreeSelect props narrowed from a registry `TEntry` payload, applying the
 * entry's `options` / `selectionMode` props as generics.
 */
export type EntryProps<TEntry> = VfTreeSelectProps<
  EntryTreeOptionsOf<TEntry>,
  EntrySelectionModeOf<TEntry>
>

/**
 * Generic props interface for the VfTreeSelect component, parameterized by the
 * tree-option / selection-mode type arguments (e.g. `VfTreeSelectProps<typeof
 * options, 'checkbox'>`). Reach for `VfTreeSelectProps` instead when no
 * narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfTreeSelectProps<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends TreeSelectionModeProp = undefined,
  TModel = any,
> extends TreeSelectProps<
  'tree-select',
  TOptions,
  TSelectionMode,
  TModel,
  VfTreeSelectSlots<TOptions, TSelectionMode, TModel>,
  VfTreeSelectParts,
  VfTreeSelectClasses,
  VfTreeSelectContext<VfTreeSelectProps<TOptions, TSelectionMode, TModel>>
> {}

/**
 * Events emitted by the VfTreeSelect component, parameterized by the
 * tree-driving type arguments so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfTreeSelectSlots`. Plain usage
 * (`VfTreeSelectEmits`) keeps the context wide.
 */
export interface VfTreeSelectEmits<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends TreeSelectionModeProp = undefined,
  TModel = any,
> extends TreeSelectEmits<
  VfTreeSelectContext<VfTreeSelectProps<TOptions, TSelectionMode, TModel>>
> {}

/**
 * Slots available in the VfTreeSelect component.
 *
 * Forwarded PrimeVue slot shapes use wide node/model types.
 */
export interface VfTreeSelectSlots<
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends TreeSelectionModeProp = undefined,
  TModel = any,
>
  extends
    TreeSelectSlots<
      VfTreeSelectContext<VfTreeSelectProps<TOptions, TSelectionMode, TModel>>
    >,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ OverrideSlots<
      ForwardedSlots<ATreeSelectSlots, (typeof forwards.slots)[number]>,
      {
        /**
         * Custom selected value display.
         */
        value: (props: {
          /**
           * Selected tree nodes for display.
           */
          value: any

          /**
           * Placeholder prop value.
           */
          placeholder: string
        }) => VNode[]

        /**
         * Custom content for each tree node option.
         */
        option: (props: {
          /**
           * Current tree node.
           */
          node: any

          /**
           * Selection state.
           */
          selected: boolean

          /**
           * Expanded state.
           */
          expanded: boolean
        }) => VNode[]

        /**
         * Custom header template of the overlay panel.
         */
        header: (props: {
          /**
           * Selected keys map of the component.
           */
          value: any

          /**
           * An array of tree nodes.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom footer template of the overlay panel.
         */
        footer: (props: {
          /**
           * Selected keys map of the component.
           */
          value: any

          /**
           * An array of tree nodes.
           */
          options: any[]
        }) => VNode[]

        /**
         * Custom toggle icon for a tree node.
         */
        itemtoggleicon: (props: {
          /**
           * Current tree node.
           */
          node: any

          /**
           * Whether the node is expanded.
           */
          expanded: boolean

          /**
           * Style class of the icon.
           */
          class: string
        }) => VNode[]
      }
    > {}

/**
 * Structural parts of the VfTreeSelect component.
 */
export interface VfTreeSelectParts
  extends
    TreeSelectParts,
    AddonsParts,
    AddonGroupParts,
    IconsParts,
    FloatLabelParts,
    IftaParts {
  /**
   * The tree-select input element.
   *
   * @tag TreeSelect
   */
  input: PvTreeSelectProps
}

/**
 * CSS classes for the VfTreeSelect component's structural parts.
 */
export interface VfTreeSelectClasses
  extends TreeSelectClasses, FloatLabelClasses, IftaClasses {
  /**
   * The tree-select input element.
   */
  input: ClassValue
}

/**
 * Augmentable public API surface for VfTreeSelect.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `TreeSelectExpose` for all tree-select-based components)
 * so they appear on `ContextOf<'VfTreeSelect'>` / `context$` / `defineExpose`.
 */
export interface VfTreeSelectExpose extends TreeSelectExpose {}

/**
 * Public context for VfTreeSelect, optionally parameterized by concrete props
 * (e.g. `VfTreeSelectContext<VfTreeSelectProps<typeof options, 'checkbox'>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfTreeSelectContext<
  TProps extends WidenProps<
    VfTreeSelectProps,
    TreeSelectProps<string, TreeOptionsProp, TreeSelectionModeProp>
  > = VfTreeSelectProps,
> extends DefineElementContext<
  TProps,
  VfTreeSelectEmits,
  VfTreeSelectSlots,
  VfTreeSelectParts,
  VfTreeSelectClasses,
  VfTreeSelectExpose,
  TreeSelectApi<TProps>
> {}

/**
 * Registry entry for VfTreeSelect. `TEntry` narrows the props / emits / context
 * by the entry's tree-driving props, the same way SFC generics do.
 */
export interface VfTreeSelectEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfTreeSelectEmits<EntryTreeOptionsOf<TEntry>, EntrySelectionModeOf<TEntry>>,
  VfTreeSelectSlots,
  VfTreeSelectParts,
  VfTreeSelectClasses,
  VfTreeSelectContext<EntryProps<TEntry>>
> {}
