```ts
interface TValidationProps<TContext = any> extends Omit<
  ValidationProps<TContext>,
  'rules'
> {
  /**
   * Validation rules to apply to the textarea.
   */
  rules?: TRulesProp<TContext>
}
```
