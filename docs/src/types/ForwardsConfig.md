```ts
/**
 * The events and slots an adapter component forwards to the underlying
 * third-party component.
 */
type ForwardsConfig = {
  /**
   * Event names to forward through the Vueform event system with `context$`
   * appended (kebab-case or camelCase).
   */
  events?: readonly string[]

  /**
   * Slot names to forward from the resolved outlets to the underlying
   * component.
   */
  slots?: readonly string[]
}
```
