/**
 * Re-export shim: the shared terminal toolkit lives in `@vueform/utils`
 * (packages/utils/src/terminal/) so non-root consumers (docs generators, the
 * benchmark) can import it as a package. The root runners keep `./terminal`
 * imports through this shim — always dynamically, after
 * `ensureUtilsDist()`, since it resolves to the package's dist.
 */
export * from '@vueform/utils/terminal'
