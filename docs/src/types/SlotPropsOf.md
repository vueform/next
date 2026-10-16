```ts
/**
 * Slot props of a possibly-unregistered component's slot. Same rationale as
 * `PartOf`: core types reference core-only components (`VfTabs`, `VfSteps`,
 * `VfLanguages`) whose registry augmentations are absent from adapter type
 * programs — degrade to a loose record instead of erroring.
 */
type SlotPropsOf<
  C extends keyof SlotProps | (string & {}),
  S extends
    | (C extends keyof SlotProps ? Extract<keyof SlotProps[C], string> : never)
    | (string & {}),
> = C extends keyof SlotProps
  ? S extends keyof SlotProps[C]
    ? SlotProps[C][S]
    : Record<string, any>
  : Record<string, any>
```
