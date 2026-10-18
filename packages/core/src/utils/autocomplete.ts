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
 * Returns the element's name as a default `autocomplete` value when it is a
 * valid HTML autofill token (so fields named `email`, `tel`, `postal-code`, …
 * get autofill and WCAG 1.3.5 support out of the box), or `undefined` when it
 * is not — an invalid token would be ignored by browsers and flagged by audit
 * tools.
 *
 * @param name The element's name attribute value.
 */
export const autocompleteTokenOf = (name: unknown) =>
  typeof name === 'string' && AUTOCOMPLETE_TOKENS.has(name.toLowerCase())
    ? name.toLowerCase()
    : undefined
