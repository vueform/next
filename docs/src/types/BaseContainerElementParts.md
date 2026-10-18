```ts
/**
 * Parts base for container-kind elements — elements named via
 * `aria-labelledby` that can render their label as a heading (`heading`
 * prop). Adapters augment it with the parts whose contract differs by
 * element kind (the label).
 */
interface BaseContainerElementParts extends BaseElementParts {}
```
