```ts
/**
 * Styling modifiers of the VfButton component.
 */
interface VfButtonModifiers extends ButtonModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The button control's variant, state, and layout attributes. `data-disabled`
   * is set only in anchor mode (`href`/`to`), where no native `disabled`
   * attribute exists.
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
  }

  /**
   * The icon's position relative to the label.
   */
  icon: {
    'data-pos'?: VfButtonProps['iconPos']
  }
}
```
