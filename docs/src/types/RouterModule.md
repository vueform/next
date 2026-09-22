```ts
/**
 * The router module instance providing browser history integration for
 * multi-step forms.
 */
interface RouterModule {
  /**
   * Creates a per-instance history handler that manages push/back navigation
   * and listens for external navigation events.
   *
   * @param active Whether history tracking is enabled.
   * @param onNavigate Callback invoked when an external navigation occurs (e.g.
   *   browser back button or route change).
   */
  make: (
    active: MaybeRef<boolean | undefined>,
    onNavigate: (state: any) => void
  ) => RouterHistory
}
```
