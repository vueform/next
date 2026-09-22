import {
  type Component,
  computed,
  onMounted,
  toRef,
  watch,
  type Ref,
} from 'vue'
import {
  useConfig,
  useContainerProvider,
  useDynamicProp,
  useFeatures,
  useItemsSource,
  useConditionalList,
  useSecurity,
  useComponentFactory,
} from '~/composables'
import { useComponentContext } from '~/contexts'
import {
  makeElement,
  makeDisabled,
  makeSortable,
  makeRData,
  makeLayout,
  type DisabledProps,
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
  type LayoutProps,
  type ModelEmits,
  type ObjectModel,
  type ValidationEmits,
  type ItemsProp,
} from '~/features'
import { defineDefaults, type DefineEvents } from '~/helpers'
import {
  type ConditionalProp,
  type ConditionsTriggerProp,
} from '~/modules/conditions'
import type { RulesProp } from '~/modules/validation'
import type {
  TProp,
  MakeOptional,
  LooseRequired,
  ElementName,
  DProp,
} from '~/types'
import {
  alwaysTrue as alwaysAvailable,
  equals,
  isPlainObject,
  kebabToPascal,
  typedEntries,
} from '~/utils'

/**
 * A matrix column normalized from any accepted source format, with its value,
 * label, extracted metadata, and the original raw item.
 */
type NormalizedMatrixCol = {
  /**
   * The column's value used as the key in the row's data model.
   */
  value: string | number

  /**
   * The display label for this column header.
   */
  label: string | number | undefined

  /**
   * Conditional visibility rules for this column.
   */
  conditions: ConditionalProp | undefined

  /**
   * Schema definition for a custom element rendered in this column's cells.
   */
  schema: MatrixElement | undefined

  /**
   * Minimum width constraint for this column.
   */
  minWidth: string | number | undefined

  /**
   * Maximum width constraint for this column.
   */
  maxWidth: string | number | undefined

  /**
   * The original raw item the column was normalized from.
   */
  $raw: Record<string, any>
}

/**
 * A matrix row normalized from any accepted source format, with its value,
 * label, extracted metadata, and the original raw item.
 */
type NormalizedMatrixRow = {
  /**
   * The row's value used as the key in the matrix data model.
   */
  value: string | number

  /**
   * The display label for this row header.
   */
  label: string | number | undefined

  /**
   * Conditional visibility rules for this row.
   */
  conditions: ConditionalProp | undefined

  /**
   * Validation rules applied to this row.
   */
  rules: RulesProp | undefined

  /**
   * The original raw item the row was normalized from.
   */
  $raw: Record<string, any>
}

export type MatrixModes = 'single' | 'multiple' | 'auto'

/**
 * Props for the matrix element blueprint.
 */
