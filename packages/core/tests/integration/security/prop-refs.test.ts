import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

/**
 * `$security.allowProps` — the gate over `path@prop` / `@prop`
 * references in conditions and expressions. Unset, every prop reference
 * resolves (the option only limits once it is set, like
 * `$expression.whitelist`); an array restricts resolution to the listed
 * patterns, with `[]` denying every prop reference.
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

    it('should evaluate prop-ref conditions when unset', () => {
      const { dep } = makeForm(schema, undefined)

      expect(dep.available).toBe(true)
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
    it('should resolve PROP references when unset', () => {
      const { el } = makeForm(
        {
          source: { type: 'text', label: 'Src' },
          el: { type: 'text', help: '{source@label}' },
        },
        undefined
      )

      expect(el.help).toBe('Src')
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

  describe('patterns', () => {
    const resolved = (allowProps: (string | RegExp)[], prop: string) => {
      const { el } = makeForm(
        {
          source: { type: 'text', label: 'Src' },
          el: { type: 'text', help: `{source@${prop}}` },
        },
        allowProps
      )

      return el.help
    }

    it('should match the flat reference only with a plain prop name', () => {
      expect(resolved(['label'], 'label')).toBe('Src')
      expect(resolved(['props'], 'props.label')).toBe('')
    })

    it('should match one nested level with `prop.*` but not the flat form', () => {
      expect(resolved(['props.*'], 'props.label')).toBe('Src')
      expect(resolved(['props.*'], 'label')).toBe('')
      expect(resolved(['props.*'], 'props.label.length')).toBe('')
    })

    it('should treat trailing `*` segments as optional', () => {
      expect(resolved(['props.*.*'], 'props.label')).toBe('Src')
      expect(resolved(['props.*.*'], 'props.label.length')).toBe('3')
      expect(resolved(['props.*.*'], 'label')).toBe('')
    })

    it('should require static segments midway', () => {
      expect(resolved(['props.*.length'], 'props.label.length')).toBe('3')
      expect(resolved(['props.*.length'], 'props.label')).toBe('')
    })

    it('should match any depth with `prop.**` but not the flat form', () => {
      expect(resolved(['props.**'], 'props.label')).toBe('Src')
      expect(resolved(['props.**'], 'props.label.length')).toBe('3')
      expect(resolved(['label.**'], 'label')).toBe('')
    })

    it('should match prop-name prefixes and suffixes', () => {
      expect(resolved(['lab*'], 'label')).toBe('Src')
      expect(resolved(['*abel'], 'label')).toBe('Src')
      expect(resolved(['lab*'], 'help')).toBe('')
    })

    it('should combine name wildcards with nesting', () => {
      expect(resolved(['pro*.*'], 'props.label')).toBe('Src')
      expect(resolved(['pro*.*'], 'label')).toBe('')
    })

    it('should match any flat prop with a standalone `*`', () => {
      expect(resolved(['*'], 'label')).toBe('Src')
      expect(resolved(['*'], 'props.label')).toBe('')
    })

    it('should match everything with a standalone `**`', () => {
      expect(resolved(['**'], 'label')).toBe('Src')
      expect(resolved(['**'], 'props.label.length')).toBe('3')
    })

    it('should test RegExp entries against the full prop path', () => {
      expect(resolved([/^label$/], 'label')).toBe('Src')
      expect(resolved([/^label$/], 'props.label')).toBe('')
      expect(resolved([/^props\.label\b/], 'props.label.length')).toBe('3')
    })

    it('should match RegExp entries on nested prop paths', () => {
      const { el } = makeForm(
        {
          source: { type: 'text', label: 'Src' },
          el: {
            type: 'text',
            help: '{source@props.label}',
            placeholder: '{source@label}',
          },
        },
        [/^props\./]
      )

      expect(el.help).toBe('Src')
      // A denied reference resolves empty; the empty prop finalizes undefined.
      expect(el.placeholder).toBeUndefined()
    })
  })
})
