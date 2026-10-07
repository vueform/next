/**
 * Ambient declaration for the `#shorthands` marker module.
 *
 * Component `unstyled.ts` files import it so readers know shorthand prop types
 * (`part:*` / `class:*` / `reclass:*`) are injected at build time into dist by
 * `@vueform/utils`. The module is intentionally empty: during builds the vfBuild
 * plugin resolves it to an empty virtual module, strips the import from emitted
 * JS and rewrites it in the emitted `.d.ts` to the real generated declaration
 * merge.
 *
 * `#shorthands` is deliberately NOT in the packages' `imports` fields (which
 * exist for `#src/*`): TS leaves it unresolved and uses THIS ambient
 * declaration, keeping any real module out of the d.ts emission program
 * (rootDir, TS6059). At build/test time the specifier never reaches spec
 * resolution: the shorthands marker plugin claims it (`enforce: 'pre'`, so
 * it beats Vite's core resolver, which would otherwise reject an undeclared
 * `#` in an `imports`-field package), and the vitest/dev alias maps it to
 * the mock.
 */
declare module '#shorthands' {}
