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

const { name, version } = JSON.parse(
  readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), 'package.json'),
    'utf-8'
  )
)
const banner = `/*!\n * ${name} v${version}\n * (c) 2020-present Adam Berecz\n * @license MIT\n */\n`

export default {
  externals: ['@vueform/core', ...adapters],
  hooks: {
    'rollup:options'(_ctx: unknown, options: { output?: unknown }) {
      for (const output of [options.output].flat().filter(Boolean)) {
        ;(output as { banner?: string }).banner = banner
      }
    },
  },
}
