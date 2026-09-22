```ts
/**
 * A preset definition after normalization, with `$apply` and `$cascade`
 * resolved to their canonical forms.
 */
type NormalizedPresetDefinition = {
  /**
   * The list of component names or a matcher function that determines which
   * components receive this preset.
   */
  $apply:
    | (ComponentNames | 'this' | '*' | '*element' | (string & {}))[]
    | ((component: ComponentOptions) => boolean)

  /**
   * Whether this preset should cascade to child components.
   */
  $cascade: boolean
} & Record<string, any>
```
