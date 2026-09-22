```ts
/**
 * Extracts the component's class map from its props' `classes` prop, mirroring
 * how `useParts` recovers the parts map from `parts`.
 */
type ClassesOfProps<TProps> = TProps extends {
  classes?: ClassesProp<infer C>
}
  ? C extends Record<string, any>
    ? C
    : Record<string, any>
  : Record<string, any>
```
