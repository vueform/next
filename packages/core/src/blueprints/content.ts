import { computed } from 'vue'

import {
  useDynamicProp,
  useFeatures,
  useMessageBag,
  useSecurity,
} from '#core/composables'
import {
  makeElement,
  makeLayout,
  type AlignedProps,
  type BaseElementEmits,
  type BaseElementProps,
  type BaseElementParts,
  type BaseElementClasses,
  type BaseElementExpose,
  type BaseElementSlots,
  type LayoutProps,
} from '#core/features'
import { defineDefaults, type DefineEvents } from '#core/helpers'
import type { AlignProp, LooseRequired, TProp } from '#core/types'
import { containsHtml } from '#core/utils'

/**
 * Props for the content element blueprint.
 */
export interface ContentProps<
  T extends string = 'content',
  S = ContentSlots,
  P = ContentParts,
  C = ContentClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    AlignedProps {
  /**
   * The text content rendered inside the element.
   */
  content?: TProp<string, TContext>

  /**
   * Horizontal alignment of the element within its layout container.
   */
  align?: AlignProp
}

/**
 * Events emitted by the content element.
 */
export interface ContentEmits<
  TContext = any,
> extends BaseElementEmits<TContext> {}

/**
 * Slots for the content element.
 */
export interface ContentSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Parts for the content element.
 */
export interface ContentParts extends BaseElementParts {}

/**
 * Classes for the content element.
 */
export interface ContentClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for content-based components.
 */
export interface ContentExpose extends BaseElementExpose, ContentApi {}

/**
 * Factory API produced by the content blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type ContentApi<
  TProps extends ContentProps<string> = ContentProps<string>,
> = ReturnType<typeof blueprint<TProps>>

/**
 * Builds the content factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends ContentProps<string>>(
  props: LooseRequired<TProps>,
  events: DefineEvents<ContentEmits>
) {
  const messageBag = useMessageBag()

  const api = useFeatures(props, events)
    .use(makeElement())
    .use(makeLayout())
    .build()

  /**
   * The reactive list of validation error messages.
   */
  const displayErrors = messageBag.errors

  /**
   * The reactive list of validation error messages.
   */
  const errors = displayErrors

  /**
   * The reactive list of informational messages.
   */
  const messages = messageBag.messages

  // ============== COMPUTED ==============

  const $security = useSecurity()

  /**
   * The resolved text content for the element — sanitized in the resolution
   * pipeline after localization and expressions, and only when the resolved
   * string actually contains markup, so plain text never enters the engine.
   */
  const content = useDynamicProp('content', props, {
    localize: true,
    sanitize: true,
  })

  /**
   * Whether the content renders as HTML.
   *
   * `$security.allowHtml: ['content']` must list the area, so no schema entry
   * can grant itself HTML rendering. When refused, the markup renders as
   * escaped text instead. Markup-free content never consults the gate — it
   * renders identically either way.
   */
  const isHtml = computed(
    () =>
      typeof content.value === 'string' &&
      containsHtml(content.value) &&
      $security.allowsHtml('content')
  )

  /**
   * The HTML tag used to render the content wrapper.
   */
  const tag = computed(() => {
    return 'div'
  })

  return {
    ...api,
    messageBag,
    content,
    displayErrors,
    errors,
    isHtml,
    messages,
    tag,
  }
}

/**
 * Default prop values for the content blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<ContentProps>()({
  type: 'content',
  layout: true,
  conditions: undefined,
  expressions: undefined,
})
