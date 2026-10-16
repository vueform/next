```ts
/**
 * A user-facing preset definition that can be a single object or an array, with
 * optional `$apply`, `$cascade`, and `$merge` directives.
 */
type PresetDefinition = MaybeArray<
  {
    /**
     * Specifies which components receive this preset, as a name, array of
     * names, or a matcher function.
     */
    $apply?:
      | MaybeArray<ComponentNames | 'this' | '*' | '*element' | (string & {})>
      | ((component: ComponentOptions) => boolean)

    /**
     * Whether this preset should cascade to child components.
     */
    $cascade?: boolean

    /**
     * Whether this preset should be merged with existing values instead of
     * replacing them.
     */
    $merge?: boolean
  } & Record<string, any>
>
```
