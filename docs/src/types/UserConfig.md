```ts
/**
 * The user-facing configuration type where all keys are optional.
 */
type UserConfig = PartialDeepKeys<VueformConfig, 'modules' | 'build'>
```
