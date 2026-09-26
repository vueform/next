# `defineComputedSchema`

<!-- #region description -->
`defineSchema` counterpart for reactive schemas: takes a getter and returns it wrapped in a `computed`, so schemas built from reactive sources stay live without a manual `computed(() => defineSchema({ … }))` wrapper. The same validation and `const`-narrowing apply to the getter's return value. A separate function (instead of a `defineSchema` overload) so invalid schemas keep reporting inline at the offending property — an overloaded `defineSchema` collapses them into an aggregated "no overload matches" error at the call site. The optional Standard Schema second argument works like `defineSchema`'s: it is keyed on the returned computed ref (the getter produces a fresh object per evaluation). Note the Standard Schema itself is static while the form schema can change reactively.
<!-- #endregion description -->

<!--@include: ../../types/defineComputedSchema.md-->
