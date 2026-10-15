import {
  defineModule,
  definePlugin,
  noopDevtools,
  type DevtoolsModule,
  type VueformInstance,
} from '@vueform/core'

/**
 * The production entry — what the `production` export condition resolves to
 * (Vite, webpack, and friends set it on production builds), so none of the
 * devtools implementation ever enters a production module graph. It mirrors the
 * dev entry's surface with inert stand-ins: the plugin registers nothing and
 * every surface is `noopDevtools`.
 */

/**
 * Production stand-in for `createDevtools` — always the inert `noopDevtools`
 * surface.
 */
export function createDevtools(_vueform: VueformInstance): DevtoolsModule {
  return noopDevtools
}

/**
 * Production stand-in for the devtools module — creates the inert
 * `noopDevtools` surface, mirroring what the real module does in production.
 */
export const devtools = defineModule({
  create: () => noopDevtools,
})

export default definePlugin(() => ({
  name: 'devtools',
}))
