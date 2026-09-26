/**
 * Test-time stand-in for the `#shorthands` marker module.
 *
 * Component `unstyled.ts` files import the marker so readers know shorthand
 * prop types are injected at build time (see `@vueform/utils`). Builds resolve
 * it to an empty virtual module; test pipelines alias it to this file so the
 * import stays inert.
 */
export {}
