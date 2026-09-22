```ts
/**
 * An HTTP adapter function that performs the actual network request.
 */
type HttpAdapter = <T = any>(
  config: HttpRequestConfig
) => Promise<HttpResponse<T>>
```
