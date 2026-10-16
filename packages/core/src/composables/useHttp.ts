import type { VueformInstance } from '#src/helpers'
import { getHttpModule, type HttpInstance } from '#src/modules/http'

/**
 * Returns an http instance configured via `config.$http`: the full client
 * surface plus `onRequest` / `onResponse` interceptors that apply only to this
 * instance's calls. Setup-only when called without `vueform`.
 *
 * @param vueform The Vueform instance to resolve from. Required outside a
 *   component context.
 */
export function useHttp(vueform?: VueformInstance): HttpInstance {
  return getHttpModule(vueform).make()
}
