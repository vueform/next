```ts
/**
 * Class overrides keyed by component name, with `*` for all components and
 * `*element` for all elements. Functional class keys also accept a plain
 * `ClassValue`.
 */
type ComponentClassesMap = {
  [K in ComponentNames]?: LooseClasses<ComponentRegistry[K]['classes']>
} & {
  '*'?: LooseClasses<ComponentRegistry[ComponentNames]['classes']> &
    Record<string, any>
} & {
  '*element'?: LooseClasses<ElementRegistry[ElementNames]['classes']> &
    Record<string, any>
}
```
