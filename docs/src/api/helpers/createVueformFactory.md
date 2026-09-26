# `createVueformFactory`

<!-- #region description -->
Creates a `createVueform` entry function around a set of default options. `TRequired` lists the modules the produced `createVueform` demands from its caller. Bare entries that bundle nothing pass `<'model'>` — `model` has no noop and must be registered. Theme entries that already register every module pass none and get a fully optional argument. Structural CSS (the visual layer that consumes the token variables) is expected to be loaded as a side effect by the adapter -- typically by the adapter's theme file importing its SCSS entry. The factory itself only injects the dynamic `:root { --vf-*: ... }` declarations derived from `config.tokens`.
<!-- #endregion description -->

<!--@include: ../../types/createVueformFactory.md-->
