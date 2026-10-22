```ts
/**
 * Whether a referenced prop path matches a compiled pattern. `segments` is the
 * normalized prop path (`[n]` index access already converted to dot segments).
 *
 * @param pattern The compiled pattern.
 * @param segments The prop path segments (`['model', '0']` for `@model[0]`).
 */
function matchesPropRef(pattern: PropRefPattern, segments: string[]): boolean
```
