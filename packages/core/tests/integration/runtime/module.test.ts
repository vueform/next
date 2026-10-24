import {
  createVueform,
  date as dateModule,
  getLocaleModule,
  hasExpressionModule,
  hasLocaleModule,
  hasRouterModule,
  hasThemeModule,
  model,
  nativeDateAdapter,
  NotInstalledError,
  locale as localeModule,
  useLocale,
  useModel,
} from '@vueform/core'
import * as components from '@vueform/core/components'
import { en_US } from '@vueform/core/locales'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import { mount } from '../../helpers'

const makeInstance = (locales: Record<string, any>, locale: string) =>
  createVueform({
    modules: { model, locale: localeModule },
    components,
    locales,
    locale,
  } as any)

describe('Module resolution', () => {
  it('resolves instances at creation — no app.use needed', () => {
    const vueform = makeInstance({ en_US }, 'en_US')

    expect(vueform.modules.locale).toBeDefined()
    expect(getLocaleModule(vueform).locale.value).toBe('en_US')
    // Headless model creation works right after createVueform().
    const model$ = vueform.useModel({
      schema: { name: { type: 'text' } } as any,
    })
    expect(model$.model).toEqual({ name: null })
  })

  it('isolates module instances per createVueform instance', () => {
    const a = makeInstance({ en_US }, 'en_US')
    const b = makeInstance(
      { de_DE: { vf_test_tag: 'Deutsch' } as any },
      'de_DE'
    )

    // Creating b must not affect what a resolves explicitly.
    expect(getLocaleModule(a).locale.value).toBe('en_US')
    expect(getLocaleModule(b).locale.value).toBe('de_DE')
    expect(getLocaleModule(b).t('vf_test_tag')).toBe('Deutsch')
    expect(getLocaleModule(a).t('vf_test_tag')).toBe('vf_test_tag')
  })

  it('throws outside component setup instead of guessing an instance', () => {
    makeInstance({ en_US }, 'en_US')

    // No ambient tier: creating instances never makes a zero-arg call resolve.
    expect(() => getLocaleModule()).toThrow(NotInstalledError)
    expect(() =>
      useModel({ schema: { name: { type: 'text' } } as any })
    ).toThrow(NotInstalledError)
  })

  it('keeps explicit resolution stable when another instance is created (SSR interleaving)', () => {
    const a = makeInstance({ en_US }, 'en_US')
    const localeOfA = getLocaleModule(a)

    // Simulates a second request creating its instance mid-render of the first.
    makeInstance({ de_DE: {} as any }, 'de_DE')

    expect(getLocaleModule(a)).toBe(localeOfA)
    expect(getLocaleModule(a).locale.value).toBe('en_US')
  })

  it('resolves the owning app inside component setup regardless of creation order', () => {
    const seen: string[] = []

    const Probe = defineComponent({
      setup() {
        seen.push(useLocale().locale.value)
        return () => h('div')
      },
    })

    // Distinct instances per app (an instance installs once — `$installed`).
    mount(Probe, { global: { plugins: [makeInstance({ en_US }, 'en_US')] } })
    mount(Probe, {
      global: { plugins: [makeInstance({ de_DE: {} as any }, 'de_DE')] },
    })
    // Mounting an en_US app again must resolve it, not the last created.
    mount(Probe, { global: { plugins: [makeInstance({ en_US }, 'en_US')] } })

    expect(seen).toEqual(['en_US', 'de_DE', 'en_US'])
  })

  it('exposes useLocale and useHttp bound to the instance', () => {
    const vueform = makeInstance({ en_US }, 'en_US')

    expect(vueform.useLocale()).toBe(getLocaleModule(vueform))
    expect(vueform.useLocale().locale.value).toBe('en_US')
    // Each call creates a fresh consumer with its own interceptor scope,
    // mirroring the `useHttp()` composable.
    expect(vueform.useHttp()).not.toBe(vueform.useHttp())
    expect(typeof vueform.useHttp().request).toBe('function')
    // The security module falls back to its noop stand-in when unregistered.
    expect(typeof vueform.useSecurity().sanitizeHtml).toBe('function')
  })

  it('exposes useDate on the instance — useDate bound to it', () => {
    const vueform = createVueform({
      modules: { model, date: dateModule },
      components,
      $date: { adapter: nativeDateAdapter },
    } as any)

    expect(vueform.useDate('1990-05-15').year()).toBe(1990)
    expect(vueform.useDate().isValid()).toBe(true)

    // Without the date module the member throws at call, not at access.
    const bare = makeInstance({ en_US }, 'en_US')
    expect(() => bare.useDate()).toThrow('date')
  })

  it('runs plugin install hooks with the app and the instance on install', () => {
    const install = vi.fn()
    const vueform = createVueform({
      modules: { model },
      components,
      plugins: [{ name: 'probe', install }],
    } as any)

    expect(install).not.toHaveBeenCalled()

    const wrapper = mount(defineComponent({ render: () => h('div') }), {
      global: { plugins: [vueform] },
    })

    expect(install).toHaveBeenCalledTimes(1)
    const [context] = install.mock.calls[0]
    expect(context.vueform).toBe(vueform)
    expect(context.app.directive).toBeTypeOf('function')
    wrapper.unmount()
  })

  it('keeps definitions on the config and the created modules on the instance', () => {
    const vueform = makeInstance({ en_US }, 'en_US')

    // The config keeps the user's shape: what was registered.
    expect(vueform.config.modules.locale).toBe(localeModule)
    expect(vueform.config.modules.model).toBe(model)
    // The instance carries what `create()` produced.
    expect(vueform.modules.locale).toBe(getLocaleModule(vueform))
    expect(typeof vueform.modules.locale?.t).toBe('function')
  })

  it('rejects a registered module that is not a defineModule() definition', () => {
    expect(() =>
      createVueform({
        modules: { model, locale: { install: () => {} } },
      } as any)
    ).toThrow(
      'Module "locale" must be a definition created with defineModule()'
    )
  })

  it('serves the noop surface when the module is absent from the resolved instance', () => {
    const bare = createVueform({
      modules: { model },
      locales: { en_US },
    } as any)

    expect(hasLocaleModule(bare)).toBe(false)
    expect(hasExpressionModule(bare)).toBe(false)
    expect(hasRouterModule(bare)).toBe(false)
    expect(hasThemeModule(bare)).toBe(false)
    expect(getLocaleModule(bare).t('vf_test_tag')).toBe('vf_test_tag')
  })
})

describe('Orphan module options', () => {
  /**
   * A configured `$<module>` options block whose module isn't registered reads
   * as if it were in effect while nothing consumes it. `createVueform` warns at
   * creation, naming the module to register.
   */
  it('warns when $<module> options are set without the module', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    createVueform({
      modules: { model },
      $validation: { rules: {} },
    } as any)

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        '`$validation` options are configured but the `validation` module is not registered'
      )
    )

    warn.mockRestore()
  })

  it('does not warn when the module is registered or options are absent', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    createVueform({
      modules: { model, locale: localeModule },
      locales: { en_US },
      locale: 'en_US',
      $locale: { fallback: 'en_US' },
    } as any)

    expect(warn).not.toHaveBeenCalledWith(
      expect.stringContaining('options are configured but the')
    )

    warn.mockRestore()
  })
})
