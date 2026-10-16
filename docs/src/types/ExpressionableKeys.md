```ts
/**
 * Prop keys that support expression syntax (e.g. template interpolation or
 * dynamic evaluation).
 */
type ExpressionableKeys =
  | 'default'
  | 'label'
  | 'help'
  | 'description'
  | 'placeholder'
  | 'text'
  | 'addon'
  | (string & {})
```
