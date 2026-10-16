```ts
/**
 * A URL string or async handler function for submitting form data.
 */
type EndpointProp<TContext = any> = string | EndpointHandler<TContext>
```
