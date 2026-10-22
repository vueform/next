import { escapeRegExp } from '#src/utils'

/**
 * A compiled `$security.safePropRefs` pattern. The first segment matches the
 * prop name itself (with `*` spanning any characters inside the segment, so
 * `*propName` / `propName*` work); the remaining segments describe allowed
 * nesting: `*` matches one level, `**` (final only) matches one or more, and
 * anything else must match the level literally (`*` allowed within, like the
 * name segment). Trailing `*` segments are optional — `propName.*.*` covers one
 * or two levels — while static segments and `**` are not. A standalone `**`
 * pattern matches every prop at every depth.
 */
export type PropRefPattern = {
  all: boolean
  name: RegExp
  nested: (RegExp | '*' | '**')[]
}

function segmentMatcher(segment: string): RegExp | null {
  if (!segment) return null
  return new RegExp(`^${segment.split('*').map(escapeRegExp).join('[^.]*')}$`)
}

/**
 * Compiles one `safePropRefs` entry, or `null` when it isn't a valid pattern
 * (an empty segment, or `**` anywhere but alone / as the final segment) — an
 * invalid entry must never compile into something broader than written.
 *
 * @param pattern The raw (or expression-resolved) entry.
 */
export function compilePropRefPattern(pattern: string): PropRefPattern | null {
  const segments = pattern.split('.')

  if (segments[0] === '**') {
    return segments.length === 1 ? { all: true, name: /^/, nested: [] } : null
  }

  const name = segmentMatcher(segments[0])

  if (!name) return null

  const nested: PropRefPattern['nested'] = []

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i]

    if (segment === '*') {
      nested.push('*')
      continue
    }

    if (segment === '**') {
      if (i !== segments.length - 1) return null
      nested.push('**')
      continue
    }

    const matcher = segmentMatcher(segment)

    if (!matcher) return null

    nested.push(matcher)
  }

  return { all: false, name, nested }
}

/**
 * Whether a referenced prop path matches a compiled pattern. `segments` is the
 * normalized prop path (`[n]` index access already converted to dot segments).
 *
 * @param pattern The compiled pattern.
 * @param segments The prop path segments (`['model', '0']` for `@model[0]`).
 */
export function matchesPropRef(
  pattern: PropRefPattern,
  segments: string[]
): boolean {
  if (pattern.all) return true

  if (!segments.length || !pattern.name.test(segments[0])) return false

  let j = 1

  for (let i = 0; i < pattern.nested.length; i++) {
    const seg = pattern.nested[i]

    if (seg === '**') return segments.length - j >= 1

    if (j >= segments.length) {
      // Trailing `*` segments are optional (`propName.*.*` covers one or two
      // levels); a remaining static segment or `**` means the path is short.
      for (let k = i; k < pattern.nested.length; k++) {
        if (pattern.nested[k] !== '*') return false
      }

      return true
    }

    if (seg !== '*' && !seg.test(segments[j])) return false

    j++
  }

  return j === segments.length
}
