```ts
/**
 * Global options for the autosave module (the `$autosave` config object).
 */
interface AutosaveModuleOptions {
  /**
   * The default storage backend for drafts, used by every form whose `draft`
   * config doesn't set its own `storage`. Defaults to `localStorage`.
   */
  storage?: DraftStorage
}
```