export interface MatrixProps<
  T extends string = 'matrix',
  S = MatrixSlots,
  P = MatrixParts,
  C = MatrixClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ModelProps<ObjectModel, TContext>,
    ValidationProps<TContext>,
    ContainerProps,
    DisabledProps<TContext> {
  /**
   * The selection mode for the matrix.
   */
  mode?: MatrixModes | (string & {})

  /**
   * Whether the matrix uses a tabular visual style with borders and headers.
   */
  tabular?: boolean

  /**
   * Whether to enable drag-and-drop sorting of matrix rows.
   */
  sort?: boolean

  /**
   * Whether the matrix is horizontally scrollable on overflow.
   */
  scrollable?: boolean

  /**
   * Whether column headers stick to the left when scrolling.
   */
  stickyCols?: boolean

  /**
   * Whether row headers stick to the top when scrolling.
   */
  stickyRows?: boolean

  /**
   * Whether column header text can wrap.
   */
  wrapColHeaders?: boolean

  /**
   * Whether row header text can wrap.
   */
  wrapRowHeaders?: boolean

  /**
   * The label text for the "add row" button.
   */
  addLabel?: TProp<string, TContext>

  /**
   * The label text for the "remove row" button.
   */
  removeLabel?: TProp<string, TContext>

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
   * Whether to display column headers.
   */
  colHeaders?: boolean

  /**
   * Whether to display row headers.
   */
  rowHeaders?: boolean

  /**
   * The minimum width of each matrix column.
   */
  minWidth?: number | string

  /**
   * The maximum width of each matrix column.
   */
  maxWidth?: number | string

  /**
   * The minimum number of rows allowed.
   */
  min?: number

  /**
   * The maximum number of rows allowed.
   */
  max?: number

  /**
   * CSS `grid-template-columns` value or a function returning it.
   */
  gridTemplateColumns?: string | ((context$: any) => any)

  /**
   * Whether adding new rows is enabled. When `false`, the add button is not
   * rendered.
   */
  add?: boolean

  /**
   * Whether removing rows is enabled. When `false`, remove buttons are not
   * rendered.
   */
  remove?: boolean

  /**
   * Custom HTTP headers to include when loading cols or rows from an endpoint.
   */
  headers?: Record<string, string>

  /**
   * The HTTP method to use when loading cols or rows from an endpoint. Defaults
   * to `'GET'`.
   */
  method?: string

  /**
   * The column definitions for the matrix grid. Accepts a plain array, a plain
   * object, an array of objects (customizable via `colValue`, `colLabel`, and
   * related props), an endpoint URL string (supporting expressions), or a
   * (possibly async) function receiving the component context.
   */
  cols?: MatrixCols

  /**
   * The row definitions or a fixed number of rows for the matrix grid. Accepts
   * a plain array, a plain object, an array of objects (customizable via
   * `rowValue`, `rowLabel`, and related props), an endpoint URL string
   * (supporting expressions), or a (possibly async) function receiving the
   * component context.
   */
  rows?: MatrixRows | number

  /**
   * The key or function that resolves each column's value (the key used in the
   * matrix data object) when `cols` is an array of objects. Defaults to
   * `'value'`. Set to `null` to use the full column object as the value.
   */
  colValue?: string | ((col: any) => any) | null

  /**
   * The key or function that resolves each column's header label when `cols` is
   * an array of objects. Defaults to `'label'`.
   */
  colLabel?: string | ((col: any) => string | number | undefined)

  /**
   * The key or function that resolves each column's conditions when `cols` is
   * an array of objects. Defaults to `'conditions'`.
   */
  colConditions?: string | ((col: any) => ConditionalProp<TContext> | undefined)

  /**
   * The key or function that resolves each column's custom element schema when
   * `cols` is an array of objects. Defaults to `'schema'`.
   */
  colSchema?: string | ((col: any) => MatrixElement | undefined)

  /**
   * The key or function that resolves each column's minimum width when `cols`
   * is an array of objects. Defaults to `'minWidth'`.
   */
  colMinWidth?: string | ((col: any) => string | number | undefined)

  /**
   * The key or function that resolves each column's maximum width when `cols`
   * is an array of objects. Defaults to `'maxWidth'`.
   */
  colMaxWidth?: string | ((col: any) => string | number | undefined)

  /**
   * The key or function that resolves each row's value (the key used in the
   * matrix data object) when `rows` is an array of objects. Defaults to
   * `'value'`.
   */
  rowValue?: string | ((row: any) => string | number)

  /**
   * The key or function that resolves each row's header label when `rows` is an
   * array of objects. Defaults to `'label'`.
   */
  rowLabel?: string | ((row: any) => string | number | undefined)

  /**
   * The key or function that resolves each row's conditions when `rows` is an
   * array of objects. Defaults to `'conditions'`.
   */
  rowConditions?: string | ((row: any) => ConditionalProp | undefined)

  /**
   * The key or function that resolves each row's validation rules when `rows`
   * is an array of objects. Defaults to `'rules'`.
   */
  rowRules?: string | ((row: any) => RulesProp | undefined)

  /**
   * The source that triggers re-resolution of function-based `cols`. Accepts an
   * array of element paths whose values are watched, a `Ref`, or a function
   * used as a watch getter. When omitted, function-based cols are only
   * re-resolved when the `cols` prop reference itself changes.
   */
  colsTrigger?: ConditionsTriggerProp

  /**
   * The debounce delay in milliseconds applied before re-resolving `cols` when
   * an expression path or the `colsTrigger` source changes. Defaults to no
   * debounce (immediate re-resolution).
   */
  colsDebounce?: number

  /**
   * Transforms data received from a `cols` endpoint or function into the cols
   * format before normalization.
   */
  transformCols?: (data: any) => any[] | Record<string, any>

  /**
   * The source that triggers re-resolution of function-based `rows`. Accepts an
   * array of element paths whose values are watched, a `Ref`, or a function
   * used as a watch getter. When omitted, function-based rows are only
   * re-resolved when the `rows` prop reference itself changes.
   */
  rowsTrigger?: ConditionsTriggerProp

  /**
   * The debounce delay in milliseconds applied before re-resolving `rows` when
   * an expression path or the `rowsTrigger` source changes. Defaults to no
   * debounce (immediate re-resolution).
   */
  rowsDebounce?: number

  /**
   * Transforms data received from a `rows` endpoint or function into the rows
   * format before normalization.
   */
  transformRows?: (data: any) => any[] | Record<string, any>

  /**
   * An endpoint URL (supporting expressions) that loads both the column and row
   * definitions from a single request. Each side can still be overridden by
   * defining `cols` or `rows` explicitly.
   */
  endpoint?: string

  /**
   * The key or function that resolves the column definitions from the
   * `endpoint` response. Defaults to `'cols'`.
   */
  colsKey?: string | ((data: any) => any)

  /**
   * The key or function that resolves the row definitions from the `endpoint`
   * response. Defaults to `'rows'`.
   */
  rowsKey?: string | ((data: any) => any)

  /**
   * Transforms data received from the `endpoint` before the column and row
   * definitions are extracted.
   */
  transformEndpoint?: (data: any) => any[] | Record<string, any>
}

