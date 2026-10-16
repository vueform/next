```ts
/**
 * A consumer instance over the shared http module, produced by `make()` and
 * returned by `useHttp()`. Requests made through it run the instance's own
 * interceptors on top of the config-declared ones; interceptors registered here
 * affect only this instance's calls and are released with it. App-wide
 * interceptors are config-declared (`$http.onRequest` / `onResponse`).
 */
interface HttpInstance extends HttpClient {
  /**
   * Registers a request interceptor for this instance, run on its requests
   * before the config-declared interceptors.
   *
   * @param fn The interceptor function.
   */
  onRequest: (fn: RequestInterceptor) => void

  /**
   * Registers a response interceptor for this instance, run on responses to its
   * requests after the config-declared interceptors.
   *
   * @param fn The interceptor function.
   */
  onResponse: (fn: ResponseInterceptor) => void
}
```
