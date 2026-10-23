import {
  createVueform,
  defineSchema,
  getSecurityModule,
  model,
  theme,
  useHttp,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
  type VueformConfig,
} from '@vueform/core'
import * as modules from '@vueform/core/modules'
import { nextTick, h, type FunctionalComponent } from 'vue'

import { createForm, flushPromises } from '../../helpers'

/**
 * The inert security surface an app observes when the `security` module is not
 * registered — obtained through the public accessor's fallback branch, the same
 * path components take at runtime.
 */
function noopSecurity(config: VueformConfig) {
  return getSecurityModule({ config, modules: {} } as any)
}

afterEach(() => {
  vi.unstubAllEnvs()
})

function prod() {
  vi.stubEnv('NODE_ENV', 'production')
}

const { security: _security, ...modulesWithoutSecurity } = modules as any

const Resolved: FunctionalComponent = () =>
  h('span', { class: 'resolved' }, 'Resolved')
Resolved.inheritAttrs = false

const withComponents = { global: { components: { Resolved } } }

describe('Security module: noop surface in production', () => {
  describe('`allowsOrigin`', () => {
    /**
     * `allowOrigins` configured without the module — in production there is no
     * warning, and permissive behavior would mean every request flows
     * unrestricted while the config claims otherwise. Discovered intent fails
     * closed to the app's own origin — relative URLs and the page origin still
     * pass (blocking those would break even same-origin submits), everything
     * cross-origin is refused until the module is registered.
     *
     * Verified red→green: the noop allowed all requests in production before
     * the fail-closed change.
     */
    it('should block cross-origin requests when allowOrigins is configured', () => {
      prod()
      const sec = noopSecurity({
        $security: { allowOrigins: ['https://api.example.com'] },
      } as any)

      expect(sec.allowsOrigin('https://api.example.com/save')).toBe(false)
      expect(sec.allowsOrigin('/save')).toBe(true)
      expect(sec.allowsOrigin(`${window.location.origin}/save`)).toBe(true)
    })

    /**
     * No intent, nothing to enforce. An unconfigured modular app keeps its
     * requests.
     */
    it('should allow requests when allowOrigins is not configured', () => {
      prod()
      const sec = noopSecurity({ $security: {} } as any)

      expect(sec.allowsOrigin('https://api.example.com/save')).toBe(true)
    })

    /**
     * Presence is the intent, the permissive spelling included: unset already
     * means "no restriction", so writing `['*']` says the app cares about this
     * policy — and a policy the module never enforces fails closed like any
     * other.
     */
    it('should fail closed when allowOrigins is `["*"]`', () => {
      prod()
      const sec = noopSecurity({
        $security: { allowOrigins: ['*'] },
      } as any)

      expect(sec.allowsOrigin('https://anywhere.example.net/x')).toBe(false)
      expect(sec.allowsOrigin('/save')).toBe(true)
    })
  })

  describe('`sanitizeProps`', () => {
    /**
     * `banAttrs` configured without the module — production would spread
     * attribute bags unfiltered while the config claims they are banned.
     * Discovered intent fails closed — bags come back empty (which also
     * empties schema entries through `useSchema`, so the broken state is
     * unmissable rather than silently unprotected).
     *
     * Verified red→green: bags passed through in production before the
     * fail-closed change.
     */
    it('should empty attribute bags when banAttrs is configured', () => {
      prod()
      const sec = noopSecurity({
        $security: { banAttrs: ['style'] },
      } as any)

      expect(sec.sanitizeProps({ style: 'color: red', class: 'x' })).toEqual({})
    })

    /**
     * No intent, no filtering. Bags pass through unchanged (attribute
     * filtering is the module's feature).
     */
    it('should pass bags through when banAttrs is not configured', () => {
      prod()
      const sec = noopSecurity({ $security: {} } as any)
      const bag = { class: 'x' }

      expect(sec.sanitizeProps(bag)).toBe(bag)
    })
  })

  describe('`allowsProp`', () => {
    /**
     * `allowProps` populated without the module — production would resolve
     * every prop reference while the config claims only the listed ones do.
     * Discovered intent fails closed — no prop reference resolves until the
     * module is registered.
     */
    it('should deny prop references when allowProps is populated', () => {
      prod()
      const sec = noopSecurity({
        $security: { allowProps: ['label'] },
      } as any)

      expect(sec.allowsProp('label')).toBe(false)
    })

    /**
     * No intent without the option: an unset `allowProps` means no prop
     * policy, and the module family's absent-feature rule applies — nothing
     * is enforced.
     */
    it('should allow prop references when allowProps is unset', () => {
      prod()
      const unset = noopSecurity({ $security: {} } as any)

      expect(unset.allowsProp('label')).toBe(true)
    })

    /**
     * Presence is the intent, permissive spellings included: unset already
     * allows everything, so `[]` (deny all) and `['**']` (the explicit
     * spelling of the default) both say the app cares about this policy — and
     * a policy the module never enforces fails closed like any other.
     */
    it('should fail closed when allowProps is set, whatever it holds', () => {
      prod()
      const empty = noopSecurity({ $security: { allowProps: [] } } as any)
      const all = noopSecurity({ $security: { allowProps: ['**'] } } as any)

      expect(empty.allowsProp('label')).toBe(false)
      expect(all.allowsProp('label')).toBe(false)
    })
  })

  describe('ciphers', () => {
    /**
     * Ciphers configured without the module — production would persist drafts
     * in plaintext while the config claims they are encrypted. Discovered
     * intent fails closed — the noop ciphers resolve `undefined`, and the
     * draft cycle turns that into "nothing persisted" (encrypt) / "draft
     * unreadable, kept in storage" (decrypt) instead of plaintext.
     *
     * Verified red→green: the identity ciphers ran in production before the
     * fail-closed change.
     */
    it('should resolve undefined when ciphers are configured', () => {
      prod()
      const sec = noopSecurity({
        $security: { encrypt: (v: string) => v, decrypt: (v: string) => v },
      } as any)

      expect(sec.encrypt('data', 'draft')).toBeUndefined()
      expect(sec.decrypt('data', 'draft')).toBeUndefined()
    })

    /**
     * Plaintext is the documented default when no ciphers are configured;
     * identity is the correct behavior.
     */
    it('should stay identity when no ciphers are configured', () => {
      prod()
      const sec = noopSecurity({ $security: {} } as any)

      expect(sec.encrypt('data', 'draft')).toBe('data')
      expect(sec.decrypt('data', 'draft')).toBe('data')
    })
  })

  describe('`allowsHtml` and `allowsComponent`', () => {
    /**
     * `allowHtml` / `allowComponents` configured without the module — in
     * production the config would read as enforced policy while every area
     * renders raw and every name resolves. Discovered intent fails closed —
     * HTML renders escaped and component names stop resolving until the module
     * is registered.
     */
    it('should fail closed when configured', () => {
      prod()
      const sec = noopSecurity({
        $security: {
          allowHtml: ['content'],
          allowComponents: ['MyBadge'],
        },
      } as any)

      expect(sec.allowsHtml('content')).toBe(false)
      expect(sec.allowsComponent('MyBadge')).toBe(false)
    })

    /**
     * `allowHtml` set to `[]` without the module — unset allows every area, so
     * for this gate presence alone is the intent, and an empty list (escape
     * everywhere) is the strongest restriction it can state.
     */
    it('should fail closed when allowHtml is an empty list', () => {
      prod()
      const sec = noopSecurity({ $security: { allowHtml: [] } } as any)

      expect(sec.allowsHtml('content')).toBe(false)
    })

    /**
     * No intent means the module family's absent-feature rule applies:
     * everything is permitted, in production too.
     *
     * Verified red→green: the gates were unconditionally closed without the
     * module before the permissive redesign.
     */
    it('should stay permissive when not configured', () => {
      prod()
      const sec = noopSecurity({ $security: {} } as any)

      expect(sec.allowsHtml('content')).toBe(true)
      expect(sec.allowsHtml('slots')).toBe(true)
      expect(sec.allowsComponent('Anything')).toBe(true)
    })
  })

  describe('development stays permissive', () => {
    /**
     * The other half of the contract. In development the same
     * misconfigurations warn and stay permissive, so the app remains workable
     * while the console names the fix.
     */
    it('should warn and allow in development', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const sec = noopSecurity({
        $security: {
          allowOrigins: ['https://api.example.com'],
          banAttrs: ['style'],
        },
      } as any)

      const bag = { style: 'color: red' }

      expect(sec.allowsOrigin('https://evil.example.net/x')).toBe(true)
      expect(sec.sanitizeProps(bag)).toBe(bag)

      warn.mockRestore()
    })
  })
})

