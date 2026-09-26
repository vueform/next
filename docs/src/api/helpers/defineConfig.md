# `defineConfig`

<!-- #region description -->
Type-safe helper for authoring Vueform configuration objects — an identity function that only provides typing, like Vite's `defineConfig`. Use it for user configs passed to `createVueform` and for package default configs handed to `createVueformFactory`. Both accept `UserConfig`; completeness of the final config comes from merging entry defaults with the modules each entry requires.
<!-- #endregion description -->

<!--@include: ../../types/defineConfig.md-->
