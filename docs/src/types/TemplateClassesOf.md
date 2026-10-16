```ts
/**
 * The classes object `useClasses` returns: the host component's declared keys
 * plus every key the passed definitions introduce.
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
