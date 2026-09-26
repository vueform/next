```ts
/**
 * Props for the VfForm component, optionally parameterized by a concrete schema
 * type (e.g. `VfFormProps<typeof schema>` with a `defineSchema` result).
 * `TSchema` drives the typed schema API on the form context (`find` / `get` /
 * `set` / `model` / `payload` / `update`). Reach for `VfFormProps` instead when
 * no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs are injected into dist
 * by `@vueform/utils` (see the `#shorthands` marker import on `unstyled.ts`).
 */
interface VfFormProps<TSchema = FormSchema> extends FormProps<
  VfFormSlots<TSchema>,
  VfFormParts,
  VfFormClasses,
  VfFormContext<VfFormProps<TSchema>>,
  TSchema
> {}
```
