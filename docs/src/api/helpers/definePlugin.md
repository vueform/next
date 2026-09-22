# `definePlugin`

<!-- #region description -->

Defines a Vueform plugin that can extend components, config, and globals. Takes a factory producing the plugin's definition — its parameters become the plugin's options — and returns the plugin as a callable factory, so registration is uniform whether or not the plugin takes options: `plugins: [myPlugin()]` or `plugins: [myPlugin({ ... })]`.
<!-- #endregion description -->

<!--@include: ../../types/definePlugin.md-->
