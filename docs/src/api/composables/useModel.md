# `useModel`

<!-- #region description -->
Creates a standalone form model from a schema, without mounting any components. The returned instance owns the data and exposes the data API; passing it to a form's `v-model` (or `useForm`) makes the form attach it. With an `endpoint` (and the other submission options), `submit()` runs the same submission flow as a form — validation floor, `submit` event / endpoint dispatch, request, result events — headlessly. Setup-only.
<!-- #endregion description -->

<!--@include: ../../types/useModel.md-->

<!--
## Usage

A minimal example that uses the composable:
-->

## Params

The arguments accepted by the composable.

<!-- #region params -->

| Name | Description |
| --- | --- |
| [`options`](!code#params.options "{ schema: FormSchema \| Ref<FormSchema> validationSchema?: StandardSchemaV1 languages?: LanguagesProp } & UseModelSubmissionOptions") |  |
| [`seed?`](!code#params.seed "Record<string, any>") | Initial (partial) data cloned over the schema defaults. |

<!-- #endregion params -->
