```ts
/**
 * Plugin options variant where `apply` is a predicate function for custom
 * component matching.
 */
type VueformPluginOptionsWithApplyFn = {
  name?: string
  props?: ComponentPropsOptions
  emits?: string[]
  plugins?: VueformPlugin[]
  apply: (component: ComponentOptions) => boolean
  extend?: (props: any, api: any) => void | Record<string, any>
  config?: (config: VueformConfig) => void
  globals?: (context: GlobalsHookContext) => Partial<VueformGlobals> | void
  install?: (context: PluginInstallContext) => void
}
```
