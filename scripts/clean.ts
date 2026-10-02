/**
 * Repo cleaner (`pnpm clean`): removes `node_modules` directories and
 * `*.tsbuildinfo` files from the repo root, its direct subfolders, and
 * `packages/*` subfolders, plus each package's `dist` and the VitePress
 * `docs/.vitepress/{dist,cache}` outputs. Deliberately shallow — it does not
 * descend further, so nested dependency trees are never scanned.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
)

const listDirs = (dir: string): string[] => {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name))
}

const targets = [
  repoRoot,
  ...listDirs(repoRoot).filter((dir) => path.basename(dir) !== 'node_modules'),
  ...listDirs(path.join(repoRoot, 'packages')),
]

const extraDirs = [
  ...listDirs(path.join(repoRoot, 'packages')).map((dir) =>
    path.join(dir, 'dist')
  ),
  path.join(repoRoot, 'docs', '.vitepress', 'dist'),
  path.join(repoRoot, 'docs', '.vitepress', 'cache'),
]

const removed: string[] = []

const removeDir = (dir: string) => {
  if (!fs.existsSync(dir)) return
  fs.rmSync(dir, { recursive: true, force: true })
  removed.push(path.relative(repoRoot, dir))
}

for (const dir of targets) {
  removeDir(path.join(dir, 'node_modules'))

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.tsbuildinfo')) continue
    const file = path.join(dir, entry.name)
    fs.rmSync(file, { force: true })
    removed.push(path.relative(repoRoot, file))
  }
}

for (const dir of extraDirs) removeDir(dir)

if (removed.length) {
  for (const item of removed) console.log(`[clean] removed ${item}`)
} else {
  console.log('[clean] nothing to remove')
}
