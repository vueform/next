```ts
/**
 * Class definitions accepted by `useClasses`: the host's declared keys stay
 * typed, and any extra key is allowed.
 */
type TemplateClasses<T extends ComponentNames> = LooseClasses<
  ComponentRegistry[T]['classes']
> &
  Record<string, ClassInput<ClassValue>>
```
