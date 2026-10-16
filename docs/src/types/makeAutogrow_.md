```ts
/**
 * Provides automatic height adjustment for textarea elements. When enabled, the
 * textarea grows and shrinks to match its content, responding to value changes,
 * paste events, and programmatic updates.
 *
 * @param options Factory options containing autogrow props and dependencies.
 */
const makeAutogrow: (
  config?: unknown
) => (options: MakeAutogrowOptions) => { autosize: () => void }
```
