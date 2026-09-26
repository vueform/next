import type {
  ColumnsProp,
  ComponentProp,
  ThemeTokens,
  ExpressionsProp,
  PageProp,
  TProp,
} from '#core/types'

/**
 * @write
 */
export interface LayoutProps<TContext = any> {
  /**
   * The label displayed alongside the element.
   */
  label?: TProp<string, TContext>

  /**
   * Page configuration for stepped/tabbed forms. Accepts a simple label or a
   * metadata tuple with at least a `label` property.
   */
  page?: PageProp<TContext>

  /**
   * A help text displayed below the label.
   */
  help?: TProp<string, TContext>

  /**
   * A description text displayed below the element.
   */
  description?: TProp<string, TContext>

  /**
   * Token overrides applied to the element's CSS custom properties.
   */
  tokens?: ThemeTokens

  /**
   * Custom layout template for this element, `false` to render the element
   * without any layout wrapper, or `true` (default) for normal layout.
   */
  layout?: ComponentProp | boolean

  /**
   * Whether to visually hide the element's label.
   */
  hideLabel?: boolean

  /**
   * Responsive grid column sizing for the element's layout.
   */
  columns?: ColumnsProp<TContext> // @expr

  /**
   * Controls which props allow dynamic expression resolution. Set to `false` to
   * disable all expression evaluation, `true` to enable for all expressionable
   * props, or an array of prop keys to enable selectively.
   */
  expressions?: ExpressionsProp

  /**
   * Adds vertical spacing (padding) above the element. The value maps to a
   * spacing token (1-3): `1` = `var(--vf-space-1)`, ....
   */
  spaceTop?: number

  /**
   * Adds vertical spacing (padding) above the element. The value maps to a
   * spacing token (1-3): `1` = `var(--vf-space-1)`, ....
   */
  spaceBottom?: number

  /**
   * Renders a horizontal line (border) above the element.
   */
  lineTop?: boolean

  /**
   * Renders a horizontal line (border) below the element.
   */
  lineBottom?: boolean
}
