// @vitest-environment node
import {
  createVueform,
  locale as localeModule,
  model,
  NotInstalledError,
  useLocale,
  useModel,
  validation,
} from '@vueform/core'
import * as components from '@vueform/core/components'
import { required } from '@vueform/core/rules'
import { describe, expect, it } from 'vitest'
import { createSSRApp, defineAsyncComponent, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

/**
 * SSR isolation under concurrent requests. A Node server process serves every
 * request from one module scope, so any module-scope state would be shared
 * across in-flight renders. Vueform keeps none: module instances live on each
 * `createVueform()` instance's config, components reach it by injection, and
 * everything else has to hold the instance. These tests interleave two
 * "requests" with different configs at `await` points — exactly as an async
 * server render does — and check that no request can observe the other's
 * instance, by resolution or by accident.
 */

const gate = () => {
  let open!: () => void
  const opened = new Promise<void>((resolve) => (open = resolve))
  return { opened, open }
}

/**
 * A per-request instance whose config is derived from the request (its locale)
 * — the shape that would make cross-request leakage observable.
 */
const makeInstance = (key: string, tag: string, requiredMessage: string) =>
  createVueform({
    modules: { model, validation, locale: localeModule },
    components,
    rules: { required },
    locales: {
      [key]: { vf_test_tag: tag, rule_required_error: requiredMessage },
    },
    locale: key,
  } as any)

const EN = ['en_US', 'English', 'The {attribute} field is required.'] as const
const DE = ['de_DE', 'Deutsch', 'Pflichtfeld: {attribute}.'] as const

/**
 * Component that reads the locale synchronously in setup — the injection tier.
 */
const Probe = defineComponent({
  setup() {
    const { t } = useLocale()
    return () => h('p', t('vf_test_tag'))
  },
})

describe('SSR: concurrent requests with different configs', () => {
  it('keeps interleaved renders isolated when components resolve via injection', async () => {
    const gateA = gate()
    const gateB = gate()

    // Async components make each render suspend at its loader, so the two
    // renders interleave: B's instance is created while A is mid-render.
    const rootFor = (opened: Promise<void>) => {
      const Lazy = defineAsyncComponent(() => opened.then(() => Probe))
      return defineComponent({ render: () => h('div', h(Lazy)) })
    }

    const a = makeInstance(...EN)
    const htmlA = renderToString(createSSRApp(rootFor(gateA.opened)).use(a))

    const b = makeInstance(...DE)
    const htmlB = renderToString(createSSRApp(rootFor(gateB.opened)).use(b))

    gateA.open()
    gateB.open()

    expect(await htmlA).toContain('English')
    expect(await htmlB).toContain('Deutsch')
  })

  // Vue drops the injection context after an `await` in a plain `async
  // setup()` (`<script setup>` restores it via `withAsyncContext`). With no
  // ambient fallback, a composable called there fails loudly — Vue routes the
  // setup error to the app's error handler and renders nothing for the
  // component — instead of silently reading whichever request created an
  // instance last.
  it('fails loudly in a plain async setup() reading the locale after an await', async () => {
    const gateA = gate()
    const errors: unknown[] = []

    const Root = defineComponent({
      async setup() {
        await gateA.opened
        const { t } = useLocale() // no injection context here
        return () => h('p', t('vf_test_tag'))
      },
    })

    const appA = createSSRApp(Root).use(makeInstance(...EN))
    appA.config.errorHandler = (error) => {
      errors.push(error)
    }
    const htmlA = renderToString(appA)

    makeInstance(...DE) // another request creates its instance mid-render

    gateA.open()

    const html = await htmlA
    expect(errors[0]).toBeInstanceOf(NotInstalledError)
    expect(html).not.toContain('English')
    expect(html).not.toContain('Deutsch')
  })

  /**
   * A server-side request handler (no Vue app involved): creates the request's
   * instance, awaits something (a database call), then builds a headless model
   * and validates it.
   */
  const handleRequest = async (
    [key, tag, message]: readonly [string, string, string],
    opened: Promise<void>,
    viaInstance: boolean
  ) => {
    const vueform = makeInstance(key, tag, message)

    await opened // another request runs meanwhile

    const schema = { name: { type: 'text', rules: 'required' } } as any
    const model$ = viaInstance ? vueform.useModel(schema) : useModel(schema) // bare composable: no context to resolve from
    await model$.validate()

    return model$.find('name')!.errors[0]
  }

  it('isolates out-of-context calls made through the request instance', async () => {
    const gateA = gate()
    const gateB = gate()

    const errorA = handleRequest(EN, gateA.opened, true)
    const errorB = handleRequest(DE, gateB.opened, true)

    gateA.open()
    gateB.open()

    expect(await errorA).toContain('required')
    expect(await errorB).toContain('Pflichtfeld')
  })

  it('rejects bare composable calls outside a component instead of guessing', async () => {
    const gateA = gate()
    const gateB = gate()

    const errorA = handleRequest(EN, gateA.opened, false)
    const errorB = handleRequest(DE, gateB.opened, false)

    gateA.open()
    gateB.open()

    await expect(errorA).rejects.toBeInstanceOf(NotInstalledError)
    await expect(errorB).rejects.toBeInstanceOf(NotInstalledError)
  })
})
