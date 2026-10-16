```ts
/**
 * Wraps useData with the standard factory props/deps/events pattern,
 * eliminating repetitive prop wiring in element factories.
 *
 * Pass a config object to exclude list-only or translatable-only keys from the
 * return type. When no config is provided, the full return type is used. Model
 * value field types follow `props.modelValue`.
 *
 * @param config Optional flags to exclude conditional return-type groups.
 */
const makeData: MakeDataFeature
```
