```ts
/**
 * Part-keyed binding definitions of the VfNav component, registered via
 * `useBindings`. Zero-argument resolver entries — resolved at each part's
 * consuming site, keys stay static.
 */
interface VfNavBindings extends NavBindings {
  /**
   * The root navigation element's position variant and the marker set while
   * the back button is hidden on the first page.
   */
  root: {
    'data-position'?: NavPosProp
    'data-no-back'?: ''
  }

  /**
   * ARIA state for the back navigation control.
   */
  back: {
    'aria-disabled'?: true
  }

  /**
   * The next button's loading state and ARIA state.
   */
  next: {
    'data-loading'?: ''
    'aria-busy'?: true
    'aria-disabled'?: true
    'aria-describedby'?: string
  }

  /**
   * The finish button's loading state and ARIA state.
   */
  finish: {
    'data-loading'?: ''
    'aria-busy'?: true
    'aria-disabled'?: true
    'aria-describedby'?: string
  }

  /**
   * The screen-reader status region's id and role, keyed to the sr-only
   * loading span it binds to.
   */
  srOnlyLoading: {
    id: string
    role: 'status'
  }
}
```
