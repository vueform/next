```ts
/**
 * Binding entries for the layout-rendered parts (label, help, description,
 * error) so slot users replacing those regions keep the id relationships the
 * input's `aria-describedby` points at.
 *
 * @param api The component api carrying the layout region ids.
 */
const layoutRegionBindings: (
  api: Pick<
    LayoutPatternApi,
    'labelId' | 'helpId' | 'descriptionId' | 'errorId'
  >
) => BindingDefsOf<LayoutRegionBindings>
```
