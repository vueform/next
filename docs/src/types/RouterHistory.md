```ts
/**
 * A per-instance history handler returned by the router module's `make` method.
 */
interface RouterHistory {
  /**
   * Pushes a new navigation entry with the given state data.
   *
   * @param data The state data to record.
   */
  push: (data: Record<string, any>) => void

  /**
   * Navigates back one step in the history.
   */
  back: () => void | Promise<void>
}
```
