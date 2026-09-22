/**
 * Marker module resolved by the `#shorthands` alias.
 *
 * Component `unstyled.ts` files import this so readers know shorthand prop
 * types (`part:*` / `class:*` / `reclass:*`) are injected at build time into
 * dist by `@vueform/vite/build`. The source module is empty; the plugin
 * rewrites the import in emitted `unstyled.d.ts` and writes the real
 * declaration merge next to it.
 */
export {}
