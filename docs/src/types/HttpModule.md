```ts
/**
 * The http module: the client surface with the app's defaults and
 * config-declared interceptors, plus the factory producing consumer instances.
 */
interface HttpModule extends HttpClient {
  /**
   * Creates an instance over this module — what `useHttp()` returns.
   */
  make: () => HttpInstance
}
```
