import {
  clone as cloneImport,
  equals as equalsImport,
  get as getImport,
  merge as mergeImport,
  mergeClass as mergeClassImport,
  set as setImport,
} from '@vueform/core'
import { describe, test } from 'vitest'

// Module exports are getters under vitest's module runner; locals keep the
// bench loops from paying (and being flagged for) getter overhead per call.
const clone = cloneImport
const equals = equalsImport
const get = getImport
const merge = mergeImport
const mergeClass = mergeClassImport
const set = setImport

/**
 * Pure-function microbenches on the hot utilities that run per element and per
 * update — no DOM, no component tree, the most stable A/B signal in the suite.
 */

function deepFixture(breadth: number, depth: number): Record<string, unknown> {
  if (!depth) return { value: 'leaf', count: depth, flag: true }

  const node: Record<string, unknown> = {}
  for (let i = 0; i < breadth; i++) {
    node[`key_${i}`] = deepFixture(breadth, depth - 1)
  }
  return node
}

const base = deepFixture(5, 4)
const overlay = deepFixture(5, 4)
const copy = clone(base)

describe('object utils', () => {
  test('merge two deep objects', async ({ bench }) => {
    await bench('merge two deep objects', () => {
      merge(clone(base), overlay)
    }).run()
  })

  test('clone a deep object', async ({ bench }) => {
    await bench('clone a deep object', () => {
      clone(base)
    }).run()
  })

  test('equals on equal deep objects', async ({ bench }) => {
    await bench('equals on equal deep objects', () => {
      equals(base, copy)
    }).run()
  })
})

describe('path utils', () => {
  const data = deepFixture(5, 4)

  test('get 100 deep paths', async ({ bench }) => {
    await bench('get 100 deep paths', () => {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          for (let k = 0; k < 4; k++) {
            get(data, `key_${i}.key_${j}.key_${k}.value`)
          }
        }
      }
    }).run()
  })

  test('set 25 deep paths', async ({ bench }) => {
    await bench('set 25 deep paths', () => {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          set(data, `key_${i}.key_${j}.key_0.value`, 'written')
        }
      }
    }).run()
  })
})

describe('class utils', () => {
  const a = { 'vf-input': true, 'vf-focused': false, 'vf-lg': true }
  const b = ['vf-custom', { 'vf-focused': true }]

  test('mergeClass object + array', async ({ bench }) => {
    await bench('mergeClass object + array', () => {
      mergeClass(a, b)
    }).run()
  })
})