describe('Security module: absent-module behavior in development', () => {
  describe('requests', () => {
    /**
     * A modular setup configuring `allowOrigins` without registering the
     * security module — the policy silently not being enforced. Requests
     * proceed in development (the option cannot be enforced) while
     * `createVueform()`'s orphan-options warning states exactly that at
     * startup; production blocks every request instead.
     */
    test('it should warn when `allowOrigins` is configured without the module', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const calls: HttpRequestConfig[] = []
      const adapter: HttpAdapter = async <T = any>(
        config: HttpRequestConfig
      ): Promise<HttpResponse<T>> => {
        calls.push(config)
        return {
          data: null as T,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      }

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        {
          modules: modulesWithoutSecurity,
          $http: { adapter },
          $security: { allowOrigins: ['https://api.example.com'] },
        }
      )

      const $http = useHttp(vueform)
      await $http.get('https://evil.example.net/collect')

      expect(calls).toHaveLength(1)
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          '`$security` options are configured but the `security` module is not registered'
        )
      )

      warn.mockRestore()
    })
  })

  describe('URL schemes', () => {
    /**
     * URL scheme checking is the security module's `sanitizeUrl` capability:
     * deliberately omitting the module opts out of it like every other
     * protection, so scheme-bearing URLs reach their sinks unchecked.
     */
    test('it should leave URL schemes unchecked without the module', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            btn: {
              type: 'button',
              text: 'Go',
              href: 'javascript:void(0)',
            } as any,
          }),
        },
        { modules: modulesWithoutSecurity, $security: {} }
      )

      await nextTick()

      expect(form.find('a').attributes('href')).toBe('javascript:void(0)')
    })
  })

  describe('CSS values', () => {
    /**
     * CSS containment is the security module's `sanitizeCss` capability:
     * without the module, token values reach the stylesheet as written (the
     * deliberate wholesale opt-out).
     */
    test('it should leave CSS values unchecked without the module', () => {
      const vueform = createVueform({
        modules: { model, theme },
        tokens: { probe: 'red } * { background: blue ' },
      } as any)

      expect(vueform.getStyleTag()).toContain('background: blue')
    })
  })

  describe('slot content', () => {
    /**
     * The module family's contract. An absent module means the feature is
     * absent: `validation` absent counts everything valid, `security` absent
     * enforces nothing. With no `$security` intent configured, HTML slot
     * strings render as raw HTML (no engine, no gate) — while the string
     * renderer's structural floors (inert `<script>` handling, parsed `on*`
     * drops) still apply, since they are invariants, not policy.
     */
    test('it should render HTML slot strings permissively without the module', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: '<b>bold</b>' },
            },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: {},
        }
      )

      await nextTick()

      expect(form.find('.vf-label-group b').exists()).toBe(true)
      expect(form.find('.vf-label-group b').text()).toBe('bold')
    })

    /**
     * `allowHtml` configured without the module — a config that reads like
     * policy while nothing enforces it. Discovered intent stays permissive in
     * development so the app remains workable; production fails closed instead
     * — proven in the noop production suite above.
     */
    test('it should warn when `allowHtml` is configured without the module', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: '<b>bold</b>' },
            },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: { allowHtml: ['slots'] },
        }
      )

      await nextTick()

      expect(form.find('.vf-label-group b').exists()).toBe(true)
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          '`$security` options are configured but the `security` module is not registered'
        )
      )

      warn.mockRestore()
    })

    /**
     * Permissive component resolution without the module. Any **registered**
     * component name resolves; the registration guard keeps one-word text
     * slots (`'Hello'`) rendering as text instead of becoming unresolvable
     * elements.
     */
    test('it should resolve registered component names without the module', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: 'Resolved' },
            },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: {},
        },
        withComponents
      )

      await nextTick()

      expect(form.find('.resolved').exists()).toBe(true)
    })

    /**
     * No over-resolution — a permissive gate must not turn ordinary text into
     * component lookups. A component-shaped slot string that matches no
     * registered component renders as text, module or no module.
     */
    test('it should render unregistered component-shaped strings as text', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: 'Hello' },
            },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: {},
        }
      )

      await nextTick()

      expect(form.find('.vf-label-group').text()).toContain('Hello')
      expect(form.find('hello').exists()).toBe(false)
    })

    /**
     * `allowComponents` configured without the module — policy without an
     * enforcer. Discovered intent stays permissive in development while
     * resolution stays permissive; production fails closed — proven in the
     * noop production suite above.
     */
    test('it should warn when `allowComponents` is configured without the module', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Foo', template: 'Resolved' },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: { allowComponents: ['Resolved'] },
        },
        withComponents
      )

      await nextTick()

      expect(form.find('.resolved').exists()).toBe(true)
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          '`$security` options are configured but the `security` module is not registered'
        )
      )

      warn.mockRestore()
    })
  })

  describe('attribute bags', () => {
    /**
     * Attribute filtering (the built-in denylist and `banAttrs` alike) is the
     * security module's feature: a modular setup that omits the module gets
     * its attribute bags exactly as written, and a configured-but-unenforced
     * `banAttrs` warns once, like the ciphers and `allowOrigins`.
     */
    test('it should leave attribute bags unfiltered and warn about banAttrs', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'button',
              text: 'Go',
              parts: { button: { style: 'color: blue' } } as any,
            },
          }),
        },
        {
          modules: modulesWithoutSecurity,
          $security: { banAttrs: ['style'] },
        }
      )

      await nextTick()

      expect(form.find('button').attributes('style')).toContain('color: blue')
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          '`$security` options are configured but the `security` module is not registered'
        )
      )

      warn.mockRestore()
    })
  })

  describe('ciphers', () => {
    /**
     * A modular setup configuring ciphers without registering the `security`
     * module — encryption silently not happening. Drafts store plaintext (the
     * ciphers cannot run) but a dev warning states exactly that.
     */
    it('should store plaintext and warn when ciphers are configured without the module', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const store: Record<string, string> = {}
      const storage = {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => {
          store[key] = value
        },
        removeItem: (key: string) => {
          delete store[key]
        },
      }

      const reverse = (value: string) => value.split('').reverse().join('')

      const { name } = createForm(
        {
          name: 'draft_form',
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          draft: { storage },
        },
        {
          modules: modulesWithoutSecurity,
          $security: {
            encrypt: (value: string) => reverse(value),
            decrypt: (value: string) => reverse(value),
          },
        }
      )

      await flushPromises()

      name.update('Jane')
      await nextTick()
      await flushPromises()

      expect(store['vueform:draft_form']).toBe(JSON.stringify({ name: 'Jane' }))
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('the `security` module is not registered')
      )

      warnSpy.mockRestore()
    })
  })
})
