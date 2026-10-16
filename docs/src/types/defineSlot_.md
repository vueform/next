```ts
/**
 * Defines a typed slot component for a specific Vueform component slot with
 * type-safe props.
 *
 * @param path The host component and slot, as `VfName.slotName`.
 * @param options Vue component options including the list of slot props to
 *   receive.
 */
function defineSlot<
  C extends keyof SlotProps & string,
  S extends keyof SlotProps[C] & string,
  P extends (keyof SlotProps[C][S])[] = [],
>(
  path: `${C}.${S}`,
  options: SlotOptions<C, S, P>
): Raw<
  DefineComponent<
    {},
    {},
    {},
    {},
    {},
    ComponentOptionsMixin,
    ComponentOptionsMixin,
    {},
    string,
    PublicProps,
    ToResolvedProps<{}, {}>,
    {},
    {},
    {},
    {},
    string,
    ComponentProvideOptions,
    true,
    {},
    any
  >
>
```
