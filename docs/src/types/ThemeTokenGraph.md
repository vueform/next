```ts
/**
 * Reference graph of a theme's token map, keyed by `--vf-*` CSS custom property
 * names. `defs` holds the resolved (`var(--vf-*)`) definition of every token
 * whose value references other tokens; `dependents` maps each referenced token
 * to the tokens defined in terms of it.
 */
interface ThemeTokenGraph {
  defs: Map<string, string>
  dependents: Map<string, Set<string>>
}
```
