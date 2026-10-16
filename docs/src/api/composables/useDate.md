# `useDate`

<!-- #region description -->
Parses a value into a `DateInstance` using the configured date adapter. Returns the current date when called without arguments. Setup-only when called without `vueform`.
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
