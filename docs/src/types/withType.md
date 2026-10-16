```ts
/**
 * Returns blueprint defaults with the element `type` replaced by the
 * component's own element name.
 *
 * @param defaults The blueprint defaults whose `type` to replace.
 * @param type The component's own element type literal.
 */
function withType<TDefaults extends { type: string }, T extends string>(
  defaults: TDefaults,
  type: T
): Omit<TDefaults, 'type'> & { type: T }
```
