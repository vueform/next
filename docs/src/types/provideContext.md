```ts
/**
 * Provides a context to all descendant components and records it as local state
 * so the providing component can inject it itself.
 *
 * @param key The key of the context to provide.
 * @param context The context to provide.
 * @param app The Vue app instance to provide the context to.
 */
function provideContext<T>(key: ContextKey<T>, context: T, app?: App): T
```