/**
 * Events emitted by the matrix element.
 */
export interface MatrixEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<ObjectModel, TContext>,
    ValidationEmits<TContext> {}

/**
 * Slots for the matrix element.
 */
export interface MatrixSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Parts for the matrix element.
 */
export interface MatrixParts extends BaseElementParts {}

/**
 * Union of all input types supported in matrix cells.
 */
// export type MatrixInput = Exclude<
//   ControlRegistry[keyof ControlRegistry]['schema']['type'],
//   undefined
// >

/**
 * Classes for the matrix element.
 */
export interface MatrixClasses extends BaseElementClasses {}

/**
 * Schema definition for a matrix cell element, requiring a type property.
 */
// export type MatrixElementSchema = MakeRequired<
//   Extract<
//     ControlRegistry[keyof ControlRegistry]['schema'],
//     { type?: MatrixInput }
//   >,
//   'type'
// >

/**
 * Augmentable public API surface for matrix-based components.
 */
export interface MatrixExpose extends BaseElementExpose, MatrixApi {}

/**
 * A matrix element definition with an optional name property.
 */
export type MatrixElement = MakeOptional<MatrixElementSchema, 'name'>

// @temp
export type MatrixInput = any

// @temp
export type MatrixElementSchema = any

/**
 * Column definitions for the matrix: a record, an array of primitives (used as
 * both value and label), an array of column config objects (with keys
 * customizable via `colValue`, `colLabel`, and related props), an endpoint URL
 * string, or a (possibly async) function receiving the component context.
 */
export type MatrixCols =
  | string
  | readonly string[]
  | Record<string, string | number>
  | readonly Record<string, any>[]
  | ((context$: any) => any)

/**
 * Row definitions for the matrix: a record, an array of primitives (used as
 * both value and label), an array of row config objects (with keys customizable
 * via `rowValue`, `rowLabel`, and related props), an endpoint URL string, or a
 * (possibly async) function receiving the component context.
 */
export type MatrixRows =
  | string
  | readonly string[]
  | Record<string, string | number>
  | readonly Record<string, any>[]
  | ((context$: any) => any)

/**
 * A fully resolved matrix row with its component, props, column mappings, and
 * removal handler.
 */
export type ResolvedMatrixRow = {
  /**
   * The Vue component name for this row (e.g. VfRadios, VfCheckboxes, VfGroup).
   */
  component: string

  /**
   * The resolved props passed to the row component.
   */
  props: {
    /**
     * The row's element name used to register it in the matrix data model.
     */
    name: ElementName

    /**
     * The display label for this row.
     */
    label: string

    /**
     * Conditional visibility rules for this row.
     */
    conditions: ConditionalProp | undefined

    /**
     * Validation rules applied to this row.
     */
    rules: RulesProp | undefined

    /**
     * Set to `false` to render the row's children without any layout wrapper.
     */
    layout: false

    /**
     * Whether the row nests its data under the row key in the matrix model.
     */
    nested: boolean | undefined
  }

  /**
   * The resolved columns belonging to this row.
   */
  cols: ResolvedMatrixCol[]

  /**
   * The slot name for rendering custom row content.
   */
  slot: string

  /**
   * The unique DOM id for this row, used for ARIA references.
   */
  id: string

  /**
   * The stable `v-for` key for this row: a per-item id for dynamic matrices or
   * the named row value for static ones. Stays constant across reorders so the
   * row's component instance (and its state) follows its data.
   */
  key: string

  /**
   * The row's current data index (canonical position in the matrix model). Used
   * for drag identity and child data binding.
   */
  dataIndex: number

  /**
   * Reactive boolean indicating whether the row is currently visible.
   */
  available: Ref<boolean>

  /**
   * Removes this row from the matrix.
   */
  remove: () => void
}

