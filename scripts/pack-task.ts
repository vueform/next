/**
 * Standalone tarball packing (`vpr :pack`): packs every publishable
 * package into `.vueform/tarballs` via the smoke harness's pack step. The
 * vp task caches on the dists and manifests, so `:test-smoke` and
 * `:test-smoke-types` (which run the suites with `--nopack`) only repack
 * when something changed.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { packWorkspace } from '@vueform/utils/smoke'

const repoRoot = path.resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '..'
)

const tarballs = await packWorkspace(
  repoRoot,
  path.join(repoRoot, '.vueform', 'tarballs'),
  { onStatus: (text) => console.log(`[pack] ${text}`) }
)
console.log(`[pack] ${tarballs.byName.size} tarballs in ${tarballs.dir}`)
