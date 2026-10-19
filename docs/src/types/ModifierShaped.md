```ts
/**
 * Modifiers bag vocabulary check: every attribute of every bag must be
 * `data-*`. Encodes the aspect-split doctrine at the type level.
 */
type ModifierShaped<T> = string extends keyof T
  ? unknown
  : [InvalidBagKeys<T, ModifierAttrKeys>] extends [never]
    ? unknown
    : {
        __modifierAttrsOutsideDataNamespace: InvalidBagKeys<T, ModifierAttrKeys>
      }
```
