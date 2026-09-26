```ts
/**
 * Whether a devtools module is registered — `false` means `getDevtoolsModule`
 * serves the inert `noopDevtools` surface. Note that a registered module is
 * itself inert in production and with `devtools: false` in the config.
 */
function hasDevtoolsModule(vueform?: VueformInstance): boolean
```
