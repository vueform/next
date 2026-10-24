# `useVueform`

<!-- #region description -->
Returns the Vueform instance of the injecting app (component setup / `app.runWithContext`). Throws `NotInstalledError` outside a component context — there is deliberately no ambient fallback, so a call can never silently read another instance's (or, under SSR, another request's) modules.
<!-- #endregion description -->

<!--@include: ../../types/useVueform.md-->

<!--
## Usage

A minimal example that uses the composable:
-->
