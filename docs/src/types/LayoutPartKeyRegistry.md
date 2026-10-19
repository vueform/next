```ts
/**
 * The element-layout part names core renders through VfLayout. Adapters own
 * the part SHAPES (their `BaseElementParts` augmentations differ per adapter),
 * but core owns the KEY vocabulary — these keys stand in for those parts in
 * core-world checks, where the adapter augmentations are not loaded. An
 * augmentable interface (member values are irrelevant) so adapters can
 * declaration-merge keys of their own that are legitimately partless (e.g. a
 * class styling a directive-rendered overlay).
 */
interface LayoutPartKeyRegistry {
  root: unknown
  panel: unknown
  labelGroup: unknown
  label: unknown
  required: unknown
  help: unknown
  elementGroup: unknown
  elementWrapper: unknown
  addonGroup: unknown
  iconGroup: unknown
  addonBefore: unknown
  addonAfter: unknown
  iconBefore: unknown
  iconAfter: unknown
  language: unknown
  loading: unknown
  tabs: unknown
  description: unknown
  errors: unknown
  error: unknown
  messages: unknown
  message: unknown
}
```
