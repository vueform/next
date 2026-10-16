```ts
/**
 * Global slot override definitions, mapping component names to their available
 * slot names with replacement components.
 */
type SlotsDefinition = {
  [K in keyof ComponentsWithSlotsProp]?: ComponentsWithSlotsProp[K] extends {
    slots: infer T extends Record<string, any>
  }
    ? {
        [TK in keyof T]?: Component
      }
    : never
}
```
