import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { promisify } from 'node:util'
import { brotliCompress, constants, gzip } from 'node:zlib'

import type { FileSize, Size } from './types'

const gzipAsync = promisify(gzip)
const brotliAsync = promisify(brotliCompress)

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

/**
 * Compressed sizes dominate the suite's runtime (brotli at max quality runs at
 * ~1 MB/s), so both compressions run async on the libuv threadpool — files
 * compress in parallel and a measurement can overlap the next scenario's
 * build. Identical outputs recur across scenarios (e.g. a code-split vendor
 * chunk every `all-minus-*` build re-emits byte-for-byte), so results are
 * memoized by content hash in the caller-provided per-run cache.
 */
async function sizeOf(
  buffer: Buffer,
  cache?: Map<string, Size>
): Promise<Size> {
  const key = cache
    ? createHash('sha1').update(buffer).digest('base64')
    : undefined
  const cached = key ? cache?.get(key) : undefined
  if (cached) return cached

  const [gzipped, brotli] = await Promise.all([
    gzipAsync(buffer, { level: 9 }),
    brotliAsync(buffer, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
      },
    }),
  ])

  const size: Size = {
    raw: buffer.length,
    gzip: gzipped.length,
    brotli: brotli.length,
  }
  if (key) cache?.set(key, size)
  return size
}

function sum(files: FileSize[], type?: FileSize['type']): Size {
  const subset = type ? files.filter((file) => file.type === type) : files
  return subset.reduce<Size>(
    (acc, file) => ({
      raw: acc.raw + file.raw,
      gzip: acc.gzip + file.gzip,
      brotli: acc.brotli + file.brotli,
    }),
    { raw: 0, gzip: 0, brotli: 0 }
  )
}

/**
 * Measures all JS and CSS assets of a build output directory.
 */
export async function measureDir(
  outDir: string,
  cache?: Map<string, Size>
): Promise<{
  files: FileSize[]
  js: Size
  css: Size
  total: Size
}> {
  const files = await Promise.all(
    walk(outDir)
      .filter((path) => /\.(m?js|css)$/.test(path))
      .map(async (path): Promise<FileSize> => {
        const buffer = readFileSync(path)
        return {
          file: relative(outDir, path),
          type: path.endsWith('.css') ? 'css' : 'js',
          ...(await sizeOf(buffer, cache)),
        }
      })
  )
  files.sort((a, b) => a.file.localeCompare(b.file))

  return {
    files,
    js: sum(files, 'js'),
    css: sum(files, 'css'),
    total: sum(files),
  }
}