/**
 * A fully resolved matrix column with its component, value, label, and width
 * constraints.
 */
export type ResolvedMatrixCol = {
  /**
   * The resolved component for this column's input: an explicit `component`
   * allowed by `$security.allowComponents`, or the `Vf*` name derived from
   * `type` (e.g. VfRadio, VfCheckbox, VfText).
   */
  component: string | Component

  /**
   * The element schema props passed to the column component.
   */
  props: MatrixElementSchema

  /**
   * The column's value used as the key in the row's data model.
   */
  value: string | number

  /**
   * The display label for this column header.
   */
  label: string

  /**
   * Conditional visibility rules for this column.
   */
  conditions: ConditionalProp | undefined

  /**
   * Reactive boolean indicating whether the column is currently visible.
   */
  available: Ref<boolean>

  /**
   * Minimum width constraint for this column.
   */
  minWidth: string | number | undefined

  /**
   * Maximum width constraint for this column.
   */
  maxWidth: string | number | undefined

  /**
   * The unique DOM id for this column, used for ARIA references.
   */
  id: string
}

/**
 * Factory API produced by the matrix blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g. `MatrixApi<EntryProps>` with
 * a rows/cols/mode-narrowed `modelValue`). Prefer this over `ReturnType<typeof
 * blueprint<TProps>>` at consumer sites (Expose / Context layers, extensions).
 */
export type MatrixApi<
  TProps extends MatrixProps<string> = MatrixProps<string>,
> = ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * Extracts only the `required` rule from a rules definition. Other rules (like
 * `min`, `max`) apply to the matrix itself (e.g. row count) and should not be
 * forwarded to individual rows.
 */
function extractRowRules(rules: RulesProp | undefined): RulesProp | undefined {
  if (!rules) return undefined

  if (typeof rules === 'string') {
    const parts = rules.split('|')
    const required = parts.find((p) => p === 'required')
    return required || undefined
  }

  if (Array.isArray(rules)) {
    const filtered = rules.filter((r) => {
      if (typeof r === 'string') return r === 'required'
      if (isPlainObject(r)) {
        return Object.keys(r as object).some((k) => k.startsWith('required'))
      }
      return false
    })
    return filtered.length > 0 ? (filtered as RulesProp) : undefined
  }

  return undefined
}

/**
 * Resolves a property from a raw item using a string key lookup or a mapping
 * function.
 *
 * @param raw The raw item object.
 * @param resolver The string key or mapping function.
 */
export function resolveItemProp(
  raw: Record<string, any>,
  resolver: string | ((item: any) => any)
) {
  return typeof resolver === 'function' ? resolver(raw) : raw?.[resolver]
}

/**
 * Normalizes a raw cols/rows source (array of primitives, array of objects, or
 * plain object map) into `{ value, label, $raw }` entries. Primitives and
 * object map entries produce synthetic raw objects and ignore the key/label
 * resolvers.
 *
 * @param source The resolved raw cols/rows data.
 * @param key The string key or mapping function resolving each item's value.
 * @param label The string key or mapping function resolving each item's label.
 */
export function normalizeSourceItems(
  source: any[] | Record<string, any>,
  key: string | ((item: any) => any) | null | undefined,
  label: string | ((item: any) => any)
): { value: any; label: any; $raw: Record<string, any> }[] {
  if (Array.isArray(source)) {
    return source.map((item) => {
      if (!isPlainObject(item)) {
        return { value: item, label: item, $raw: { value: item, label: item } }
      }

      return {
        value: key ? resolveItemProp(item, key) : item,
        label: resolveItemProp(item, label),
        $raw: item,
      }
    })
  }

  if (isPlainObject(source)) {
    return typedEntries(source).map(([value, label]) => ({
      value,
      label,
      $raw: { value, label },
    }))
  }

  return []
}

