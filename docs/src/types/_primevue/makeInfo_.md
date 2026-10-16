```ts
/**
 * Resolves the informational helper text and tooltip position for input
 * elements.
 *
 * @param options Factory options containing element props.
 */
const makeInfo: (
  config?: unknown
) => (options: MakeInfoOptions) => {
  info: ComputedRef<string | (string & {}) | undefined>
  infoPosition: Readonly<Ref<TooltipPosProp, TooltipPosProp>>
}
```
