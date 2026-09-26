// Symbols contract: this file must have **zero runtime imports** so any file
// (in or outside the module) can deep-import `#core/modules/validation/symbols`
// without pulling in the validation runtime or forming an import cycle.

/**
 * Brand on `createRule` results so the validation compiler can distinguish them
 * from other callables (ArkType schemas, plain functions). Registered via
 * `Symbol.for` so rules created by a duplicated copy of core (e.g. a library
 * bundling its own) are still recognized.
 */
export const RULE_BRAND: unique symbol = Symbol.for('vueform.rule')
