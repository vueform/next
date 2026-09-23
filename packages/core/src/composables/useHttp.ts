import type { VueformInstance } from '~/helpers'
import { getHttpModule, type HttpInstance } from '~/modules/http'

/**
 * Returns an instance over the http module configured via `config.$http` (the
 * module's `make()`): the full client surface plus `onRequest` / `onResponse`
 * interceptors that apply only to this instance's calls — form submissions,
 * autosave, and other instances are untouched, and the interceptors are
 * released with the instance. App-wide interceptors belong in the `$http`
 * config.
 *
 * Setup-only when called with no arguments — it resolves the calling
 * component's instance. Pass your `createVueform()` instance to use it anywhere
 * else, e.g. `useHttp(vueform)`. Never throws for a missing `http` module: the
 * returned instance's requests reject with a descriptive error instead, so
 * acquiring it in setup is always safe.
 *
 * @param vueform The Vueform instance to resolve from. Required outside a
 *   component context.
 */
export function useHttp(vueform?: VueformInstance): HttpInstance {
  return getHttpModule(vueform).make()
}
