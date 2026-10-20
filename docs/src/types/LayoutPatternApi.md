```ts
/**
 * The slice of a component api every layout-aware binding pattern reads.
 * Patterns build part-keyed definitions whose entries are zero-argument
 * resolvers: every `.value` read runs at the part's consuming site (its own
 * render effect), never while the definition is registered or merged.
 */
interface LayoutPatternApi {
  props: {
    /**
     * When `false`, the element renders without its layout (no label, help,
     * description, or error regions), so no describedby relationship can be
     * established.
     */
    layout?: unknown

    /**
     * When `true`, the label group (which also hosts the help region) is not
     * rendered.
     */
    hideLabel?: boolean
  }
  label: Ref<string | undefined>
  help: Ref<unknown>
  description: Ref<unknown>
  labelId: Ref<string>
  helpId: Ref<string>
  descriptionId: Ref<string>
  errorId: Ref<string>
}
```
