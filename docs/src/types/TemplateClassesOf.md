```ts
/**
 * The classes object `useClasses` returns: the host component's declared keys
 * plus every key the passed definitions introduce. At runtime it is the host's
 * own `context.classes` proxy — the type just widens it with the template's
 * keys, so they read as `ClassValue` without a module augmentation.
 */
type TemplateClassesOf<
  T extends ComponentNames,
  D extends TemplateClassDefs<T>[],
> = ClassesOf<T> & {
  [
    K in Exclude<TemplateClassKeys<D[number]>, keyof ClassesOf<T>> & string
  ]: ClassValue
}
```
