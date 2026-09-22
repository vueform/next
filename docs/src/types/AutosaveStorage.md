```ts
/**
 * A storage backend for local autosave — the `localStorage` slice of the Web
 * Storage API, so `localStorage`, `sessionStorage`, and custom adapters all
 * qualify.
 */
type AutosaveStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}
```
