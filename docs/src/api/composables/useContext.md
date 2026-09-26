# `useContext`

<!-- #region description -->
Returns the public context of the nearest Vueform component — the very same object it passes to the `#template` slot and to a reusable template as the `context` prop, and the one event handlers receive as `context$`. It is Vue `reactive()` state over the object the component exposes: ref members read unwrapped (`context.value`) and can be assigned (`context.value = 'x'` writes the underlying ref); a destructured member is a snapshot, so go through `toRefs(context)` for live, writable refs.

Reach for it where the `context` prop isn't at hand — a helper component rendered inside a custom template, without passing the prop down. Inside a template itself, declaring the `context` prop (typed `ContextOf<'VfName'>`) is the primary route.
<!-- #endregion description -->

<!--@include: ../../types/useContext.md-->

<!--
## Usage

A minimal example that uses the composable:
-->

## Params

The arguments accepted by the composable.

<!-- #region params -->

| Name | Description |
| --- | --- |
| [`name`](!code#params.name "ComponentNames") | The component name used for type inference. |

<!-- #endregion params -->
