```ts
/**
 * Compiles one `safePropRefs` entry, or `null` when it isn't a valid pattern
 * (an empty segment, or `**` anywhere but alone / as the final segment) — an
 * invalid entry must never compile into something broader than written.
 *
 * @param pattern The raw (or expression-resolved) entry.
 */
function compilePropRefPattern(pattern: string): PropRefPattern | null
```
