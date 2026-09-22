```ts
/**
 * Default prop values keyed by component name, with `*` for all components and
 * `*element` for all elements.
 */
type ComponentDefaultsMap = {
  [K in ComponentNames]?: Partial<ComponentRegistry[K]['props']>
} & {
  '*'?: Partial<ComponentRegistry[ComponentNames]['props']> &
    Record<string, any>
} & {
  '*element'?: Partial<ElementRegistry[ElementNames]['props']> &
    Record<string, any>
}
```
