import { bench, describe } from 'vitest'
import { clone, equals, get, merge, mergeClass, set } from '#core'

/**
 * Pure-function microbenches on the hot utilities that run per element and
 * per update — no DOM, no component tree, the most stable A/B signal in the
 * suite.
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
  bench('merge two deep objects', () => {
    merge(clone(base), overlay)
  })

  bench('clone a deep object', () => {
    clone(base)
  })

  bench('equals on equal deep objects', () => {
    equals(base, copy)
  })
})

describe('path utils', () => {
  const data = deepFixture(5, 4)

  bench('get 100 deep paths', () => {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        for (let k = 0; k < 4; k++) {
          get(data, `key_${i}.key_${j}.key_${k}.value`)
        }
      }
    }
  })

  bench('set 25 deep paths', () => {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        set(data, `key_${i}.key_${j}.key_0.value`, 'written')
      }
    }
  })
})

describe('class utils', () => {
  const a = { 'vf-input': true, 'vf-focused': false, 'vf-lg': true }
  const b = ['vf-custom', { 'vf-focused': true }]

  bench('mergeClass object + array', () => {
    mergeClass(a, b)
  })
})
