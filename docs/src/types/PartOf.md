```ts
/**
 * Extracts a partial props type for a given component, used for individual part
 * prop overrides. The component may not be registered in the current program —
 * registration is augmentation-driven (a component's `unstyled.ts`), so this
 * must not assume the key exists (e.g. an adapter's src-based type program
 * loads only its own components: no `VfIcon` / `VfTabs` in PrimeVue). Falls
 * back to a loose props record when the key is absent.
 */
type PartOf<T extends ComponentNames | (string & {})> = T extends ComponentNames
  ? Partial<PropsOf<T>>
  : Record<string, any>
```
