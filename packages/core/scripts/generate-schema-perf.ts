/**
 * Generates the types-perf fixtures:
 *
 * - `tests/perf/types/define-schema-500.ts` — 500 leaf elements across 2 nesting
 *   levels of `group` containers.
 * - `tests/perf/types/define-schema-validation-500.ts` — the same schema with a
 *   Standard Schema second argument, forcing `MatchesSchemaModel` across all
 *   500 (flattened) leaves.
 *
 * Usage: pnpm --dir packages/core gen:schema-perf
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const LEAVES = 500
const PER_GROUP = 10
const ROOTS = LEAVES / PER_GROUP // 50
const NESTED = 1

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(rootDir, 'tests/perf/types')
const samplePath = 'g00.g00_00.g00_00_e00'
const sampleLeaf = 'g00_00_e00'

const schemaLines: string[] = ['const schema = defineSchema({']

for (let r = 0; r < ROOTS; r++) {
  const g = `g${String(r).padStart(2, '0')}`
  schemaLines.push(`  ${g}: {`)
  schemaLines.push(`    type: 'group',`)
  schemaLines.push(`    schema: {`)
  for (let n = 0; n < NESTED; n++) {
    const ng = `${g}_${String(n).padStart(2, '0')}`
    schemaLines.push(`      ${ng}: {`)
    schemaLines.push(`        type: 'group',`)
    schemaLines.push(`        schema: {`)
    for (let e = 0; e < PER_GROUP; e++) {
      const el = `${ng}_e${String(e).padStart(2, '0')}`
      schemaLines.push(`          ${el}: { type: 'text' },`)
    }
    schemaLines.push(`        },`)
    schemaLines.push(`      },`)
  }
  schemaLines.push(`    },`)
  schemaLines.push(`  },`)
}
schemaLines.push('})')

const body = `/*
 * TS performance fixture: defineSchema with ${LEAVES} leaf elements across
 * 2 nesting levels of \`group\` containers (${ROOTS} root groups ×
 * ${NESTED} nested group × ${PER_GROUP} leaves).
 *
 * Leaves only carry \`type\`; groups only carry \`type\` + \`schema\`.
 * Forces Paths / SchemaToModel / ElementByPath so the measurement covers
 * the full registry-driven schema stack.
 *
 * Measure:
 *   pnpm --dir packages/core tsc:types:perf
 */
import {
  defineSchema,
  type ElementByPath,
  type Paths,
  type SchemaToModel,
} from '@vueform/core'
import '@vueform/core/components'

${schemaLines.join('\n')}

type S = typeof schema
type P = Paths<S>
type M = SchemaToModel<S>

type Found = ElementByPath<S, '${samplePath}'>
type FoundModel = Found['model']
type PathExists = '${samplePath}' extends P ? true : false
type LeafModel = M['${sampleLeaf}']

declare const _paths: P
declare const _model: M
declare const _found: Found
declare const _foundModel: FoundModel
declare const _pathExists: PathExists
declare const _leafModel: LeafModel

void schema
void _paths
void _model
void _found
void _foundModel
void _pathExists
void _leafModel

export {}
`

// Same schema with a Standard Schema second argument. Groups are non-nested,
// so the model flattens to the 500 leaf keys — the Standard Schema's input
// declares all of them, forcing MatchesSchemaModel to strip and compare every
// key.
const inputLines: string[] = ['type Input = {']
for (let r = 0; r < ROOTS; r++) {
  const g = `g${String(r).padStart(2, '0')}`
  for (let n = 0; n < NESTED; n++) {
    const ng = `${g}_${String(n).padStart(2, '0')}`
    for (let e = 0; e < PER_GROUP; e++) {
      inputLines.push(`  ${ng}_e${String(e).padStart(2, '0')}: string`)
    }
  }
}
inputLines.push('}')

const validationBody = `/*
 * TS performance fixture: the define-schema-500 schema with a Standard Schema
 * second argument whose input type declares all ${LEAVES} (flattened) leaf
 * keys, forcing MatchesSchemaModel to strip and compare every key on top of
 * the regular schema validation.
 *
 * Measure:
 *   pnpm --dir packages/core tsc:perf -- define-schema-validation-500
 */
import { defineSchema, type StandardSchemaV1 } from '@vueform/core'
import '@vueform/core/components'

${inputLines.join('\n')}

declare const standardSchema: StandardSchemaV1<Input>

${schemaLines.join('\n').replace(/\}\)$/, '}, standardSchema)')}

void schema

export {}
`

mkdirSync(outDir, { recursive: true })
const out = join(outDir, 'define-schema-500.ts')
writeFileSync(out, body)
console.log(`wrote ${out}`)

const validationOut = join(outDir, 'define-schema-validation-500.ts')
writeFileSync(validationOut, validationBody)
console.log(`wrote ${validationOut}`)
