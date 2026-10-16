```ts
/**
 * An interceptor that can inspect or modify the request config before the
 * request is sent. May be async.
 */
type RequestInterceptor = (
  config: HttpRequestConfig
) => HttpRequestConfig | Promise<HttpRequestConfig>
```
