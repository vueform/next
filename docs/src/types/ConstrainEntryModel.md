```ts
/**
 * Re-narrows the model-coupled props (`modelValue`, `default`) and item/group
 * key props of a schema entry from its registry entry instantiated with the
 * entry itself — this is where `items` / `itemValue` / `multiple` / `translate`
 * / `languages` (or an adapter's own model-driving props) constrain the
 * accepted model, and where `itemValue` / `itemLabel` / `groupChildren` (and
 * the PrimeVue `option*` aliases) are checked against the `items` / `options`
 * shape.
 */
type ConstrainEntryModel<
  El,
  N extends ElementNames,
> = ElementRegistry<El>[N]['props'] extends infer P
  ? ConstrainEntryItemKeys<
      HasModelProp<N> extends true
        ? P extends { modelValue?: infer Model }
          ? El extends { modelValue?: ModelWithReadonly<Model> } & {
              default?: ModelWithReadonly<Model>
            }
            ? El
            : Omit<El, 'modelValue' | 'default'> & {
                modelValue?: ModelWithReadonly<Model>
                default?: ModelWithReadonly<Model>
              }
          : El
        : El,
      P
    >
  : El
```
