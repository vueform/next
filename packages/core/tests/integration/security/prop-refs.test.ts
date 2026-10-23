import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

/**
 * `$security.allowProps` — the fail-closed gate over `path@prop` / `@prop`
 * references in conditions and expressions. The shared test helper opts out
 * with `['**']`; these suites pass their own policy (an explicit `undefined`
 * exercises the unset state, which denies like `[]`).
 */
const makeForm = (
  schema: Record<string, any>,
  allowProps: (string | RegExp)[] | undefined
) =>
  createForm({ schema: defineSchema(schema) }, {
    $security: { allowProps },
  } as any)

describe('allowProps', () => {
  describe('conditions', () => {
    const schema = {
      source: { type: 'text', label: 'Src', default: 'x' },
      dep: { type: 'text', conditions: [['source@label', '==', 'Src']] },
    }

    it('should resolve prop-ref conditions as unmet when unset', () => {
      const { dep } = makeForm(schema, undefined)

      expect(dep.available).toBe(false)
    })

    it('should resolve prop-ref conditions as unmet with an empty list', () => {
      const { dep } = makeForm(schema, [])

      expect(dep.available).toBe(false)
    })

    it('should evaluate prop-ref conditions when the prop is listed', () => {
      const { dep } = makeForm(schema, ['label'])

      expect(dep.available).toBe(true)
    })

    it('should keep value conditions working with an empty list', () => {
      const { dep } = makeForm(
        {
          source: { type: 'text', default: 'x' },
          dep: { type: 'text', conditions: [['source', '==', 'x']] },
        },
        []
      )

      expect(dep.available).toBe(true)
    })
  })

  describe('expressions', () => {
    it('should resolve PROP references to empty when unset', () => {
      const { el } = makeForm(
        {
          source: { type: 'text', label: 'Src' },
          el: { type: 'text', help: '{source@label}' },
        },
        undefined
      )

      expect(el.help).toBe('')
    })

    it('should resolve PROP references to empty with an empty list', () => {
      const { el } = makeForm(
        {
          source: { type: 'text', label: 'Src' },
          el: { type: 'text', help: '{source@label}' },
        },
        []
      )

      expect(el.help).toBe('')
    })

    it('should resolve PROP references when the prop is listed', () => {
      const { el } = makeForm(
        {
          source: { type: 'text', label: 'Src' },
          el: { type: 'text', label: '{source@label}' },
        },
        ['label']
      )

      expect(el.label).toBe('Src')
    })

    it('should gate SELF references through the same policy', () => {
      const denied = makeForm(
        { el: { type: 'text', label: 'Mine', help: '{@label}' } },
        []
      )
      const allowed = makeForm(
        { el: { type: 'text', label: 'Mine', help: '{@label}' } },
        ['label']
      )

      expect(denied.el.help).toBe('')
      expect(allowed.el.help).toBe('Mine')
    })
  })
})
