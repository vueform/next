import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { brotliCompressSync, constants, gzipSync } from 'node:zlib'

import type { FileSize, Size } from './types'

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? walk(path) : [path]
  })
}

function sizeOf(buffer: Buffer): Size {
  return {
    raw: buffer.length,
    gzip: gzipSync(buffer, { level: 9 }).length,
    brotli: brotliCompressSync(buffer, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
      },
    }).length,
  }
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
export function measureDir(outDir: string): {
  files: FileSize[]
  js: Size
  css: Size
  total: Size
} {
  const files = walk(outDir)
    .filter((path) => /\.(m?js|css)$/.test(path))
    .map<FileSize>((path) => ({
      file: relative(outDir, path),
      type: path.endsWith('.css') ? 'css' : 'js',
      ...sizeOf(readFileSync(path)),
    }))
    .sort((a, b) => a.file.localeCompare(b.file))

  return {
    files,
    js: sum(files, 'js'),
    css: sum(files, 'css'),
    total: sum(files),
  }
}
