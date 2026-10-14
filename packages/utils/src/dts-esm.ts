/**
 * Appends the explicit extensions node16/nodenext ESM declaration resolution
 * requires. The packages are `"type": "module"`, so consumers on those modes
 * read the shipped d.ts as ESM, where a relative specifier without a
 * `.js`-family extension (or with `.vue`, which cannot map to the emitted
 * `.vue.d.ts`) fails to resolve. `<spec>.js` maps back to `<spec>.d.ts`;
 * directory imports become `<spec>/index.js`. Shared by the `vf:dts-rewrites`
 * build pass and the shorthands generator (which writes d.ts after that pass
 * ran).
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const HAS_EXT = /\.(?:js|mjs|cjs|ts|mts|json|css|scss)$/

/**
 * Fixes every relative specifier in the given d.ts `content` (`abs` is the
 * file's on-disk path, used to resolve the specifiers). A specifier that
 * resolves to neither a `.d.ts` nor a directory index is a broken declaration
 * — throws.
 */
export function dtsEsmExtensionFix(abs: string, content: string): string {
  const fix = (match: string, lead: string, quote: string, raw: string) => {
    if (HAS_EXT.test(raw)) return match
    // Bare directory references ('.', '..', './', '../') normalize to a
    // clean prefix for the '/index.js' suffix.
    const spec = raw.replace(/\/$/, '')
    const target = join(abs, '..', spec)
    if (existsSync(`${target}.d.ts`)) {
      return `${lead}${quote}${spec}.js${quote}`
    }
    if (existsSync(join(target, 'index.d.ts'))) {
      return `${lead}${quote}${spec}/index.js${quote}`
    }
    throw new Error(
      `[vf:dts-rewrites] Relative specifier ${raw} in ${abs} resolves to neither a .d.ts nor a directory index`
    )
  }

  return content
    .replace(
      /\b(from\s+|import\s+(?=['"])|import\s*\(\s*)(['"])(\.{1,2}(?:\/[^'"]*)?)\2/g,
      fix
    )
    .replace(/\b(declare\s+module\s+)(['"])(\.{1,2}(?:\/[^'"]*)?)\2/g, fix)
}
