import { computed, toRef } from 'vue'
import {
  useContainerProvider,
  useDynamicProp,
  useFeatures,
  useSecurity,
  useComponentFactory,
} from '~/composables'
import {
  makeElement,
  makeDisabled,
  makeSortable,
  makeRData,
  makeLayout,
  type ModelApi,
  type ModelProps,
  type BaseElementEmits,
  type BaseElementProps,
  type BaseElementParts,
  type BaseElementClasses,
  type BaseElementExpose,
  type BaseElementSlots,
  type ValidationProps,
  type ContainerProps,
  type DisabledProps,
  type LayoutProps,
  type ModelEmits,
  type ArrayModel,
  type ValidationEmits,
} from '~/features'
import { defineDefaults, type DefineEvents } from '~/helpers'
import type { DProp, FormSchema, LooseRequired, TProp } from '~/types'
import { warn } from '~/utils'

/**
 * Props for the list element blueprint.
 */
export interface ListProps<
  T extends string = 'list',
  S = ListSlots,
  P = ListParts,
  C = ListClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ModelProps<ArrayModel, TContext>,
    ValidationProps<TContext>,
    ContainerProps,
    DisabledProps<TContext> {
  /**
   * The form schema definition for each row in the list.
   */
  schema?: FormSchema

  /**
   * The initial number of rows to render.
   */
  initial?: string | number

  /**
   * Whether to flat list values into a single-level array.
   */
  flat?: boolean

  /**
   * Controls when validation is triggered.
   */
  validateOn?: 'change'[]

  /**
   * Whether adding new items is enabled. When `false`, the add button is not
   * rendered.
   */
  add?: boolean

  /**
   * Whether removing items is enabled. When `false`, remove buttons are not
   * rendered.
   */
  remove?: boolean

  /**
   * The minimum number of items the list must contain. When reached, the remove
   * button is hidden.
   */
  min?: number

  /**
   * The maximum number of items the list can contain. When reached, the add
   * button is hidden.
   */
  max?: number

  /**
   * Whether to enable drag-and-drop sorting of list items.
   */
  sort?: boolean

  /**
   * The label text for the "add row" button.
   */
  addLabel?: TProp<string, TContext>

  /**
   * The label text for the "remove row" button.
   */
  removeLabel?: TProp<string, TContext>

  /**
   * The placeholder text displayed when the list has no items.
   */
  placeholder?: TProp<string, TContext>

  /**
   * The icon identifier for the "add row" button.
   */
  addIcon?: DProp<string, TContext>

  /**
   * The icon identifier for the "remove row" button.
   */
  removeIcon?: DProp<string, TContext>

  /**
   * The icon identifier for the sort handle button.
   */
  sortIcon?: DProp<string, TContext>

  /**
   * Whether to render list items in a wrapped layout.
   */
  wrap?: boolean
}

/**
 * Events emitted by the list element.
 */
export interface ListEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<ArrayModel, TContext>,
    ValidationEmits<TContext> {}

/**
 * Slots for the list element.
 */
export interface ListSlots<TContext = any> extends BaseElementSlots<TContext> {}

/**
 * Parts for the list element.
 */
export interface ListParts extends BaseElementParts {}

/**
 * Classes for the list element.
 */
export interface ListClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for list-based components.
 */
export interface ListExpose extends BaseElementExpose, ListApi {}

/**
 * Factory API produced by the list blueprint's `blueprint` function, optionally
 * parameterized by concrete props (e.g. `ListApi<EntryProps>` with a
 * schema-narrowed `modelValue`). Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites (Expose / Context layers, extensions).
 */
