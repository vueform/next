import type { KebabToPascal } from '@core/types'
import { warn } from './warn'

/**
 * Converts a string to camelCase.
 *
 * @param str The input string.
 */
export function toCamelCase(str: string) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toLowerCase())
}

/**
 * Converts a string to PascalCase.
 *
 * @param str The input string.
 */
export function toPascalCase(str: string) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toUpperCase())
}

/**
 * Converts a string to kebab-case.
 *
 * @param str The input string.
 */
export function toKebabCase(str: string) {
  return str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase()
  )
}

/**
 * Converts a camelCase string to kebab-case.
 *
 * @param str The camelCase input string.
 */
export function camelToKebab(str: string) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Converts a kebab-case string to PascalCase with typed return.
 *
 * @param input The kebab-case input string.
 */
export function kebabToPascal<T extends string>(input: T): KebabToPascal<T> {
  if (!input || typeof input !== 'string') {
    return '' as any
  }

  return input
    .split('-')
    .map((word) =>
      word.length === 0 ? '' : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('') as any
}

/**
 * Capitalizes the first character of a string.
 *
 * @param str The input string.
 */
export function upperFirst<T extends string>(str: T): Capitalize<T> {
  return (String(str).charAt(0).toUpperCase() + String(str).slice(1)) as any
}

/**
 * Uncapitalizes the first character of a string.
 *
 * @param str The input string.
 */
export function lowerFirst<T extends string>(str: T): Uncapitalize<T> {
  return (String(str).charAt(0).toLowerCase() + String(str).slice(1)) as any
}

/**
 * Escapes regex metacharacters so a string can be embedded in a `RegExp`
 * pattern literally.
 *
 * @param str The string to escape.
 */
export function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Parses a regex string in `/pattern/flags` format into a `RegExp` object.
 *
 * @param str The regex string to parse.
 */
export function stringToRegex(str: string) {
  const parts = str.match(/^\/(.+)\/([a-z]*)$/i)

  if (!parts) {
    warn('Invalid regex string format')
    return new RegExp('')
  }

  return new RegExp(parts[1] || '', parts[2])
}

/**
 * Whether a string contains markup an HTML parser would act on. Aligned with
 * the parser's own rule: `<` opens markup only when followed by a tag-start
 * character — a letter (element), `/` (closing tag), `!` (comment/doctype) or
 * `?` (bogus comment). A comparison like `score < 10` stays plain text, while
 * `a<b` genuinely opens a `<b>` element and is correctly flagged. Used to
 * decide whether a resolved string needs the sanitizer / HTML rendering at all
 * — plain text never should.
 *
 * @param value The string to test.
 */
export function containsHtml(value: string): boolean {
  return /<[a-zA-Z/!?]/.test(value)
}
