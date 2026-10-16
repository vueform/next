# `defineComputedSchema`

<!-- #region description -->
`defineSchema` counterpart for reactive schemas: takes a getter and returns it wrapped in a `computed`, so schemas built from reactive sources stay live. The same validation and `const`-narrowing apply to the getter's return value.
<!-- #endregion description -->

<!--@include: ../../types/defineComputedSchema.md-->
