# `useDate`

<!-- #region description -->
Parses a value into a `DateInstance` using the configured date adapter (`config.$date.adapter`). Returns the current date when called without arguments.

Setup-only when called without `vueform` — it resolves the calling component's instance. Pass your `createVueform()` instance to use it anywhere else, e.g. `useDate(value, format, vueform)`. Throws when the `date` module is not registered.
<!-- #endregion description -->

<!--@include: ../../types/useDate.md-->

<!--
## Usage

A minimal example that uses the composable:
-->

## Params

The arguments accepted by the composable.

<!-- #region params -->

| Name | Description |
| --- | --- |
| [`value?`](!code#params.value "any") | The date value to parse (e.g. `Date`, ISO string, timestamp). |
| [`format?`](!code#params.format "string") | Optional format string (requires a date format plugin). |
| [`vueform?`](!code#params.vueform "VueformInstance") | The Vueform instance to resolve from. Required outside a component context. |

<!-- #endregion params -->
