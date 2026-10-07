import type { HeadingProp } from '#src/types'

/**
 * Props shared by container-type elements that render a heading.
 */
export interface ContainerProps {
  /**
   * The heading level to render for the container's title.
   */
  heading?: HeadingProp
}
