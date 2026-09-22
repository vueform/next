/**
 * Error thrown when a composable or module doorway is called outside a
 * component context without an explicit Vueform instance to resolve from.
 */
export class NotInstalledError extends Error {
  constructor(message?: string) {
    super(
      message ??
        'No Vueform instance in context. Call this inside a component setup ' +
          'of an app that installed Vueform. Outside components, use your ' +
          'instance directly (e.g. `vueform.useModel(...)`, ' +
          '`getLocaleModule(vueform)`); composables that bind to a component ' +
          '(e.g. `useConditions`) are setup-only.'
    )
    this.name = 'NotInstalledError'
  }
}
