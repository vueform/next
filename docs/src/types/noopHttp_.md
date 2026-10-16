```ts
/**
 * The inert http surface served when the `http` module is not registered.
 * Acquiring it (`useHttp()`, `getHttpModule()`, a component's `$http`) never
 * throws — every request made through it rejects with a descriptive error, so
 * forms and elements that never hit the network work without the module.
 */
const noopHttp: HttpModule
```
