# `useClasses`

<!-- #region description -->
Registers class definitions on the nearest Vueform component from a custom template or slot. A key you set replaces the component's own value for that key; keys you leave out keep the component's value. Returns the host's classes object, typed with the built-in keys plus the keys the definitions introduce.
<!-- #endregion description -->

<!--@include: ../../types/useClasses.md-->

<!--
## Usage

A minimal example that uses the composable:
-->

## Params

The arguments accepted by the composable.

<!-- #region params -->

| Name | Description |
| --- | --- |
| [`name`](!code#params.name "ComponentNames") | The host component name, used for type inference. |
| [`defs`](!code#params.defs "TemplateClassDefs<T>[") | **Rest.** Class definition objects or factories over the host context. |

<!-- #endregion params -->
