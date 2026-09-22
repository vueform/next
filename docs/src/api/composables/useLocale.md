# `useLocale`

<!-- #region description -->

Returns the locale module, or its inert surface (raw tags, first-entry locale maps) when the `locale` module is not registered.

Setup-only when called without `vueform` — it resolves the calling component's instance. Pass your `createVueform()` instance to use it anywhere else, e.g. `useLocale(vueform)`; inside event handlers prefer the component context's `$locale`.
<!-- #endregion description -->

<!--@include: ../../types/useLocale.md-->

<!--
## Usage

A minimal example that uses the composable:
-->
