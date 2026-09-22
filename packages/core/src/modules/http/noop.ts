import type { HttpClient, HttpModule } from './types'

/**
 * Rejects with the "not registered" error — the behavior of every client method
 * on the noop surface. Async, so a missing module surfaces the same way a
 * missing adapter does: as a rejection at request time, never as a sync throw
 * at acquisition.
 */
const notRegistered = async (): Promise<never> => {
  throw new Error(
    'The `http` module is not registered. Register it via ' +
      '`createVueform({ modules: { http } })`'
  )
}

const client: HttpClient = {
  request: notRegistered,
  get: notRegistered,
  post: notRegistered,
  put: notRegistered,
  patch: notRegistered,
  delete: notRegistered,
}

/**
 * The inert http surface served when the `http` module is not registered.
 * Acquiring it (`useHttp()`, `getHttpModule()`, a component's `$http`) never
 * throws — every request made through it rejects with a descriptive error, so
 * forms and elements that never hit the network work without the module.
 */
export const noopHttp: HttpModule = {
  ...client,
  make: () => ({
    ...client,
    onRequest: () => {},
    onResponse: () => {},
  }),
}
