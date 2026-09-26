# `createRule`

<!-- #region description -->
Creates a callable validation rule with typed parameters, debounce support, and automatic error messages. The result is a stateless `RuleDefinition`: calling it with parameters (`min(3)`, `min({ min: 3 })`) returns a configured copy. The validation module compiles definitions into units and owns all runtime state. Instance-independent by design: rules are authored at module scope, before any `createVueform()` runs, so this produces plain descriptors and touches no module, config or app.
<!-- #endregion description -->

<!--@include: ../../types/createRule.md-->
