```ts
/**
 * Locale translation definitions mapping locale codes to key-value translation
 * pairs or lazy loaders.
 */
type LocalesProp = Record<string, Record<string, string | (() => string)>>
```
