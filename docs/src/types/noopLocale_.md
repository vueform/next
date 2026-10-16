```ts
/**
 * The inert locale surface used when the `locale` module is not registered —
 * behaves as if localization weren't there: translation tags resolve to their
 * raw tag string, locale maps fall back to their first entry, and locale
 * switching warns in dev.
 */
const noopLocale: LocaleModule
```
