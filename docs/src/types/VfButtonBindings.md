```ts
/**
 * Part-keyed binding definitions of the VfButton component, registered via
 * `useBindings` in the SFC (VfButton is the only consumer, so the entries are
 * defined there rather than as a shared pattern) together with the
 * `layoutRegionBindings` entries. Zero-argument resolver entries — resolved
 * at each part's consuming site, keys stay static.
 */
interface VfButtonBindings extends ButtonBindings, LayoutRegionBindings {
  /**
   * The button control's variant, state, and layout attributes plus its
   * native/ARIA state: native `disabled` on `<button>`, `aria-disabled` and
   * `data-disabled` in anchor mode (`href`/`to`), busy state, the icon-only
   * accessible name, and describedby.
   */
  button: {
    'data-variant'?: VfButtonProps['variant']
    'data-severity'?: DPropValue<VfButtonProps['severity']>
    'data-size'?: VfButtonProps['size']
    'data-align'?: VfButtonProps['align']
    'data-fluid'?: ''
    'data-icon-only'?: ''
    'data-loading'?: ''
    'data-disabled'?: ''
    disabled?: true
    'aria-disabled'?: true
    'aria-busy'?: true
    'aria-label'?: string
    'aria-describedby'?: string
  }

  /**
   * The icon's position relative to the label.
   */
  icon: {
    'data-pos'?: VfButtonProps['iconPos']
  }
}
```
