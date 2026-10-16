```ts
/**
 * Tooltip directive for Vueform PrimeVue components. Resolves to PrimeVue's
 * VDOM ObjectDirective in the main dist, or a vapor function directive in the
 * vapor dist / vapor playground / vapor tests (`__VUEFORM_VAPOR__`).
 */
const vTooltip:
  | ((
      el: Element,
      value?: () => any,
      argument?: string,
      modifiers?: Record<string, boolean>
    ) => () => void)
  | ObjectDirective<any, any, string, any>
```
