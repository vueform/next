```ts
/**
 * The devtools module. Register via `createVueform({ modules: { devtools } })`.
 * Development-only: in production builds, and with `devtools: false` in the
 * config, it stays inert — so it is safe to register unconditionally.
 */
const devtools: VueformModule<DevtoolsModule>
```
