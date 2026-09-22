```ts
/**
 * Configuration for the holder provider factory.
 */
type MakeHolderProviderConfig = {
  /**
   * Whether the holder allows multiple selections (checkboxes) or a single
   * selection (radios).
   */
  multiple: boolean

  /**
   * The prop name on child elements used to resolve the item value when no
   * matching normalized item exists (e.g. `'radioValue'` or `'trueValue'`).
   */
  valueProp: string

  /**
   * The container type identifier passed to `useContainerProvider`. Defaults to
   * `'holder'` when not specified.
   */
  type?: keyof ContainerTypes
}
```
