```ts
/**
 * Resolves tooltip content, position modifiers, and directive bindings for
 * input elements.
 *
 * @param options Factory options containing element props.
 */
const makeTooltip: (
  config?: MakeTooltipConfig | undefined
) => (options: MakeTooltipOptions) => {
  tooltip: ComputedRef<string | (string & {}) | undefined>
  tooltipModifiers: ComputedRef<{
    position: TooltipPosProp | undefined
    event: 'focus' | 'hover'
  }>
  tooltipValue: ComputedRef<{ value: string | (string & {}) | undefined }>
}
```
