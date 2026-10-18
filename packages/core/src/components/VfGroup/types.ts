import type { VNode } from 'vue'

import {
  type GroupA11y,
  type GroupApi,
  type GroupClasses,
  type GroupEmits,
  type GroupExpose,
  type GroupModifiers,
  type GroupParts,
  type GroupProps,
  type GroupSlots,
} from '#src/blueprints/group'
import type { ObjectModel } from '#src/features'
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
} from '#src/types'

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
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
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
   * Slot that replaces the wrapper element. Receives the component's classes
   * and parts proxies and the resolved schema.
   */
  wrapper: (scope: {
    /**
     * The resolved schema of the group's child elements.
     */
    resolvedSchema: ResolvedSchema

    /**
     * The group's resolved label.
     */
    label?: string

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfGroupClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfGroupParts>

    /**
     * The component's part-keyed styling modifiers; apply the `wrapper` bag to
     * the replacement container with `v-bind` so the stacked / wrapped styling
     * keeps working.
     */
    modifiers: VfGroupModifiers
  }) => VNode[]

  /**
   * Slot that replaces the default content. Receives the resolved schema for
   * rendering children.
   */
  default: (scope: {
    /**
     * The resolved schema of the group's child elements.
     */
    resolvedSchema: ResolvedSchema
  }) => VNode[]
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
 * Accessibility bindings of the VfGroup component.
 */
export interface VfGroupA11y extends GroupA11y {}

/**
 * Styling modifiers of the VfGroup component.
 */
export interface VfGroupModifiers extends GroupModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text, and the wrap marker applying the wrapped visual
   * treatment to the group itself.
   */
  root: {
    'data-align-label'?: ''
    'data-wrapped'?: ''
  }

  /**
   * The wrapper element's stacked layout marker and the wrap marker applying
   * the wrapped visual treatment to the group's children.
   */
  wrapper: {
    'data-stacked'?: ''
    'data-wrapped'?: ''
  }
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
  VfGroupModifiers,
  VfGroupA11y,
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
