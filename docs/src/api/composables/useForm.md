# `useForm`

<!-- #region description -->
Creates a form component preconfigured with the given props and model, returning it alongside the form context and a ready registrar. The model is bound according to its shape: `useModel` instances are attached, refs are two-way synced, reactive objects are synced back on update, and plain objects seed the initial value. Any option may be a ref or computed. Setup-only when called without `vueform`.
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
