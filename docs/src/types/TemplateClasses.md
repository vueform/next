```ts
/**
 * Class definitions accepted by `useClasses` from outside a component's own
 * setup: the host's declared keys stay typed, and any extra key is allowed so a
 * template can introduce class keys of its own.
 */
type TemplateClasses<T extends ComponentNames> = LooseClasses<
  ComponentRegistry[T]['classes']
> &
  Record<string, ClassInput<ClassValue>>
```
