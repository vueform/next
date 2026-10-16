```ts
/**
 * Typed options for defining a Vueform plugin, with component targeting via
 * `$apply`.
 */
type VueformPluginOptions<T extends PluginApplyName> = {
  name?: string
  apply?: T | ReadonlyArray<T>
  props?: ComponentPropsOptions
  emits?: string[]
  plugins?: VueformPlugin[]
  extend?: (
    props: Readonly<
      T extends '*' | RegExp
        ? PropsOf<ComponentNames>
        : T extends '*element'
          ? PropsOf<ElementNames>
          : T extends ComponentNames
            ? PropsOf<T>
            : any
    >,
    api: (T extends '*' | RegExp
      ? RawContextOf<ComponentNames>
      : T extends '*element'
        ? RawContextOf<ElementNames>
        : T extends ComponentNames
          ? RawContextOf<T>
          : any) &
      DefineEvents<any>
  ) => void | Record<string, any>
  config?: (config: VueformConfig) => void
  globals?: (context: GlobalsHookContext) => Partial<VueformGlobals> | void
  install?: (context: PluginInstallContext) => void
}
```
