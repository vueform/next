```ts
/**
 * Configuration options for the locale module (`config.$locale`).
 */
interface LocaleModuleOptions {
  /**
   * Registered locale definitions keyed by locale name.
   */
  locales?: LocalesProp

  /**
   * Fallback locale key used when a translation is missing.
   */
  fallbackLocale?: string

  /**
   * Active locale key (or a ref to one).
   */
  locale?: MaybeRef<string>

  /**
   * Pattern used to interpolate `{param}` placeholders in messages.
   */
  localeParamPattern?: RegExp

  /**
   * Custom locale implementation replacing the built-in translator.
   */
  adapter?: LocaleAdapter
}
```
