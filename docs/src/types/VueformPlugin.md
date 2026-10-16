```ts
/**
 * The normalized plugin shape used internally by Vueform after processing
 * plugin options.
 */
type VueformPlugin = {
  name?: string
  apply?:
    | string
    | RegExp
    | ((component: VueformComponent) => boolean)
    | (string | RegExp)[]
  props?: ComponentPropsOptions
  emits?: string[]
  plugins?: VueformPlugin[]
  extend?: (props: any, api: any) => void | Record<string, any>
  config?: (config: any) => void
  globals?: (context: {
    config: any
    globals: Readonly<Partial<VueformGlobals>>
  }) => Partial<VueformGlobals> | void
  /**
   * App-side effects run once when the instance is installed into a Vue app
   * (after components are registered) — e.g. registering a directive.
   */
  install?: (context: PluginInstallContext) => void
}
```
