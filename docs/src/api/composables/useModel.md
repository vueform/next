# `useModel`

<!-- #region description -->
Creates a standalone form model from a schema, without mounting any components. The returned instance owns the data and exposes the data API; passing it to a form's `v-model` (or `useForm`) makes the form attach it. Setup-only.
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
| [`schema`](!code#params.schema "FormSchema \| Ref<FormSchema>") | The form schema describing the model's shape. A ref/computed schema keeps the instance in sync with schema changes. |
| [`seed?`](!code#params.seed "Record<string, any>") | Initial (partial) data cloned over the schema defaults. |
| [`validationSchema?`](!code#params.validationSchema "StandardSchemaV1") | A Standard Schema (Zod, Valibot, ArkType, …) run by `validate()` against the whole model for form-level validation. |

<!-- #endregion params -->
