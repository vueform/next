```ts
/**
 * Configuration options for the router module (`config.$router`).
 */
interface RouterModuleOptions {
  /**
   * Query parameter name used for step navigation when a vue-router instance is
   * provided.
   */
  queryParam?: string

  /**
   * Vue-router instance (or `false` to disable auto-detection).
   */
  router?: VueformRouter | false

  /**
   * Custom router integration replacing the built-in vue-router / pushState
   * implementation.
   */
  adapter?: RouterAdapter
}
```
