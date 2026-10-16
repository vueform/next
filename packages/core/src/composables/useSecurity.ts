import { getSecurityModule, type SecurityModule } from '#src/modules/security'

/**
 * Returns the security module (sanitizer and `encrypt` / `decrypt` ciphers).
 * Setup-only.
 */
export function useSecurity(): SecurityModule {
  return getSecurityModule()
}
