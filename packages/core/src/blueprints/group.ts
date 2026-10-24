import { toRef } from 'vue'

import {
  useContainerProvider,
  useFeatures,
  usePager,
  useSchema,
} from '#src/composables'
import { useComponentContext } from '#src/contexts'
import {
  makeElement,
  makeDisabled,
  makeData,
  makeLayout,
  type ModelApi,
  type ModelProps,
  type BaseElementEmits,
  type BaseElementProps,
  type BaseContainerElementParts,
  type BaseElementClasses,
  type BaseElementExpose,
  type BaseElementBindings,
  type BaseElementSlots,
  type TabbedEmits,
  type TabbedProps,
  type ContainerProps,
  type ValidationProps,
  type DisabledProps,
  type StackedProps,
  type LayoutProps,
  type ModelEmits,
  type ObjectModel,
  type ValidationEmits,
} from '#src/features'
import { defineDefaults, type DefineEvents } from '#src/helpers'
import type { FormSchema, LooseRequired } from '#src/types'

/**
 * Props for the group element blueprint.
 */
export interface GroupProps<
  T extends string = 'group',
  S = GroupSlots,
  P = GroupParts,
  C = GroupClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    TabbedProps,
    ContainerProps,
    ValidationProps<TContext>,
    ModelProps<ObjectModel, TContext>,
    DisabledProps<TContext>,
    StackedProps {
  /**
   * The form schema definition for the elements inside the group.
   */
  schema?: FormSchema

  /**
   * Whether the group nests its data under its own key in the form model.
   */
  nested?: boolean

  /**
   * Whether to render the group in a wrapped layout.
   */
  wrap?: boolean

  /**
   * Whether to render the group children in a wrapped layout.
   */
  innerWrap?: boolean
}

/**
 * Events emitted by the group element.
 */
export interface GroupEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<ObjectModel, TContext>,
    ValidationEmits<TContext>,
    TabbedEmits {}

/**
 * Slots for the group element.
 */
export interface GroupSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Parts for the group element.
 */
export interface GroupParts extends BaseContainerElementParts {}

/**
 * Classes for the group element.
 */
export interface GroupClasses extends BaseElementClasses {}

/**
 * Augmentable part-keyed binding definitions (a11y, state markers, and
 * other per-part attrs) of the group blueprint.
 */
export interface GroupBindings extends BaseElementBindings {}

/**
 * Augmentable public API surface for group-based components.
 */
export interface GroupExpose extends BaseElementExpose, GroupApi {}

/**
 * Factory API produced by the group blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g. `GroupApi<EntryProps>` with
 * a schema-narrowed `modelValue`). Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites (Expose / Context layers, extensions).
 */
export type GroupApi<TProps extends GroupProps<string> = GroupProps<string>> =
  ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * Builds the group factory API from resolved props and events. Composes
 * factories for nesting child elements under a shared data key with tab
 * support.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends GroupProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<GroupEmits>
) {
  const context$ = useComponentContext()

  const api = useFeatures(props, events)
    .use(makeElement())
    .use(makeLayout())
    .use(makeDisabled())
    .use(makeData())
    .build()

  const {
    container,
    available,
    visible,
    path,
    id,
    disabled,
    children,
    containerModel,
    dataPath,
  } = api

  /**
   * The resolved child element schema for this group.
   */
  const resolvedSchema = useSchema(toRef(() => props.schema))

  /**
   * Pager instance for tabbed navigation within the group.
   */
  const pager = usePager({
    active: toRef(() => props.tabbed),
    schema: resolvedSchema,
    children,
    onSelect: (newPage, oldPage) =>
      events.fire('tab', newPage, oldPage, pager, context$),
    onBeforeSelect: async (newPage, oldPage) =>
      await events.fireAsync('beforeTab', newPage, oldPage, pager, context$),
  })

  events.on('reset', pager.reset)

  useContainerProvider({
    type: 'group',
    id,
    model: containerModel,
    pager,
    available,
    visible,
    disabled,
    dataPath,
    path,
    children,
    container,
  })

  return {
    ...api,
    pager,
    resolvedSchema,
  }
}

/**
 * Default prop values for the group blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<GroupProps>()({
  type: 'group',
  layout: true,
  submit: true,
  disabled: false,
  wrap: false,
  // Explicit default (matches Vue's absent-boolean casting): groups are flat
  // unless `nested` is set, mirroring the schema walk's `nested !== true`.
  nested: false,
  maxErrors: 1,
  conditions: undefined,
})
