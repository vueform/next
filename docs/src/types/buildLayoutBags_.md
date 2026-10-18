```ts
/**
 * Binding bags for the layout-rendered parts (label, help, description,
 * error) so slot users replacing those regions keep the id relationships the
 * input's `aria-describedby` points at.
 *
 * @param ids Resolved ids of the layout regions.
 */
const buildLayoutBags: (ids: {
  labelId: string
  helpId: string
  descriptionId: string
  errorId: string
}) => A11yLayoutBags
```
