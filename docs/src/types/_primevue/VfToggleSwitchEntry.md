```ts
/**
 * Registry entry for VfToggleSwitch. `TEntry` narrows the props / emits /
 * context by the entry's model-driving props, the same way SFC generics do.
 */
interface VfToggleSwitchEntry<
  TEntry = Record<string, any>,
> extends DefineRegistryEntry<
  EntryProps<TEntry>,
  VfToggleSwitchEmits<
    EntryPropOr<TEntry, 'trueValue', true>,
    EntryPropOr<TEntry, 'falseValue', false>
  >,
  VfToggleSwitchSlots,
  VfToggleSwitchParts,
  VfToggleSwitchClasses,
  VfToggleSwitchContext<EntryProps<TEntry>>
> {}
```
