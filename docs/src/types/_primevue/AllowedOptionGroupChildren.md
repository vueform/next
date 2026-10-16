```ts
/**
 * Allowed keys / mappers for `optionGroupChildren`.
 *
 * Same as core `AllowedGroupChildren`, except mapper returns are restricted to
 * arrays — PrimeVue's Select (and related) `optionGroupChildren` prop only
 * accepts `any[]`, not record maps.
 */
type AllowedOptionGroupChildren<TOptions> = [OptionGroupOf<TOptions>] extends [
  never,
]
  ? string | ((group: any) => any[])
  :
      | Extract<keyof OptionGroupOf<TOptions>, string>
      | ((group: OptionGroupOf<TOptions>) => any[])
```
