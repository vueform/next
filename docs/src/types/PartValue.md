```ts
/**
 * Resolves a single part value to its allowed shapes. Every object position
 * (static value or function return type) is widened with `Record<string & {},
 * any>` so users can pass arbitrary extra attributes.
 *
 * - The static return value (object of attributes).
 * - The original function shape (for callable parts).
 * - The original function shape with the component context appended as the last
 *   parameter.
 * - For non-callable parts, a function that receives only the component context.
 */
type PartValue<V, TContext = any> = V extends (...args: infer A) => infer R
  ?
      | OpenObject<R>
      | ((...args: A) => OpenObject<R>)
      | ((...args: [...A, TContext]) => OpenObject<R>)
  : OpenObject<V> | ((context$: TContext) => OpenObject<V>)
```
