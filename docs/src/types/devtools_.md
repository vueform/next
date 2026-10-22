```ts
/**
 * The devtools module. Registered by the package's default-export plugin
 * (`plugins: [devtoolsPlugin()]`), or directly via
 * `createVueform({ modules: { devtools } })`. Development-only: in production
 * builds, and with `devtools: false` in the config, it stays inert — so it is
 * safe to register unconditionally.
 */
const devtools: VueformModule<DevtoolsModule>
```
