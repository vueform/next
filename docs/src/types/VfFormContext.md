```ts
/**
 * Public context for VfForm, optionally parameterized by concrete props (e.g.
 * `VfFormContext<VfFormProps<typeof schema>>`) so the schema API slice (`find`
 * / `get` / `set` / `model` / `payload` / `update`) narrows to the schema
 * carried by the `schema` prop.
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfFormContext<
  // `any` in the schema slot: `MaybeRef<TSchema>` is invariant through `Ref`,
  // so a `FormSchema`-typed constraint would reject every concrete schema.
  TProps extends WidenProps<
    VfFormProps,
    FormProps<FormSlots, FormParts, FormClasses, any, any>
  > = VfFormProps,
> extends DefineElementContext<
  TProps,
  VfFormEmits,
  VfFormSlots,
  VfFormParts,
  VfFormClasses,
  VfFormBindings,
  VfFormExpose,
  FormApi<TProps>
> {}
```
