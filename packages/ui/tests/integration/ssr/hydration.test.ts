/**
 * SSR smoke: a fresh client app hydrates the server-rendered HTML without a
 * single mismatch, and install reuses the server's theme style tag instead of
 * adding a second. Guards the stable-ID guarantee end to end.
 */
import { nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'

import { createApp } from './kitchen-sink'

describe('SSR hydration', () => {
  it('hydrates the kitchen-sink markup with zero mismatches', async () => {
    const { app: serverApp, vueform: serverVueform } = createApp()
    const html = await renderToString(serverApp)
    const styleTag = serverVueform.getStyleTag()

    // Rebuild the "browser" document the way a real SSR response arrives:
    // theme tag in head, markup in the outlet.
    document.head.innerHTML = styleTag
    document.body.innerHTML = `<div id="app">${html}</div>`
    const container = document.getElementById('app')!

    const messages: string[] = []
    const warn = vi.spyOn(console, 'warn').mockImplementation((...args) => {
      messages.push(args.join(' '))
    })
    const error = vi.spyOn(console, 'error').mockImplementation((...args) => {
      messages.push(args.join(' '))
    })

    const { app: clientApp } = createApp()
    clientApp.mount(container)
    await nextTick()

    warn.mockRestore()
    error.mockRestore()

    expect(messages.filter((m) => /hydrat|mismatch/i.test(m))).toEqual([])

    // Install reused the server-rendered tag by its styleId — one tag, not two.
    expect(document.querySelectorAll('#vueform-theme')).toHaveLength(1)

    clientApp.unmount()
  })
})
