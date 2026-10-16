/**
 * Generated type-page filenames for lowercase-first symbols (functions,
 * composables, consts) carry a trailing `_` so they can never case-collide
 * with a type's page on case-insensitive filesystems (`defineEvents` vs
 * `DefineEvents` — both `defineEvents.md` and `DefineEvents.md` map to one
 * file on macOS/Windows, leaving every checkout permanently dirty).
 *
 * Every producer and consumer of `docs/src/types/*.md` pages and
 * `type-snippets/*.html` assets must go through this pair.
 */

/** Symbol name → file base name (no extension). */
export function typeFileBase(name: string): string {
  return /^[a-z]/.test(name) ? `${name}_` : name
}

/** File base name (no extension) → symbol name. */
export function canonicalTypeName(base: string): string {
  return /^[a-z]/.test(base) && base.endsWith('_') ? base.slice(0, -1) : base
}
