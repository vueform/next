/**
 * SSR request behavior.
 *
 * `resolveItems` runs in setup — which the server executes — so endpoint-driven
 * items would otherwise fire HTTP requests during a render whose result can
 * never reach the output (the render finishes long before any response). The
 * old adapter papered over this by returning a fabricated `{ status: 0 }`
 * "success", which also made a server-side `submit()` look like it succeeded:
 * `resetOnSuccess` wiped the model and the saved draft was cleared for a
 * request that never left the machine.
 *
 * The contract now: async item sources are client-gated at the source (sync
 * ones still render server-side), and the adapter refuses honestly with
 * `reason: 'ssr'`, so a real misuse surfaces as a failure instead of a
 * counterfeit success. The client half of the story — hydration re-runs setup
 * in the browser, so endpoint items fetch there — is covered by the endpoint
 * tests in `tests/features/items.test.ts` (client environment).
 */
import {
  conditions,
  createVueform,
  defineSchema,
  fetchHttpAdapter,
  http,
  model,
  validation,
} from '@vueform/core'
import * as components from '@vueform/core/components'
import { describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

const makeInstance = () =>
  createVueform({
    modules: { model, validation, conditions, http },
    components,
    $http: { adapter: fetchHttpAdapter },
  } as any)

describe('SSR requests', () => {
  it('should not fetch endpoint items during a server render', async () => {
    const adapter = vi.fn()

    const vueform = createVueform({
      modules: { model, validation, conditions, http },
      components,
      $http: { adapter },
    } as any)

    const App = defineComponent({
      setup() {
        const schema = defineSchema({
          sel: { type: 'select', items: '/api/options' },
        })
        return () => h(components.VfForm as any, { schema })
      },
    })

    const app = createSSRApp(App)
    app.use(vueform)

    const html = await renderToString(app)

    expect(adapter).not.toHaveBeenCalled()
    expect(html).toContain('vf-form')
  })

  it('should render sync item sources during a server render', async () => {
    const vueform = makeInstance()

    const App = defineComponent({
      setup() {
        const schema = defineSchema({
          sel: {
            type: 'select',
            native: true,
            items: [{ value: 'a', label: 'Alpha' }],
          },
        })
        return () => h(components.VfForm as any, { schema })
      },
    })

    const app = createSSRApp(App)
    app.use(vueform)

    const html = await renderToString(app)

    expect(html).toContain('Alpha')
  })

  it('should refuse HTTP requests during SSR with the `ssr` reason', async () => {
    // The stub used to resolve with a fabricated `{ status: 0 }` response,
    // which the submit flow then reported as a SUCCESS — firing
    // `resetOnSuccess` and clearing the saved draft for a request that never
    // left the machine. It now refuses honestly.
    await expect(
      fetchHttpAdapter({ url: '/api/save', method: 'POST' } as any)
    ).rejects.toMatchObject({ reason: 'ssr' })
  })
})
