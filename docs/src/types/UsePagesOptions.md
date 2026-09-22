```ts
/**
 * Configuration options for the usePager composable.
 */
type UsePagesOptions = {
  /**
   * Whether pages must be completed in order. When `true`, users cannot skip
   * ahead to unvisited pages.
   */
  sequential?: MaybeRef<boolean>

  /**
   * Whether to integrate with browser history via `pushState`, enabling
   * back/forward navigation.
   */
  history?: MaybeRef<boolean | undefined>

  /**
   * Whether the pager is active. When `false`, pager behavior is disabled.
   */
  active?: MaybeRef<boolean | undefined>

  /**
   * The children registry providing access to registered child element
   * instances.
   */
  children: VueformChildren

  /**
   * A computed array of page schemas, each containing the page's element props
   * and component definition.
   */
  schema: ComputedRef<
    {
      props: NamedElementSchema
      component: ComponentProp
    }[]
  >
} & Partial<EmitsToProps<PagerEmits>>
```
