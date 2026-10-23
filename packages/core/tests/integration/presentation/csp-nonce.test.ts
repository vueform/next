import {
  createVueform,
  defineSchema,
  model,
  security,
  theme,
} from '@vueform/core'
/**
 * # CSP nonce plumbing
 *
 * Deployment guarantee, not an attack surface: under a strict `style-src-elem`
 * policy, any Vueform `<style>` tag missing the configured nonce is silently
 * dropped by the browser and the form renders unstyled — pushing apps to
 * weaken their CSP. The configured `nonce` must reach every style sink: the
 * per-instance tags components render, and the theme stylesheet through each
 * of its three delivery paths (SSR string, DOM fallback, Unhead).
 */
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

describe('CSP nonce plumbing', () => {
  /**
   * Per-instance `<style>` tags rendered by components carry the configured
   * `nonce` attribute.
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

  /** Path 1 — the SSR string carries the nonce as an attribute. */
  test('it should include the nonce in the SSR style tag', () => {
    const vueform = createVueform({
      modules: { model, security, theme },
      nonce: 'ssr-nonce-2',
      tokens: { primary: 'red' },
    } as any)

    expect(vueform.getStyleTag()).toContain('nonce="ssr-nonce-2"')
  })

  /**
   * Path 2 — with no Unhead present, the module falls back to inserting a
   * `<style>` element into `document.head` and sets the nonce via
   * `setAttribute`.
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
   * Path 3 — when Unhead is installed (Nuxt), the CSS is handed to
   * `head.push()` with the nonce in the style entry instead of touching the
   * DOM.
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
