```ts
/**
 * Dark-mode configuration accepted by `createVueform` and the form-level
 * `darkMode` prop.
 *
 * - `'system'` — follows the OS preference via `prefers-color-scheme`.
 * - A CSS subselector string — watches `<html>` for a class or attribute.
 *   Examples: `'.dark'`, `'[data-theme="dark"]'`.
 */
type DarkModeConfig = 'system' | (string & {})
```
