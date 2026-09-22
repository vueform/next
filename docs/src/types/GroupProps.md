```ts
/**
 * Props for the group element blueprint.
 */
interface GroupProps<
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
```
