```ts
/**
 * Resolves an endpoint definition into an HTTP response, handling string URLs,
 * config objects, and callback functions.
 *
 * Setup-only (resolves the calling component's instance). Throws when the
 * `http` module is not registered.
 *
 * @param endpoint The endpoint definition to resolve.
 * @param data Optional data payload to send with the request.
 */
async function useEndpoint<T = any>(
  endpoint: EndpointDefinition | undefined,
  data?: any
): Promise<T | undefined>
```