export type ListApi<TProps extends ListProps<string> = ListProps<string>> =
  ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * Builds the list factory API from resolved props and events. Composes
 * factories for repeatable rows with add/remove, drag-and-drop sorting, and
 * validation.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends ListProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<ListEmits>
) {
  const initial = toRef(() => Number(props.initial ?? 0))

  const api = useFeatures(props, events, {
    rows: initial,
  })
    .use(makeElement())
    .use(makeLayout())
    .use(makeDisabled())
    .use(makeRData())
    .use(makeSortable())
    .build()

  const {
    container,
    path,
    available,
    visible,
    id,
    disabled,
    children,
    items,
    model,
    dataPath,
    remove,
    add,
  } = api

  /**
   * Checks whether the list has any items.
   *
   * @param value The data to check against the list.
   */
  const filled = (value: any) => Array.isArray(value) && value?.length > 0 // @todo: look at this

  /**
   * The resolved label text for the "add" button.
   */
  const addLabel = useDynamicProp('addLabel', props, {
    localize: true,
  })

  /**
   * The resolved label text for the "remove" button.
   */
  const removeLabel = useDynamicProp('removeLabel', props, {
    localize: true,
  })

  /**
   * The resolved placeholder text displayed when the list is empty.
   */
  const placeholder = useDynamicProp('placeholder', props, {
    localize: true,
  })

  /**
   * The resolved icon identifier for the "add" button.
   */
  const addIcon = useDynamicProp('addIcon', props, {
    icon: true,
  })

  /**
   * The resolved icon identifier for the "remove" button.
   */
  const removeIcon = useDynamicProp('removeIcon', props, {
    icon: true,
  })

  /**
   * The resolved icon identifier for the sort handle button.
   */
  const sortIcon = useDynamicProp('sortIcon', props, {
    icon: true,
  })

  /**
   * Unique DOM id for the placeholder element, used for `aria-describedby` on
   * the add button.
   */
  const placeholderId = computed(() => `${id.value}__placeholder`)

  /**
   * Whether the add button should be rendered. Returns `false` when adding is
   * disabled, the element is disabled, or the maximum item count is reached.
   */
  const canAdd = computed(() => {
    if (disabled.value || props.add === false) return false
    if (props.max !== undefined && items.value.length >= props.max) return false
    return true
  })

  /**
   * Whether remove buttons should be rendered. Returns `false` when removing is
   * disabled, the element is disabled, or the minimum item count is reached.
   */
  const canRemove = computed(() => {
    if (disabled.value || props.remove === false) return false
    if (props.min !== undefined && items.value.length <= props.min) return false
    return true
  })

  /**
   * The resolved schema prototype used to create new list items.
   */
  const { sanitizeProps } = useSecurity()
  const { makeFromSchema } = useComponentFactory()

  const prototype = computed(() => {
    if (!props.schema) return {}

    if (props.flat) {
      const values = Array.isArray(props.schema)
        ? props.schema
        : Object.values(props.schema)

      if (values.length !== 1) {
        warn(
          `\`flat\` requires a single element in the schema at \`${path.value}\``
        )
        return {
          type: 'group',
          nested: true,
          schema: props.schema,
        }
      }

      // The flat prototype is a schema entry verbatim and is spread onto
      // the item component (`v-bind`), so it gets the same attribute-bag
      // filtering as form-level entries in `useSchema`.
      const el = sanitizeProps(values[0] as Record<string, any>)

      if (el.type === 'group') {
        return {
          ...el,
          nested: true,
        }
      }

      return el
    }

    return {
      type: 'group',
      nested: true,
      schema: props.schema,
    }
  })

  /**
   * The Vue component name for the list item prototype.
   */
  const prototypeComponent = computed(() => {
    const proto = prototype.value as Record<string, any>

    if (!proto || !Object.keys(proto).length) {
      return
    }

    // Same resolution as `useSchema`: the shared factory gates an explicit
    // `component` through `$security.allowComponents` and falls back to the
    // `Vf*` element derived from `type`.
    const component = makeFromSchema(proto)

    if (component) return component

    warn(`\`type\` is not defined for prototype at \`${path.value}\``)
    return 'div'
  })

  /**
   * Adds a new item to the list.
   */
  const handleAdd = () => add()

  /**
   * Removes the item at the given index from the list.
   *
   * @param index The index of the item to remove.
   */
  const handleRemove = (index: number) => remove(index)

  useContainerProvider({
    type: 'list',
    id,
    model,
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
    addLabel,
    removeLabel,
    placeholder,
    placeholderId,
    addIcon,
    removeIcon,
    sortIcon,
    canAdd,
    canRemove,
    prototype,
    prototypeComponent,
    handleAdd,
    handleRemove,
    filled,
  }
}

/**
 * Default prop values for the list blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<ListProps>()({
  type: 'list',
  layout: true,
  initial: 1,
  flat: false,
  add: true,
  remove: true,
  sort: false,
  disabled: false,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  addIcon: '$add',
  removeIcon: '$remove',
  sortIcon: '$sort',
})
