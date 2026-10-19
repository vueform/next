import { computed } from 'vue'

import { type makeElement } from '#src/features'
import { defineFeature } from '#src/helpers'
import type { ReturnsOf } from '#src/types'

/**
 * The HTML autofill field name tokens accepted by the `autocomplete`
 * attribute (WHATWG HTML spec), plus the `on` / `off` states.
 */
const AUTOCOMPLETE_TOKENS = new Set([
  'on',
  'off',
  'name',
  'honorific-prefix',
  'given-name',
  'additional-name',
  'family-name',
  'honorific-suffix',
  'nickname',
  'username',
  'new-password',
  'current-password',
  'one-time-code',
  'organization-title',
  'organization',
  'street-address',
  'address-line1',
  'address-line2',
  'address-line3',
  'address-level1',
  'address-level2',
  'address-level3',
  'address-level4',
  'country',
  'country-name',
  'postal-code',
  'cc-name',
  'cc-given-name',
  'cc-additional-name',
  'cc-family-name',
  'cc-number',
  'cc-exp',
  'cc-exp-month',
  'cc-exp-year',
  'cc-csc',
  'cc-type',
  'transaction-currency',
  'transaction-amount',
  'language',
  'bday',
  'bday-day',
  'bday-month',
  'bday-year',
  'sex',
  'url',
  'photo',
  'tel',
  'tel-country-code',
  'tel-national',
  'tel-area-code',
  'tel-local',
  'tel-local-prefix',
  'tel-local-suffix',
  'tel-extension',
  'email',
  'impp',
])

/**
 * Returns the element's name as a default `autocomplete` value when it spells
 * a valid HTML autofill token in kebab, snake, camel, or Pascal casing (e.g.
 * `given-name`, `given_name`, `givenName`, `GivenName` all resolve to
 * `given-name`), or `undefined` when it does not — an invalid token would be
 * ignored by browsers and flagged by audit tools.
 *
 * @param name The element's name attribute value.
 */
const autocompleteTokenOf = (name: unknown) => {
  if (typeof name !== 'string') return undefined

  const token = name
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()

  return AUTOCOMPLETE_TOKENS.has(token) ? token : undefined
}

/**
 * Configuration for the autocomplete factory resolving the input's
 * `autocomplete` attribute value.
 */
type MakeAutocompleteOptions = {
  props: {
    autocomplete: string | undefined
  }
  deps: ReturnsOf<[[typeof makeElement, ['name']]]>
}

/**
 * Resolves the input's `autocomplete` attribute: the explicit `autocomplete`
 * prop when given, otherwise the element's name when it is a valid HTML
 * autofill token (so fields named `email`, `tel`, `postal-code`, … get autofill
 * and WCAG 1.3.5 support out of the box).
 *
 * @param options Factory options containing autocomplete props and
 *   dependencies.
 */
export const makeAutocomplete = defineFeature(
  () =>
    ({ props, deps }: MakeAutocompleteOptions) => {
      const { name } = deps

      // ============== COMPUTED ==============

      /**
       * The resolved `autocomplete` attribute value, or `undefined` when no
       * prop is given and the element's name is not a valid autofill token.
       */
      const autocomplete = computed(
        () => props.autocomplete ?? autocompleteTokenOf(name.value)
      )

      return {
        autocomplete,
      }
    }
)