/**
 * Builds the matrix factory API from resolved props and events. Composes
 * factories for row/column grid input with headers, dynamic rows, and cell
 * validation.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 *
 * @param props Resolved component props.
 * @param events Event emitter created by `defineEvents`.
 */
export function blueprint<TProps extends MatrixProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<MatrixEmits>
) {
  const context$ = useComponentContext()
  const config = useConfig()
  const $security = useSecurity()
  const { makeFromSchema } = useComponentFactory()

  /**
   * The raw cols source resolution: handles plain data, endpoint URLs, and
   * (async) functions.
   */
  const colsSource = useItemsSource({
    props: {
      get items() {
        return props.cols as ItemsProp | undefined
      },
      get itemsTrigger() {
        return props.colsTrigger
      },
      get itemsDebounce() {
        return props.colsDebounce
      },
      get transformItems() {
        return props.transformCols
      },
      get headers() {
        return props.headers
      },
      get method() {
        return props.method
      },
    },
    key: 'cols',
  })

  /**
   * The raw rows source resolution: handles plain data, endpoint URLs, and
   * (async) functions. Numeric rows (dynamic matrices) bypass resolution.
   */
  const rowsSource = useItemsSource({
    props: {
      get items() {
        return typeof props.rows === 'number'
          ? undefined
          : (props.rows as ItemsProp | undefined)
      },
      get itemsTrigger() {
        return props.rowsTrigger
      },
      get itemsDebounce() {
        return props.rowsDebounce
      },
      get transformItems() {
        return props.transformRows
      },
      get headers() {
        return props.headers
      },
      get method() {
        return props.method
      },
    },
    key: 'rows',
  })

  /**
   * The shared endpoint source resolution that loads both the column and row
   * definitions from a single request.
   */
  const endpointSource = useItemsSource({
    props: {
      get items() {
        return props.endpoint
      },
      get transformItems() {
        return props.transformEndpoint
      },
      get headers() {
        return props.headers
      },
      get method() {
        return props.method
      },
    },
    key: 'endpoint',
  })

  /**
   * The raw cols data: from the `cols` prop source, falling back to the shared
   * `endpoint` response when `cols` is not defined.
   */
  const colsData = computed(() =>
    props.cols === undefined && props.endpoint
      ? (resolveItemProp(
          endpointSource.resolvedItems.value,
          props.colsKey ?? 'cols'
        ) ?? [])
      : colsSource.resolvedItems.value
  )

  /**
   * The raw rows data: from the `rows` prop source, falling back to the shared
   * `endpoint` response when `rows` is not defined.
   */
  const rowsData = computed(() =>
    props.rows === undefined && props.endpoint
      ? (resolveItemProp(
          endpointSource.resolvedItems.value,
          props.rowsKey ?? 'rows'
        ) ?? [])
      : rowsSource.resolvedItems.value
  )

  /**
   * The matrix rows normalized from any accepted source format, with extracted
   * labels, conditions, and rules.
   */
  const normalizedRows = computed<NormalizedMatrixRow[]>(() =>
    normalizeSourceItems(
      rowsData.value,
      props.rowValue ?? 'value',
      props.rowLabel ?? 'label'
    ).map(({ value, label, $raw }) => ({
      value,
      label,
      conditions: resolveItemProp($raw, props.rowConditions ?? 'conditions'),
      rules: resolveItemProp($raw, props.rowRules ?? 'rules'),
      $raw,
    }))
  )

  const rows = toRef(() =>
    typeof props.rows === 'number'
      ? props.rows
      : props.rows || props.endpoint
        ? normalizedRows.value
        : 1
  )

  const mode = toRef(() =>
    props.mode === 'single'
      ? 'single'
      : props.mode === 'multiple'
        ? 'multiple'
        : 'auto'
  )

  const dynamic = toRef(
    () =>
      (props.rows === undefined && !props.endpoint) ||
      typeof props.rows === 'number'
  )

  const nullValue = toRef(() =>
    dynamic.value
      ? [...Array(rows.value || 1).keys()].map(() =>
          mode.value === 'single' ? null : mode.value === 'multiple' ? [] : {}
        )
      : {}
  )

  const api = useFeatures(props, events, {
    nullValue,
    rows,
  })
    .use(makeElement())
    .use(makeLayout())
    .use(makeDisabled())
    .use(makeRData())
    .use(makeSortable())
    .build()

  const {
    container,
    available,
    visible,
    path,
    disabled,
    id,
    children,
    items,
    model,
    dataPath,
    canSort,
    remove,
    add,
    clear,
  } = api

  /**
   * Checks whether the matrix value is considered filled. Dynamic matrices must
   * have at least one row. Each row must then be filled according to its mode.
   *
   * @param value The data to check against the matrix.
   */
  const filled = (value: any) => {
    if (dynamic.value && (!Array.isArray(value) || value.length === 0)) {
      return false
    }

    return children.availableStatefulChildren$.value.every(({ filled, name }) =>
      filled(value?.[name])
    )
  }

  // ================ COLS ================

  /**
   * The matrix columns normalized from any accepted source format, with
   * extracted labels, conditions, schemas, and width constraints.
   */
  const normalizedCols = computed<NormalizedMatrixCol[]>(() =>
    normalizeSourceItems(
      colsData.value,
      props.colValue,
      props.colLabel ?? 'label'
    ).map(({ value, label, $raw }) => ({
      value,
      label,
      conditions: resolveItemProp($raw, props.colConditions ?? 'conditions'),
      schema: resolveItemProp($raw, props.colSchema ?? 'schema'),
      minWidth: resolveItemProp($raw, props.colMinWidth ?? 'minWidth'),
      maxWidth: resolveItemProp($raw, props.colMaxWidth ?? 'maxWidth'),
      $raw,
    }))
  )

  /**
   * Shared conditions options forwarded to the col / row conditional lists.
   */
  const conditionsOptions = {
    trigger: toRef(() => props.conditionsTrigger),
    debounce: toRef(() => props.conditionsDebounce),
  }

  const colAvailabilities = useConditionalList(
    normalizedCols,
    (col) => col.conditions,
    conditionsOptions
  )

  const rowAvailabilities = useConditionalList(
    normalizedRows,
    (row) => row.conditions,
    conditionsOptions
  )

  /**
   * The fully resolved matrix columns with component info, labels, conditions,
   * and width constraints.
   */
  const resolvedCols = computed<ResolvedMatrixCol[]>(() =>
    normalizedCols.value.map((col, i) => {
      const single = config.matrixTypes.single[0]
      const multiple = config.matrixTypes.multiple[0]

      const type =
        col.schema?.type ||
        config.matrixTypes[mode.value]?.[0] ||
        config.matrixTypes.auto?.[0]

      const colName = isPlainObject(col.value) ? i : col.value

      return {
        component: makeFromSchema(col.schema as Record<string, any>, type)!,
        props: {
          name: colName,
          conditions: col.conditions,
          disabled: disabled,
          layout: false,
          // Column schemas come from the `cols` prop (schema data) and this
          // object is spread onto the cell element — filter like every other
          // schema-reachable attribute bag.
          ...(col.schema ? $security.sanitizeProps(col.schema) : {}),
          ...(type === single ? { radioValue: col.value } : {}),
          ...(type === multiple ? { trueValue: col.value } : {}),
        } as MatrixElementSchema,
        value: col.value,
        label: String(col.label ?? Number(col.value) + 1),
        conditions: col.conditions,
        available: colAvailabilities.value[i] ?? alwaysAvailable,
        id: `${id.value}_col-${i}`,
        minWidth: resolveWidth(col.minWidth, minWidth.value),
        maxWidth: resolveWidth(col.maxWidth, maxWidth.value),
      }
    })
  )

  /**
   * The fully resolved matrix rows with component info, props, column mappings,
   * and slot assignments.
   */
  const resolvedRows = computed<ResolvedMatrixRow[]>(() => {
    return items.value.map((value, displayIndex) => {
      // Dynamic matrices iterate `{ id, index }` entries (so row instances
      // follow their data across reorders). Static matrices iterate their
      // named-row definitions directly.
      const dataIndex = dynamic.value
        ? (value as { index: number }).index
        : displayIndex

      const row = dynamic.value
        ? ({ value: dataIndex } as Partial<NormalizedMatrixRow> & {
            value: string | number
          })
        : (value as NormalizedMatrixRow)

      // Stable `v-for` key: the per-item id for dynamic matrices, the named
      // row value for static ones. Never the data index, which shifts on sort.
      const key = dynamic.value
        ? (value as { id: string }).id
        : String(row.value)

      const label = String(row.label || displayIndex + 1)
      const rowId = `${id.value}_row-${key}`

      const type =
        config.matrixTypes[mode.value]?.[1] || config.matrixTypes.auto?.[1]

      return {
        component: `Vf${kebabToPascal(type)}`,
        props: {
          name: row.value,
          label,
          conditions: row.conditions,
          rules: row.rules ?? extractRowRules(props.rules),
          layout: false,
          hoist: true,
          nested: mode.value === 'auto',
        },
        cols: resolvedCols.value
          .filter((col) => col.available.value)
          .map((col) => {
            return {
              ...col,
              props: {
                ...col.props,
                parts: {
                  ...col.props.parts,
                  input: {
                    ...(col.props.parts as any)?.input,
                    'aria-labelledby': `${rowId} ${col.id}`,
                  },
                } as any,
                displayName: `${label} / ${col.label}`,
              },
            }
          }),
        id: rowId,
        key,
        dataIndex,
        slot: mode.value === 'auto' ? 'wrapper' : 'default',
        available: dynamic.value
          ? alwaysAvailable
          : (rowAvailabilities.value[displayIndex] ?? alwaysAvailable),
        remove: () => remove(dataIndex),
      }
    })
  })

  /**
   * The column headers array, including optional row header and remove button
   * placeholders.
   */
  const headers = computed<ResolvedMatrixCol[]>(() => [
    ...(canSort.value ? [{} as ResolvedMatrixCol] : []),
    ...(showRowHeaders.value ? [{} as ResolvedMatrixCol] : []),
    ...resolvedCols.value,
    ...(canRemove.value ? [{} as ResolvedMatrixCol] : []),
  ])

  /**
   * The resolved label text for the add row button.
   */
  const addLabel = useDynamicProp('addLabel', props, {
    localize: true,
  })

  /**
   * The resolved label text for the remove row button.
   */
  const removeLabel = useDynamicProp('removeLabel', props, {
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
   * Whether the add row button should be displayed, based on dynamic mode,
   * disabled state, and max limit.
   */
  const canAdd = computed(
    () =>
      props.add !== false &&
      dynamic.value &&
      !disabled.value &&
      (props.max === undefined ||
        props.max === -1 ||
        Number(props.max) > items.value.length)
  )

  /**
   * Whether the remove row button should be displayed, based on dynamic mode,
   * disabled state, and min limit.
   */
  const canRemove = computed(
    () =>
      props.remove !== false &&
      dynamic.value &&
      !disabled.value &&
      (props.min === undefined ||
        props.min === -1 ||
        Number(props.min) < items.value.length)
  )

  const minWidth = computed(() => resolveWidth(props.minWidth, 'min-content'))
  const maxWidth = computed(() => resolveWidth(props.maxWidth, '1fr'))

  /**
   * Whether row headers should be displayed.
   */
  const showRowHeaders = computed(
    () => !dynamic.value && props.rowHeaders !== false
  )

  /**
   * Whether column headers should be displayed.
   */
  const showColHeaders = computed(() => props.colHeaders !== false)

  /**
   * Unique security nonce for injecting scoped styles.
   */
  const nonce = toRef(() => config.nonce)

  /**
   * A unique CSS class scoped to this matrix instance, used to target the
   * injected grid style rule.
   */
  const gridClass = computed(() => `vf-grid-${id.value}`)

  /**
   * The computed `grid-template-columns` value based on visible columns, row
   * headers, and remove button state.
   */
  const gridColumns = computed(() => {
    if (typeof props.gridTemplateColumns === 'function') {
      return $security.sanitizeCss(props.gridTemplateColumns(context$)) ?? ''
    }

    if (props.gridTemplateColumns) {
      return $security.sanitizeCss(props.gridTemplateColumns) ?? ''
    }

    const parts = [
      ...(canSort.value ? ['max-content'] : []),
      ...(showRowHeaders.value ? ['minmax(min-content, auto)'] : []),
    ]

    if (!resolvedCols.value.length) {
      parts.push('minmax(min-content, 1fr)')
    } else {
      parts.push(
        ...resolvedCols.value
          .filter(({ available }) => available.value)
          .map(
            ({ minWidth, maxWidth }) =>
              `minmax(${$security.sanitizeCss(minWidth) ?? 'min-content'}, ${$security.sanitizeCss(maxWidth) ?? 'auto'})`
          )
      )
    }

    parts.push(...(canRemove.value ? ['max-content'] : []))

    return parts.join(' ')
  })

  const resolveWidth = (
    width: number | string | undefined,
    def: number | string
  ) =>
    typeof width === 'number' ? `${width}px` : width !== undefined ? width : def

  /**
   * Event handler that adds a new row to the matrix.
   */
  const handleAdd = () => add()

  /**
   * Event handler that removes a row at the given index from the matrix.
   *
   * @param index The index of the row to remove.
   */
  const handleRemove = (index: number) => remove(index)

  useContainerProvider({
    type: 'matrix',
    id,
    model,
    available,
    visible,
    disabled,
    dataPath,
    path,
    container,
    children,
  })

  watch(mode, async () => {
    if (!dynamic.value) return
    const items = model.value.length
    clear()
    add(items)
  })

  /**
   * The set of currently available col values. Used by the watcher below to
   * detect when a col becomes unavailable due to conditions and clear its value
   * from every row.
   */
  const availableColValues = computed(() =>
    normalizedCols.value
      .filter((_, i) => colAvailabilities.value[i]?.value !== false)
      .map((c) => c.value)
  )

  watch(
    availableColValues,
    (current) => {
      if (mode.value === 'auto') return

      const isColFiltered = (colVal: any) =>
        normalizedCols.value.some((c) => equals(c.value, colVal)) &&
        !current.some((v) => equals(v, colVal))

      for (const child of children.statefulChildren$.value) {
        if (mode.value === 'single') {
          if (isColFiltered(child.model)) {
            child.update(null)
          }
        } else {
          if (Array.isArray(child.model)) {
            const filtered = child.model.filter((v: any) => !isColFiltered(v))
            if (filtered.length !== child.model.length) {
              child.update(filtered)
            }
          }
        }
      }
    },
    { flush: 'sync' }
  )

  /**
   * The set of currently available row values. Used by the watcher below to
   * detect when a row becomes unavailable due to conditions and remove its key
   * from the model entirely.
   */
  const availableRowValues = computed(() =>
    normalizedRows.value
      .filter((_, i) => rowAvailabilities.value[i]?.value !== false)
      .map((r) => r.value)
  )

  watch(
    availableRowValues,
    (current) => {
      if (dynamic.value) return

      for (const row of normalizedRows.value) {
        const isAvailable = current.some((v) => equals(v, row.value))

        if (!isAvailable) {
          if (model.value && row.value in model.value) {
            delete model.value[row.value]
          }
        } else if (model.value && !(row.value in model.value)) {
          const child = children.statefulChildren$.value.find(
            (c: any) => String(c.name) === String(row.value)
          )
          if (child) {
            child.clear()
          }
        }
      }
    },
    { flush: 'sync' }
  )

  onMounted(() => {
    if (dynamic.value) return

    const current = availableRowValues.value
    for (const row of normalizedRows.value) {
      if (!current.some((v) => equals(v, row.value))) {
        if (model.value && row.value in model.value) {
          delete model.value[row.value]
        }
      }
    }
  })

  return {
    ...api,
    resolvedRows,
    resolvedCols,
    headers,
    canAdd,
    canRemove,
    showRowHeaders,
    showColHeaders,
    gridClass,
    gridColumns,
    nonce,
    addLabel,
    removeLabel,
    addIcon,
    removeIcon,
    sortIcon,
    handleAdd,
    handleRemove,
    filled,
  }
}

/**
 * Default prop values for the matrix blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<MatrixProps>()({
  type: 'matrix',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  min: -1,
  max: -1,
  add: true,
  remove: true,
  sort: false,
  minWidth: 'min-content',
  maxWidth: '1fr',
  colValue: 'value',
  colLabel: 'label',
  colConditions: 'conditions',
  colSchema: 'schema',
  colMinWidth: 'minWidth',
  colMaxWidth: 'maxWidth',
  rowValue: 'value',
  rowLabel: 'label',
  rowConditions: 'conditions',
  rowRules: 'rules',
  colsKey: 'cols',
  rowsKey: 'rows',
  rowHeaders: true,
  colHeaders: true,
  conditions: undefined,
  mode: 'auto',
  showRequired: undefined,
  addIcon: '$add',
  removeIcon: '$remove',
  sortIcon: '$sort',
})
