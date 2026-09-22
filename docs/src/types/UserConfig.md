```ts
/**
 * The user-facing partial configuration type where all keys are optional except
 * modules and build which are individually optional.
 */
type UserConfig = PartialDeepKeys<VueformConfig, 'modules' | 'build'>
```
