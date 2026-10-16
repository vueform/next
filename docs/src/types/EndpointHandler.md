```ts
/**
 * An async handler function for submitting/autosaving form data. Return a
 * `string` to use it as the endpoint URL, an `HttpResponse` to use it as the
 * result, `false` to cancel, or void for a silent completion.
 */
type EndpointHandler<TContext = any> = (
  data: Record<string, any>,
  context$: TContext
) =>
  | string
  | false
  | HttpResponse
  | void
  | Promise<string | false | HttpResponse | void>
```
