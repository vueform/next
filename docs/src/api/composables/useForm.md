# `useForm`

<!-- #region description -->
Creates a form component preconfigured with the given props and model, returning it alongside the form context and a ready registrar. The form always has an engine: a passed `useModel` instance is attached as-is, and with no model (or a plain-object seed) an internal instance is created from the schema and attached the same way — so the context answers the engine's members (data, validation, submission) before the form mounts, and the mounted members join on mount. Refs are two-way synced and reactive objects are synced back on update instead; their store stays the caller's. Any option may be a ref or computed. Setup-only when called without `vueform`.
<!-- #endregion description -->

<!--@include: ../../types/useForm.md-->

<!--
## Usage

A minimal example that uses the composable:
-->

## Params

The arguments accepted by the composable.

<!-- #region params -->

| Name | Description |
| --- | --- |
| [`formProps?`](!code#params.formProps "Record<string, any>") | Props forwarded to VfForm (e.g. `schema`). |
| [`model?`](!code#params.model "any") | The form data: `useModel` instance, ref, reactive, or plain object. |
| [`vueform?`](!code#params.vueform "VueformInstance") | The Vueform instance to build from. Required outside a component context. |

<!-- #endregion params -->
