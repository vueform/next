```ts
/**
 * Accessibility bindings of the nav component.
 */
interface NavA11y extends BaseComponentA11y {
  /**
   * ARIA state for the back navigation control.
   */
  back: {
    'aria-disabled'?: true
  }

  /**
   * ARIA state for the next navigation control.
   */
  next: {
    'aria-busy'?: true
    'aria-disabled'?: true
    'aria-describedby'?: string
  }

  /**
   * ARIA state for the finish navigation control.
   */
  finish: {
    'aria-busy'?: true
    'aria-disabled'?: true
    'aria-describedby'?: string
  }

  /**
   * The screen-reader status region's id and role.
   */
  status: {
    id: string
    role: 'status'
  }
}
```
