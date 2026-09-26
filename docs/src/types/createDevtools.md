```ts
/**
 * Creates a devtools instance from the given app config (`$devtools` is
 * currently reserved; the top-level `devtools: false` option opts out).
 * Development-only by design: in production builds, and when opted out, the
 * inert `noopDevtools` surface is returned instead — nothing is tracked and no
 * DevTools plugin is registered, so the module can stay registered
 * unconditionally.
 *
 * When active, a `VfForm` plugin is added that registers every mounted form
 * with the inspector registry, refreshes the inspector on form data/state
 * changes, and unregisters the form on unmount. The inspector itself is set up
 * per app when Vueform is installed.
 *
 * @param vueform The Vueform instance; its config (`$devtools` is reserved,
 *   `devtools` opts out) and plugin registry.
 */
function createDevtools(vueform: VueformInstance): DevtoolsModule
```
