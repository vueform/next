```ts
/**
 * The Fetch-backed adapter: no dependencies, uses the global `fetch`. Not wired
 * in by default — presets that want it configure it explicitly via
 * `$http.adapter`, so consumers who bring their own adapter (axios, ky, a
 * custom one) never bundle this implementation.
 */
const fetchHttpAdapter: HttpAdapter
```
