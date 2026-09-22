```ts
/**
 * The tuple returned by `useForm`: the renderable form component, the unwrapped
 * form context, and the ready registrar.
 */
type UseFormReturn<TSchema = FormSchema> = [
  Component,
  VfFormContext<VfFormProps<TSchema>>,
  FormReady<VfFormContext<VfFormProps<TSchema>>>,
]
```
