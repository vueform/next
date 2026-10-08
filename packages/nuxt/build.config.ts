import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const packagesDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const adapters = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => resolve(packagesDir, entry.name, 'package.json'))
  .filter((pkgPath) => existsSync(pkgPath))
  .map((pkgPath) => JSON.parse(readFileSync(pkgPath, 'utf-8')))
  .filter((pkg) => pkg.vueform?.group === 'adapters')
  .map((pkg) => pkg.name as string)

export default {
  externals: ['@vueform/core', ...adapters],
}
