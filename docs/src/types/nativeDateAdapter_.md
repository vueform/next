```ts
/**
 * The native `Date`-backed adapter: no dependencies, ISO / common datetime
 * string parsing, no format-aware parsing or formatting (`format()` warns and
 * falls back to ISO). Not wired in by default — presets that want it configure
 * it explicitly via `$date.adapter`, so consumers who bring their own adapter
 * (`@vueform/date-dayjs`, `@vueform/date-fns`, `@vueform/date-luxon`, or a
 * custom one) never bundle this implementation.
 */
const nativeDateAdapter: DateAdapter
```
