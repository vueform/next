import { getSecurityModule, type SecurityModule } from '#src/modules/security'

/**
 * Returns the security module (sanitizer and `encrypt` / `decrypt` ciphers), or
 * its inert surface (passthroughs) when the `security` module is not
 * registered.
 *
 * Setup-only: resolves the calling component's instance. Outside a component
 * use `getSecurityModule(vueform)`.
 */
export function useSecurity(): SecurityModule {
  return getSecurityModule()
}
