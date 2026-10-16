```ts
/**
 * Optional extension callback that may add or overwrite members on the
 * blueprint API before plugins run. May return nothing when it only registers
 * hooks/watchers.
 */
type BlueprintExtension<
  TApi extends Record<string, any>,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any>,
  TExt = void,
> = (api: TApi, props: TProps, events: TEvents) => TExt
```
