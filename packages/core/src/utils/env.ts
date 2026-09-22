export const isClient = typeof window !== 'undefined'
export const isServer = !isClient

/**
 * Whether the build runs in production mode. A function, not a module-level
 * constant: the flag is read at call time, so behavior that depends on it (e.g.
 * the security module's fail-closed misconfiguration handling) follows the
 * environment the moment it runs — which is also what lets tests exercise
 * production behavior via `vi.stubEnv`. Bundlers still substitute
 * `process.env.NODE_ENV` inside this module, so production builds fold the body
 * to a constant.
 */
export function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * The inverse of `isProd` — development (and test) mode, where dev warnings
 * fire and misconfigured states stay permissive.
 */
export function isDev(): boolean {
  return process.env.NODE_ENV !== 'production'
}
