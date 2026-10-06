```ts
/**
 * Props for the matrix element blueprint.
 */
interface MatrixProps<
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
  colConditions?:
    | string
    | ((col: any) => ConditionsResult<TContext> | undefined)

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
  rowConditions?: string | ((row: any) => ConditionsResult | undefined)

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
```
