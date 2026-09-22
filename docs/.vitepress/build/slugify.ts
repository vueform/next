/**
 * Heading slugs: Title Case words become kebab-case (`Some Header Title` →
 * `some-header-title`), while camelCase / PascalCase identifiers stay as-is
 * (`onChange`, `VfForm`).
 */
export function slugifyHeading(str: string): string {
  return str
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(
      /[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'\u201C\u201D\u2018\u2019<>,?/]+/g,
      '-'
    )
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .map((token) => (isIdentifierToken(token) ? token : token.toLowerCase()))
    .join('-')
    .replace(/^(\d)/, '_$1')
}

function isIdentifierToken(token: string): boolean {
  return (
    /[a-z]/.test(token) && /[A-Z]/.test(token) && !/^[A-Z][a-z]+$/.test(token)
  )
}
