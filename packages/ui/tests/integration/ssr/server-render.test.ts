// @vitest-environment node
/**
 * SSR smoke: the package's server-render guarantees, under plain Node with no
 * DOM at all — the environment every claim in the SSR guide stands on. A
 * browser-API access during render, a diverging blueprint, or a broken `node`
 * condition stub fails here before any user hits it.
 */
import { renderToString } from 'vue/server-renderer'

import { createApp, schema } from './kitchen-sink'

describe('SSR server render', () => {
  it('runs without a DOM', () => {
    expect(typeof window).toBe('undefined')
    expect(typeof document).toBe('undefined')
  })

  it('renders the kitchen-sink schema without errors or warnings', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { app } = createApp()
    const html = await renderToString(app)

    expect(html).toContain('vf-form')

    // Every element type made it into the markup: visible labels/content for
    // the rendered ones, the value for the hidden input.
    const markers = [
      'Server value',
      'Textarea',
      'Select',
      'Check me',
      'Checkboxes',
      'Pick me',
      'Radios',
      'File',
      'invisible',
      'Static content',
      'Nested text',
      'first row',
      'Grid cell',
      'Row 1',
      'Submit it',
    ]
    expect(markers.filter((m) => !html.includes(m))).toEqual([])

    const logged = [...warn.mock.calls, ...error.mock.calls].map((args) =>
      args.join(' ')
    )
    expect(logged).toEqual([])

    warn.mockRestore()
    error.mockRestore()
  })

  it('renders every leaf input with its schema name', async () => {
    const { app } = createApp()
    const html = await renderToString(app)

    for (const name of Object.keys(schema)) {
      expect(html).toContain(name)
    }
  })

  it('getStyleTag returns the generated stylesheet before any render', () => {
    const { vueform } = createApp()

    const tag = vueform.getStyleTag()

    expect(tag).toMatch(/^<style id="vueform-theme">/)
    expect(tag).toContain('--vf-')
    expect(tag.endsWith('</style>')).toBe(true)
  })

  it('produces identical HTML across repeated renders of fresh apps', async () => {
    const first = await renderToString(createApp().app)
    const second = await renderToString(createApp().app)

    expect(second).toBe(first)
  })
})
