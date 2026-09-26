/**
 * Ambient declaration for the `#shorthands` marker module.
 *
 * Component `unstyled.ts` files import it so readers know shorthand prop types
 * (`part:*` / `class:*` / `reclass:*`) are injected at build time into dist by
 * `@vueform/utils`. The module is intentionally empty: during builds the vfBuild
 * plugin resolves it to an empty virtual module, strips the import from emitted
 * JS and rewrites it in the emitted `.d.ts` to the real generated declaration
 * merge.
 */
declare module '#shorthands' {}
