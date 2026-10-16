```ts
/**
 * Extracts all top-level token keys from a flat theme object, excluding the
 * reserved `dark` entry.
 */
type ThemeTokenKeys<T> = Exclude<keyof T, 'dark'> & string
```
