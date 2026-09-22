```ts
/**
 * Metadata object for page-type elements used in stepped/tabbed forms. Must
 * include at least a `label` for the tab/step text; additional properties are
 * exposed as arbitrary page metadata.
 */
type PageMeta<TContext = any> = {
  label?: TProp<string, TContext>
  [key: string]: any
}
```
