```ts
/**
 * Keys a single class definition introduces: for factories, the keys of the
 * returned object; for definition objects, their own keys.
 */
type TemplateClassKeys<D> = D extends (...args: any[]) => infer R
  ? keyof R
  : keyof D
```
