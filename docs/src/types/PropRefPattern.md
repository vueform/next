```ts
/**
 * A compiled `$security.safePropRefs` pattern. The first segment matches the
 * prop name itself (with `*` spanning any characters inside the segment, so
 * `*propName` / `propName*` work); the remaining segments describe allowed
 * nesting: `*` matches one level, `**` (final only) matches one or more, and
 * anything else must match the level literally (`*` allowed within, like the
 * name segment). Trailing `*` segments are optional — `propName.*.*` covers one
 * or two levels — while static segments and `**` are not. A standalone `**`
 * pattern matches every prop at every depth.
 */
type PropRefPattern = {
  all: boolean
  name: RegExp
  nested: (RegExp | '*' | '**')[]
}
```
