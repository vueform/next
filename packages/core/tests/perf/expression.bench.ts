/**
 * Expression resolution benches for the evaluate hot path.
 *
 * - data-path refs — the pre-existing fast path (regression guard for the
 *   tree-path alias step, which adds a per-variable data probe here)
 * - tree-path refs — the alias fallback itself (data miss → registry lookup)
 * - aggregate — wildcard expansion over a list
 * - update-driven label — end-to-end reactivity through a text prop
 */
import { defineSchema, getExpressionModule } from '@vueform/core'
import { afterAll, bench, describe } from 'vitest'
import { createForm } from '../helpers'

const LOOP = 200

describe('expression-resolve', () => {
  const { form, form$, vueform } = createForm({
    schema: defineSchema({
      name: { type: 'text', default: 'John' },
      a: { type: 'text', default: 3 },
      b: { type: 'text', default: 5 },
      user: {
        type: 'group',
        nested: true,
        schema: {
          name: { type: 'text', default: 'Jane' },
        },
      },
      billing: {
        type: 'group',
        schema: {
          company: { type: 'text', default: 'ACME' },
        },
      },
      items: {
        type: 'list',
        initial: 5,
        schema: {
          price: { type: 'text', default: 10 },
        },
      },
      greeting: { type: 'text', label: 'Hello {name}' },
    }),
  })

  const expression = getExpressionModule(vueform)
  const context$ = () => form$.find('greeting')

  afterAll(() => {
    form.unmount()
  })

  bench('data-path refs (mixed)', () => {
    const ctx = context$()
    for (let i = 0; i < LOOP; i++) {
      expression.resolve(
        'Hello {name}, {user.name} — {a + b}',
        form$.model,
        ctx
      )
    }
  })

  bench('tree-path refs (alias fallback)', () => {
    const ctx = context$()
    for (let i = 0; i < LOOP; i++) {
      expression.resolve('Company: {billing.company}', form$.model, ctx)
    }
  })

  bench('aggregate SUM over list', () => {
    const ctx = context$()
    for (let i = 0; i < LOOP; i++) {
      expression.resolve('{SUM(items.*.price)}', form$.model, ctx)
    }
  })

  bench('update-driven label re-resolve', () => {
    const name = form$.find('name')
    const greeting = form$.find('greeting')
    for (let i = 0; i < LOOP; i++) {
      name?.update(`John ${i}`)
      void greeting?.label
    }
  })
})
