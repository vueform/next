/**
 * Invariant: every component's styles.ts imports the theme chunk(s) providing
 * each vf-* class the component can emit — see utils' verifyCssImports.ts for
 * the full rules (compound gating, layout baseline, whitelist).
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { verifyCssImports } from '@vueform/utils'
import { describe, expect, it } from 'vitest'

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const { components } = verifyCssImports({ packageDir })

describe('styles.ts imports cover emitted classes', () => {
  for (const { name, errors } of components) {
    it(name, () => {
      expect(errors).toEqual([])
    })
  }
})
