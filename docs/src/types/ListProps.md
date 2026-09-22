```ts
/**
 * Props for the list element blueprint.
 */
interface ListProps<
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
```
