/**
 * Repo cleaner (`pnpm clean`): removes `node_modules` directories and
 * `*.tsbuildinfo` files from the repo root, its direct subfolders, and
 * `packages/*` subfolders. Deliberately shallow — it does not descend
 * further, so nested dependency trees are never scanned.
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

const removed: string[] = []

for (const dir of targets) {
  const nodeModules = path.join(dir, 'node_modules')
  if (fs.existsSync(nodeModules)) {
    fs.rmSync(nodeModules, { recursive: true, force: true })
    removed.push(path.relative(repoRoot, nodeModules))
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.tsbuildinfo')) continue
    const file = path.join(dir, entry.name)
    fs.rmSync(file, { force: true })
    removed.push(path.relative(repoRoot, file))
  }
}

if (removed.length) {
  for (const item of removed) console.log(`[clean] removed ${item}`)
} else {
  console.log('[clean] nothing to remove')
}
