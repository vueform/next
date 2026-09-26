/**
 * # Network trust
 *
 * Threat model: request URLs, methods, and headers can be schema data (submit
 * `endpoint`, items endpoints), while credentials are attached by app-level
 * interceptors. Responses — including error bodies — are server-controlled. The
 * guarantees proven here: an app can pin the origins requests may target
 * (`$security.allowOrigins`), schema-level header props cannot override what
 * interceptors set, credentials never leak through error objects, hostile 422
 * bodies cannot crash error handling or render as HTML, and a response that
 * never really happened is never reported as a successful submission.
 */
import { nextTick } from 'vue'
import { createForm, flushPromises } from '../../helpers'
import {
  defineSchema,
  HttpError,
  useHttp,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from '#core'
import * as modules from '#core/modules'

function mockAdapter(response: Partial<HttpResponse> = {}): {
  adapter: HttpAdapter
  calls: HttpRequestConfig[]
} {
  const calls: HttpRequestConfig[] = []

  const adapter: HttpAdapter = async <T = any>(
    config: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    calls.push(config)
    return {
      data: (response.data ?? null) as T,
      status: response.status ?? 200,
      statusText: response.statusText ?? 'OK',
      headers: response.headers ?? {},
      config,
    }
  }

  return { adapter, calls }
}

const { security: _security, ...modulesWithoutSecurity } = modules as any

describe('Security: network trust', () => {
  describe('`$security.allowOrigins`', () => {
    /**
     * Threat: the default posture. A schema from a CMS or form builder supplies
     * an absolute `endpoint` pointing at an attacker's host; every submission
     * (and, with a global auth interceptor, the app's tokens) goes there. An
     * app that never considered this question should not be exposed to it.
     *
     * Measure: cross-origin requests are denied out of the box — an unset
     * `allowOrigins` is equivalent to `[]`, so reaching beyond the app's own
     * origin is something an app opts into, not out of.
     */
    test('it should deny cross-origin requests by default', async () => {
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        { $http: { adapter } }
      )

      await expect(
        useHttp(vueform).get('https://evil.example.net/collect')
      ).rejects.toMatchObject({ reason: 'blocked' })

      expect(calls).toHaveLength(0)
    })

    /**
     * Threat: over-blocking that would push apps to disable the feature. The
     * app's own origin is not a cross-origin destination, whether it is
     * addressed relatively or spelled out in full.
     *
     * Measure: relative URLs and absolute URLs on the current origin both pass
     * with no configuration.
     */
    test('it should allow the app own origin without configuration', async () => {
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        { $http: { adapter } }
      )

      const $http = useHttp(vueform)

      await $http.get('/api/save')
      await $http.get(`${window.location.origin}/api/save`)

      expect(calls).toHaveLength(2)
    })

    /**
     * Threat: none — the friction case. A cross-origin API configured through
     * `$http.baseURL` is developer code, and a schema can only reach it via a
     * relative URL, which is allowed anyway. Requiring the same origin to be
     * restated in `allowOrigins` would buy no security and break every app with
     * a separate API host.
     *
     * Measure: the `baseURL` origin is trusted implicitly — while an absolute
     * URL to a _different_ origin (the actual attack, which bypasses `baseURL`)
     * stays blocked.
     */
    test('it should trust the configured baseURL origin but nothing else', async () => {
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        { $http: { adapter, baseURL: 'https://api.example.com' } }
      )

      const $http = useHttp(vueform)

      await $http.get('/save')
      await $http.get('https://api.example.com/save')

      await expect(
        $http.get('https://evil.example.net/collect')
      ).rejects.toMatchObject({ reason: 'blocked' })

      expect(calls).toHaveLength(2)
    })

    /**
     * Threat: a semi-trusted schema pointing `endpoint` (or an items URL) at an
     * attacker origin, harvesting every submission — worse when a global
     * interceptor attaches an `Authorization` header to all requests.
     *
     * Measure: with `allowOrigins` set, absolute URLs outside the listed
     * origins are rejected before any adapter runs, with the dedicated
     * `'blocked'` reason.
     */
    test('it should block requests to unlisted origins before the adapter runs', async () => {
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        {
          $http: { adapter },
          $security: { allowOrigins: ['https://api.example.com'] },
        }
      )

      const $http = useHttp(vueform)

      await expect(
        $http.get('https://evil.example.net/collect')
      ).rejects.toMatchObject({ reason: 'blocked' })

      expect(calls).toHaveLength(0)
    })

    /**
     * Threat: none — the positive paths. Relative URLs stay on the page's own
     * origin and listed origins are the app's declared API surface.
     *
     * Measure: both pass untouched.
     */
    test('it should allow relative URLs and listed origins', async () => {
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        {
          $http: { adapter },
          $security: { allowOrigins: ['https://api.example.com'] },
        }
      )

      const $http = useHttp(vueform)

      await $http.get('/api/save')
      await $http.get('https://api.example.com/save')

      expect(calls).toHaveLength(2)
    })

    /**
     * Threat: multi-environment apps (per-tenant or per-stage API subdomains)
     * forced to enumerate every host — the friction that pushes configs to
     * `['*']`. The wildcard must stay narrow: it may widen the _subdomain_,
     * never the scheme, the apex domain, or unrelated hosts.
     *
     * Measure: `https://*.example.com` matches any subdomain (at any depth) of
     * `example.com` on that scheme — and nothing else: the apex, other hosts,
     * and the same host on `http:` all stay blocked.
     *
     * Verified red→green: wildcard entries were rejected as invalid (and so
     * never matched) before the matcher landed.
     */
    test('it should support subdomain wildcards without widening scheme or apex', async () => {
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        {
          $http: { adapter },
          $security: { allowOrigins: ['https://*.example.com'] },
        }
      )

      const $http = useHttp(vueform)

      await $http.get('https://api.example.com/save')
      await $http.get('https://a.b.example.com/save')

      await expect($http.get('https://example.com/save')).rejects.toMatchObject(
        { reason: 'blocked' }
      )
      await expect(
        $http.get('http://api.example.com/save')
      ).rejects.toMatchObject({ reason: 'blocked' })
      await expect(
        $http.get('https://evilexample.com/save')
      ).rejects.toMatchObject({ reason: 'blocked' })
      await expect(
        $http.get('https://api.example.com.evil.net/save')
      ).rejects.toMatchObject({ reason: 'blocked' })

      expect(calls).toHaveLength(2)
    })

    /**
     * Threat: the port variant of the same friction — a dev/staging API on a
     * non-standard port. The wildcard covers ports on one exact host; it must
     * not leak to subdomains or other schemes.
     *
     * Measure: `https://api.example.com:*` matches that host on any port
     * (including the scheme default when no port is spelled out); host and
     * scheme still match exactly.
     *
     * Verified red→green: port-wildcard entries were rejected as invalid before
     * the matcher landed.
     */
    test('it should support port wildcards on an exact host', async () => {
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        {
          $http: { adapter },
          $security: { allowOrigins: ['https://api.example.com:*'] },
        }
      )

      const $http = useHttp(vueform)

      await $http.get('https://api.example.com:8443/save')
      await $http.get('https://api.example.com/save')

      await expect(
        $http.get('https://other.example.com:8443/save')
      ).rejects.toMatchObject({ reason: 'blocked' })
      await expect(
        $http.get('http://api.example.com:8443/save')
      ).rejects.toMatchObject({ reason: 'blocked' })

      expect(calls).toHaveLength(2)
    })

    /**
     * Threat: a typo'd wildcard (`https://api.*.com`, `https://exa*mple.com`)
     * silently matching nothing — or worse, something unintended.
     *
     * Measure: only the two documented forms compile (`scheme://*.host` and
     * `scheme://host:*`); anything else is dropped with a dev warning and never
     * matches.
     */
    test('it should reject malformed wildcard entries with a warning', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        {
          $http: { adapter },
          $security: { allowOrigins: ['https://exa*mple.com'] },
        }
      )

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('exa*mple.com'))

      await expect(
        useHttp(vueform).get('https://example.com/save')
      ).rejects.toMatchObject({ reason: 'blocked' })

      expect(calls).toHaveLength(0)

      warn.mockRestore()
    })

    /**
     * Threat: scheme-relative `//evil.example.net/x` — inherits the page's
     * scheme and goes cross-origin, an easy blind spot for prefix checks.
     *
     * Measure: scheme-relative URLs must match the allowlist like absolute
     * ones.
     */
    /**
     * Threat: a misread of the option turning the policy inside out. An empty
     * array is the shape a developer writes when they mean "lock this down",
     * and every other `allow*` option reads an empty list as "permit nothing" —
     * if this one alone read it as "permit everything", a config intended to
     * harden the app would silently disable the gate.
     *
     * Measure: `[]` is a configured-but-empty allowlist. Relative URLs (the
     * page's own origin) still pass; every absolute URL is blocked.
     */
    test('it should treat an empty allowlist as permitting nothing absolute', async () => {
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        { $http: { adapter }, $security: { allowOrigins: [] } }
      )

      const $http = useHttp(vueform)

      await expect(
        $http.get('https://api.example.com/save')
      ).rejects.toMatchObject({ reason: 'blocked' })

      await $http.get('/api/save')

      expect(calls).toHaveLength(1)
    })

    /**
     * Threat: the opposite misread. `'*'` is the idiom developers reach for to
     * mean "any origin"; treating it as an invalid entry would leave a
     * configured-but-empty allowlist that blocks every absolute request — an
     * app broken in production off the back of a dev-only warning.
     *
     * Measure: `'*'` is honored as an explicit opt-out that disables the origin
     * restriction entirely — the only spelling that does.
     */
    test('it should treat `*` as an explicit no-restriction opt-out', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        { $http: { adapter }, $security: { allowOrigins: ['*'] } }
      )

      await useHttp(vueform).get('https://anywhere.example.net/x')

      expect(calls).toHaveLength(1)
      expect(warn).not.toHaveBeenCalled()

      warn.mockRestore()
    })

    test('it should block scheme-relative URLs to unlisted origins', async () => {
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        {
          $http: { adapter },
          $security: { allowOrigins: ['https://api.example.com'] },
        }
      )

      const $http = useHttp(vueform)

      await expect(
        $http.get('//evil.example.net/collect')
      ).rejects.toMatchObject({ reason: 'blocked' })

      expect(calls).toHaveLength(0)
    })

    /**
     * Threat: a modular setup configuring `allowOrigins` without registering
     * the security module — the policy silently not being enforced.
     *
     * Measure: requests proceed in development (the option cannot be enforced)
     * while `createVueform()`'s orphan-options warning states exactly that at
     * startup; production blocks every request instead.
     */
    test('it should warn when `allowOrigins` is configured without the module', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { adapter, calls } = mockAdapter()

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

  describe('header precedence', () => {
    /**
     * Threat: a schema-level `headers` prop stripping or overriding the
     * CSRF/auth headers an app's interceptor attaches.
     *
     * Measure: interceptors run AFTER the per-request header merge, so they
     * always have the final word (pre-existing guarantee, pinned here).
     */
    test('it should let interceptors override request-level headers', async () => {
      const { adapter, calls } = mockAdapter()

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        {
          $http: {
            adapter,
            onRequest: [
              (config) => {
                config.headers = { ...config.headers, 'X-CSRF': 'real-token' }
                return config
              },
            ],
          },
        }
      )

      const $http = useHttp(vueform)
      await $http.request({
        url: '/api/save',
        headers: { 'X-CSRF': 'spoofed' },
      })

      expect(calls[0].headers?.['X-CSRF']).toBe('real-token')
    })
  })

  describe('credential redaction in errors', () => {
    /**
     * Threat: `HttpError`s surface on public form results (`fail` handlers,
     * `result.response`); an app error reporter serializing one would ship the
     * `Authorization` header an interceptor attached — credentials in a logging
     * backend.
     *
     * Measure: credential-bearing headers are replaced with `[redacted]` in the
     * config the error carries; other headers stay readable.
     */
    test('it should redact credential headers on HttpError', async () => {
      const failing: HttpAdapter = async (config) => {
        throw new HttpError('boom', config, 'http')
      }

      const { vueform } = createForm(
        { schema: defineSchema({ name: { type: 'text' } }) },
        { $http: { adapter: failing } }
      )

      const $http = useHttp(vueform)

      let caught: HttpError | undefined
      try {
        await $http.request({
          url: '/api/save',
          headers: {
            Authorization: 'Bearer secret-token',
            Cookie: 'session=abc',
            'X-Trace': 'kept',
          },
        })
      } catch (e) {
        caught = e as HttpError
      }

      expect(caught).toBeInstanceOf(HttpError)
      expect(caught!.config.headers?.Authorization).toBe('[redacted]')
      expect(caught!.config.headers?.Cookie).toBe('[redacted]')
      expect(caught!.config.headers?.['X-Trace']).toBe('kept')
      expect(JSON.stringify(caught!.config)).not.toContain('secret-token')
    })
  })

  describe('hostile 422 bodies', () => {
    /**
     * Threat: a 422 body whose `errors` values are strings or scalars instead
     * of arrays — under the old code a `TypeError` escaped from INSIDE error
     * handling, and a string value appended one error per character.
     *
     * Measure: the server error map is coerced to `Record<string, string[]>`
     * before anything iterates it.
     *
     * Verified red→green: the string-valued body threw before the fix.
     */
    test('it should coerce non-array 422 error values', async () => {
      const failing422: HttpAdapter = async (config) => {
        throw new HttpError('unprocessable', config, 'http', {
          data: { errors: { name: 'Taken', misc: 42, list: ['A', 7, 'B'] } },
          status: 422,
          statusText: 'Unprocessable',
          headers: {},
          config,
        })
      }

      const { form$, name } = createForm(
        {
          schema: defineSchema({ name: { type: 'text', default: 'x' } }),
          endpoint: '/api/save',
          setInvalid: true,
        },
        { $http: { adapter: failing422 } }
      )

      const result = await form$.submit()
      await flushPromises()

      expect(result?.type).toBe('invalid')
      expect((result as any).errors).toEqual({
        name: ['Taken'],
        misc: [],
        list: ['A', 'B'],
      })
      // One coherent message — not one per character of "Taken".
      expect(name.errors).toHaveLength(1)
    })

    /**
     * Threat: server-supplied error messages carrying HTML — a compromised or
     * hostile backend must not gain an HTML sink through the message bag.
     *
     * Measure: messages render through Vue's text interpolation, escaped
     * (pre-existing guarantee, pinned here).
     */
    test('it should render server error messages escaped, never as HTML', async () => {
      const failing422: HttpAdapter = async (config) => {
        throw new HttpError('unprocessable', config, 'http', {
          data: {
            errors: {
              name: ['<img src=x onerror="window.__http1 = true">'],
            },
          },
          status: 422,
          statusText: 'Unprocessable',
          headers: {},
          config,
        })
      }

      const { form, form$ } = createForm(
        {
          schema: defineSchema({ name: { type: 'text', default: 'x' } }),
          endpoint: '/api/save',
          setInvalid: true,
        },
        { $http: { adapter: failing422 } }
      )

      await form$.submit()
      await flushPromises()
      await nextTick()

      expect(form.find('.vf-errors img').exists()).toBe(false)
      expect(form.text()).toContain('<img')
      expect((window as any).__http1).toBeUndefined()
    })
  })

  describe('fabricated successes', () => {
    /**
     * Threat: an adapter resolving with a non-2xx (or 0) status instead of
     * throwing — under the old code the submit was classified a SUCCESS, firing
     * `resetOnSuccess`/draft clearing on a request that failed or never
     * happened: silent data loss.
     *
     * Measure: a resolved response with a status outside 2xx classifies as
     * `fail` with `reason: 'http'`.
     *
     * Verified red→green: `{status: 0}` produced a success before the fix.
     */
    test('it should classify a resolved non-2xx response as fail', async () => {
      const { adapter } = mockAdapter({ status: 0 })

      const { form$ } = createForm(
        {
          schema: defineSchema({ name: { type: 'text', default: 'x' } }),
          endpoint: '/api/save',
        },
        { $http: { adapter } }
      )

      const result = await form$.submit()

      expect(result?.type).toBe('fail')
      expect((result as any).reason).toBe('http')
    })
  })
})
