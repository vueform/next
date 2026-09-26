import type { ObjectModel } from '#core/features'
import type {
  ClassValue,
  DefineElementContext,
  DefineRegistryEntry,
  DomAttrsOf,
  EntryPropOf,
  IsAny,
  SchemaToModel,
  WidenProps,
  ResolvedSchema,
  EntrySchemaOf,
} from '#core/types'
import type { VNode } from 'vue'
import {
  type GroupApi,
  type GroupClasses,
  type GroupEmits,
  type GroupExpose,
  type GroupParts,
  type GroupProps,
  type GroupSlots,
} from '#core/blueprints/group'

/**
 * Groups carry a model shaped by their child schema regardless of `nested`:
 * nested groups store it under their own key, non-nested groups bind the same
 * shape as a scoped projection of the parent's level (`SchemaToModel` flattens
 * non-nested descendants the same way the runtime projection does). Wide /
 * `any` entries stay permissive (`ObjectModel`).
 */
export type GroupModelOf<TEntry> =
  IsAny<EntryPropOf<TEntry, 'nested'>> extends true
    ? ObjectModel
    : SchemaToModel<EntrySchemaOf<TEntry>>

/**
 * VfGroup props narrowed from a registry `TEntry` payload — `modelValue` is
 * driven by `schema` the same way select models are driven by `items`. Feeds
 * both `defineSchema` validation and the narrowed `VfGroupContext` / `GroupApi`
 * model slice used by `find()`.
 */
export type EntryProps<TEntry> = Omit<VfGroupProps, 'modelValue'> & {
  modelValue?: GroupModelOf<TEntry>
}

/**
 * Props for the VfGroup component.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
export interface VfGroupProps extends GroupProps<
  'group',
  VfGroupSlots,
  VfGroupParts,
  VfGroupClasses,
  VfGroupContext
> {}

/**
 * Events emitted by the VfGroup component.
 */
export interface VfGroupEmits extends GroupEmits<VfGroupContext> {}

/**
 * Slots available in the VfGroup component.
 */
export interface VfGroupSlots extends GroupSlots<VfGroupContext> {
  /**
   * Slot that replaces the wrapper element. Receives the wrapper class and
   * resolved schema.
   */
  wrapper: (props: {
    class: ClassValue
    resolvedSchema: ResolvedSchema
    label?: string
  }) => VNode[]

  /**
   * Slot that replaces the default content. Receives the resolved schema for
   * rendering children.
   */
  default: (props: { resolvedSchema: ResolvedSchema }) => VNode[]
}

/**
 * Structural parts of the VfGroup component.
 */
export interface VfGroupParts extends GroupParts {
  /**
   * The wrapper element containing child elements.
   *
   * @tag div
   */
  wrapper: DomAttrsOf<'div'>
}

/**
 * CSS classes for the VfGroup component's structural parts.
 */
export interface VfGroupClasses extends GroupClasses {
  /**
   * The wrapper element containing child elements.
   */
  wrapper: ClassValue
}

/**
 * Augmentable public API surface for VfGroup.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `GroupExpose` for all group-based components) so they
 * appear on `ContextOf<'VfGroup'>` / `context$` / `defineExpose`.
 */
export interface VfGroupExpose extends GroupExpose {}

/**
 * Public context for VfGroup, optionally parameterized by concrete props (e.g.
 * schema-narrowed `EntryProps` with a typed `modelValue`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
export interface VfGroupContext<
  TProps extends WidenProps<VfGroupProps, GroupProps<string>> = VfGroupProps,
> extends DefineElementContext<
  TProps,
  VfGroupEmits,
  VfGroupSlots,
  VfGroupParts,
  VfGroupClasses,
  VfGroupExpose,
  GroupApi<TProps>
> {}

/**
 * Registry entry for VfGroup. `TEntry` narrows `modelValue` from the entry's
 * `schema` prop so `defineSchema` constrains group models to their child schema
 * shape (nested and non-nested alike) and types `find()`'s returned `model` the
 * same way.
 */
export interface VfGroupEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfGroupEmits,
  VfGroupSlots,
  VfGroupParts,
  VfGroupClasses,
  VfGroupContext<EntryProps<TEntry>>
> {}
