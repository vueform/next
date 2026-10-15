/**
 * Re-export shim: the shared terminal toolkit lives in `@vueform/utils`
 * (packages/utils/src/terminal/) so non-root consumers (docs generators, the
 * benchmark) can import it as a package. The root runners keep `./terminal`
 * imports through this shim — it resolves to the package's DIST, which must
 * exist beforehand (vp dependsOn in tasks; `vpr :build:utils` on a fresh
 * checkout).
 */
export * from '@vueform/utils/terminal'
