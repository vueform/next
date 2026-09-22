```ts
/**
 * An interceptor that can inspect or modify the response before it is returned
 * to the caller. May be async.
 */
type ResponseInterceptor = (
  response: HttpResponse
) => HttpResponse | Promise<HttpResponse>
```
