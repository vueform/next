```ts
/**
 * The slice of a component api every layout-aware a11y pattern reads.
 * Patterns are invoked inside the `useA11y` merged computed, so every
 * `.value` read stays tracked.
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
