import fs from 'node:fs'
import path from 'node:path'

export interface AdapterLayerResult {
  rewrites: Record<string, string>
  srcExclude: string[]
}

/**
 * Resolves VitePress rewrites and excludes based on the active adapter.
 *
 * Convention: adapter overrides live in `_${adapterName}/` folders NEXT TO the
 * content they override (`components/_primevue/VfKnob.md` overrides
 * `components/VfKnob.md`; the root `_${adapterName}/index.md` overrides the
 * landing page). Override files are rewritten to the shared URL and the shared
 * file is excluded when an override exists; other adapters' `_*` folders are
 * excluded wholesale.
 */
export function resolveAdapterLayer(
  adapter: string,
  srcDir: string,
  adapterNames: string[]
): AdapterLayerResult {
  const rewrites: Record<string, string> = {}
  const srcExclude: string[] = []

  function handleAdapterDir(dir: string, relDir: string, name: string) {
    if (name !== adapter) {
      srcExclude.push(relDir ? `${relDir}/**` : `_${name}/**`)
      return
    }
    const parentRel = path.dirname(relDir) === '.' ? '' : path.dirname(relDir)
    const walkOverrides = (d: string, rel: string) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name)
        const relPath = rel ? `${rel}/${entry.name}` : entry.name
        if (entry.isDirectory()) {
          walkOverrides(full, relPath)
        } else if (entry.name.endsWith('.md')) {
          const target = parentRel ? `${parentRel}/${relPath}` : relPath
          rewrites[`${relDir}/${relPath}`] = target
          if (fs.existsSync(path.join(srcDir, target))) {
            srcExclude.push(target)
          }
        }
      }
    }
    walkOverrides(dir, '')
  }

  function scan(dir: string, rel: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const full = path.join(dir, entry.name)
      const relPath = rel ? `${rel}/${entry.name}` : entry.name
      const m = entry.name.match(/^_(.+)$/)
      if (m && adapterNames.includes(m[1])) {
        handleAdapterDir(full, relPath, m[1])
      } else if (!entry.name.startsWith('.')) {
        scan(full, relPath)
      }
    }
  }
  scan(srcDir, '')

  return { rewrites, srcExclude }
}
