import { defineDefaults, type DefineEvents } from '~/helpers'
import type {
  BaseComponentEmits,
  BaseComponentProps,
  BaseComponentParts,
  BaseComponentSlots,
  BaseComponentExpose,
  BaseComponentClasses,
  ResolvedLanguagesProp,
  LooseRequired,
} from '~/types'

/**
 * Props for the languages component blueprint that renders a language selector
 * for multilingual forms.
 */
export interface LanguagesProps<
  S = LanguagesSlots,
  P = LanguagesParts,
  C = LanguagesClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The currently active language code.
   */
  language: string

  /**
   * The available languages as a map of language codes to display names.
   */
  languages: ResolvedLanguagesProp

  /**
   * Set of language codes that currently have validation errors.
   */
  invalidLanguages?: Set<string>
}

/**
 * Events emitted by the languages component.
 */
export interface LanguagesEmits<
  TContext = any,
> extends BaseComponentEmits<TContext> {
  /**
   * Emitted when a language is selected by the user.
   *
   * @param language The selected language code.
   */
  select: [language: string]
}

/**
 * Slots of the languages component.
 */
export interface LanguagesSlots<
  TContext = any,
> extends BaseComponentSlots<TContext> {}

/**
 * Parts of the languages component.
 */
export interface LanguagesParts extends BaseComponentParts {}

/**
 * CSS classes of the languages component.
 */
export interface LanguagesClasses extends BaseComponentClasses {}

/**
 * Augmentable public API surface for languages-based components.
 */
export interface LanguagesExpose extends BaseComponentExpose, LanguagesApi {}

/**
 * Factory API produced by the languages blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type LanguagesApi<TProps extends LanguagesProps = LanguagesProps> =
  ReturnType<typeof blueprint<TProps>>

/**
 * Builds the languages selector factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 */
export function blueprint<TProps extends LanguagesProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<LanguagesEmits>
) {
  /**
   * Handles language selection by firing the `select` event.
   *
   * @param language The selected language code.
   */
  const handleSelect = (language: string) => events.fire('select', language)

  return {
    handleSelect,
  }
}

/**
 * Default prop values for the languages blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<LanguagesProps>()({})
