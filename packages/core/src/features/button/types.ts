import type { DProp, LooseContext, TProp } from '#core/types'

/**
 * @write
 */
export interface BtnProps<TContext = any> {
  /**
   * The label text displayed on the button.
   */
  text?: TProp<string, TContext>

  /**
   * The action performed when the button is clicked. Use `'submit'` to submit
   * the parent form or `'reset'` to reset it. Custom string values can be used
   * for application-specific actions handled via the `click` event.
   */
  action?: 'submit' | 'reset' | (string & {})

  /**
   * Horizontal alignment of the button within its container.
   */
  align?: 'left' | 'center' | 'right'

  /**
   * The icon to display inside the button.
   */
  icon?: DProp<string, TContext>

  /**
   * The position of the icon relative to the button label.
   */
  iconPos?: 'left' | 'right' | 'top' | 'bottom'

  /**
   * When set the button renders as an `<a>` element instead of `<button>`.
   */
  href?: TProp<string, TContext>

  /**
   * The `target` attribute for the anchor element.
   */
  target?: string

  /**
   * The `rel` attribute for the anchor element.
   */
  rel?: string

  /**
   * The `download` attribute for the anchor element.
   */
  download?: string | boolean

  /**
   * Route location to navigate to when using `vue-router`.
   */
  to?: TProp<string, TContext>

  /**
   * Whether the button spans the full width of its container.
   */
  fluid?: boolean
}

/**
 * @write
 */
export interface BtnEmits {
  /**
   * Emitted when the button is clicked.
   *
   * @param event The native mouse event.
   * @param context$ The element's component context.
   */
  click: [event: MouseEvent, context$: LooseContext]
}
