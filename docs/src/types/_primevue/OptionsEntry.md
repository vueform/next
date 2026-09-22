```ts
/**
 * Remaps PrimeVue option prop names on a registry `TEntry` payload to the core
 * items keys that the core `Entry*Of` helpers read (`options` → `items`,
 * `optionValue` → `itemValue`, `optionGroupChildren` → `groupChildren`).
 *
 * Prefer the PrimeVue-named wrappers (`EntryOptionsOf`,
 * `EntryOptionValueKeyOf`, `EntryOptionValueReturnOf`,
 * `EntryOptionGroupChildrenOf`) at call sites.
 */
type OptionsEntry<TEntry> = {
  items: EntryPropOf<TEntry, 'options'>
  itemValue: EntryPropOf<TEntry, 'optionValue'>
  groupChildren: EntryPropOf<TEntry, 'optionGroupChildren'>
}
```
