```ts
/**
 * Item/group key props re-checked against the entry's `items` / `options`
 * shape. Includes core `item*` / `group*` names and PrimeVue `option*` aliases
 * — names that are absent on a given element's props are skipped.
 */
type ItemKeyPropNames =
  | 'itemValue'
  | 'itemLabel'
  | 'itemDisabled'
  | 'itemConditions'
  | 'groupLabel'
  | 'groupChildren'
  | 'groupConditions'
  | 'optionValue'
  | 'optionLabel'
  | 'optionDisabled'
  | 'optionConditions'
  | 'optionGroupLabel'
  | 'optionGroupChildren'
  | 'optionGroupConditions'
```
