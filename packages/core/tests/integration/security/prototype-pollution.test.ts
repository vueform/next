/**
 * # Prototype pollution and data-layer hygiene
 *
 * Threat model: untrusted JSON reaches the data layer from three directions —
 * server responses written into the model (`setResponse`), autosave drafts
 * parsed from localStorage, and schema documents. `JSON.parse` happily produces
 * own `__proto__` keys, and a naive `obj[key] = v` assignment on one re-points
 * the object's prototype. Separately, expression paths and server error-map
 * keys are attacker-chosen strings used as lookup paths. The guarantees:
 * `Object.prototype` is never polluted, forbidden keys never survive merges or
 * normalization, denylisted paths resolve to nothing (never to the root
 * object), and — the gadget case — a polluted `Object.prototype` elsewhere on
 * the page cannot flip Vueform's own security policy.
 */
import {
  clone,
  createVueform,
  defineSchema,
  get,
  getSecurityModule,
  merge,
  mergeOrReplace,
  model,
  normalize,
  security,
  set,
  unset,
} from '@vueform/core'
import dompurify from '@vueform/dompurify'
import { nextTick } from 'vue'
import { createForm, flushPromises } from '../../helpers'

describe('Security: prototype pollution', () => {
  describe('path utilities', () => {
    /**
     * Threat: attacker-chosen path strings (`__proto__.polluted`,
     * `constructor.prototype.x`) walking into prototype objects through
     * `get`/`set`/`unset`.
     *
     * Measure: prototype path segments are denylisted — reads resolve to the
     * default value and writes are refused.
     */
    test('it should refuse prototype paths in get/set/unset', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const obj: Record<string, any> = { a: 1 }

      set(obj, '__proto__.polluted', 'x')
      set(obj, 'constructor.prototype.polluted', 'x')

      expect(({} as any).polluted).toBeUndefined()
      expect(get(obj, '__proto__')).toBeUndefined()
      expect(unset(obj, '__proto__.a')).toBe(false)

      warn.mockRestore()
    })

    /**
     * Threat: the root-leak variant — a denylisted path that resolves to the
     * WHOLE object instead of nothing would hand `form.get('el@constructor')`
     * the entire context.
     *
     * Measure: a denylisted path returns `undefined` (the default value), never
     * the root.
     *
     * Verified red→green: `get(obj, 'constructor')` returned `obj` itself
     * before the fix.
     */
    test('it should not leak the root object for denylisted paths', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const obj = { secret: 'value' }

      expect(get(obj, 'constructor')).toBeUndefined()
      expect(get(obj, '__proto__', 'fallback')).toBe('fallback')

      warn.mockRestore()
    })

    /**
     * Threat: none — inherited properties must simply never be readable through
     * the data API.
     *
     * Measure: `get` requires own properties.
     */
    test('it should not read inherited properties', () => {
      const obj = { a: 1 }

      expect(get(obj, 'toString')).toBeUndefined()
      expect(get(obj, 'hasOwnProperty')).toBeUndefined()
    })
  })

  describe('merge and normalization walks', () => {
    /**
     * Threat: `JSON.parse('{"__proto__": {...}}')` produces an own `__proto__`
     * key; assigning it (`out[key] = v`) re-points the result's prototype —
     * objects that lie about their own keys, silent merge-vs-replace flips, and
     * values visible without being enumerable.
     *
     * Measure: forbidden keys are skipped in every object walk (`merge`,
     * `mergeOrReplace`, `clone`, `normalize`), so parsed payloads shed them on
     * entry.
     *
     * Verified red→green: the merged object carried an inherited `hacked`
     * member before the fix.
     */
    test('it should shed __proto__ keys in merges, clones, and normalization', () => {
      const hostile = JSON.parse('{"a": 1, "__proto__": {"hacked": true}}')

      const merged = merge({}, hostile)
      expect((merged as any).hacked).toBeUndefined()
      expect(Object.getPrototypeOf(merged)).toBe(Object.prototype)

      const replaced = mergeOrReplace({ a: 0 }, hostile)
      expect((replaced as any).hacked).toBeUndefined()

      const cloned = clone(hostile)
      expect((cloned as any).hacked).toBeUndefined()

      const normalized = normalize(hostile)
      expect((normalized as any).hacked).toBeUndefined()

      expect(({} as any).hacked).toBeUndefined()
    })

    /**
     * Threat: the full chain — a server response carrying `__proto__` written
     * back into the form model via `setResponse`.
     *
     * Measure: `Object.prototype` stays clean and the poisoned subtree sheds
     * its forbidden keys before entering the model.
     */
    test('it should keep server payloads with __proto__ out of the model', async () => {
      const responder = async (config: any) => ({
        data: {
          payload: JSON.parse(
            '{"address": {"__proto__": {"city": "evil"}, "zip": "1"}}'
          ),
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      })

      const { form$ } = createForm(
        {
          schema: defineSchema({
            address: {
              type: 'group',
              schema: {
                zip: { type: 'text' },
              },
            },
          }),
          endpoint: '/api/save',
          setResponse: true,
        },
        { $http: { adapter: responder as any } }
      )

      await form$.submit()
      await flushPromises()

      expect(({} as any).city).toBeUndefined()
      expect((form$.model as any).address?.city).toBeUndefined()
      // `normalize` parses numeric strings on the way in.
      expect((form$.model as any).address?.zip).toBe(1)
    })
  })

  describe('stored drafts', () => {
    /**
     * Threat: the storage direction of the same chain — a tampered localStorage
     * draft carrying `__proto__` restored into the form model on mount.
     *
     * Measure: the parsed draft passes through the same guarded walks as server
     * data; `Object.prototype` stays clean and no inherited value reaches the
     * model.
     */
    test('it should keep stored drafts with __proto__ out of the model', async () => {
      const store: Record<string, string> = {
        'vueform:draft_form':
          '{"name": "Stored", "__proto__": {"hacked": true}}',
      }
      const storage = {
        getItem: (key: string) => (key in store ? store[key] : null),
        setItem: (key: string, value: string) => {
          store[key] = value
        },
        removeItem: (key: string) => {
          delete store[key]
        },
      }

      const { form$, name } = createForm({
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: { local: { storage } },
      })

      await flushPromises()

      expect(name.value).toBe('Stored')
      expect(({} as any).hacked).toBeUndefined()
      expect((form$.model as any).hacked).toBeUndefined()
    })
  })

  describe('expression paths', () => {
    /**
     * Threat: schema expression strings probing the prototype chain —
     * `{constructor.name}` stringifying constructors, `{__proto__}` leaking
     * structure.
     *
     * Measure: the built-in path adapter resolves through the guarded `get`, so
     * prototype probes produce empty output.
     */
    test('it should resolve prototype-probing expressions to nothing', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { greeting } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'Jane' },
          greeting: {
            type: 'text',
            label: 'A{constructor.name}B{__proto__}C',
          },
        }),
      })

      await nextTick()

      expect(greeting.label).toBe('ABC')

      warn.mockRestore()
    })
  })

  describe('policy flags cannot be flipped by pollution elsewhere', () => {
    /**
     * Threat: the gadget case. Some OTHER library on the page has a
     * prototype-pollution bug and an attacker sets `Object.prototype.sanitizer`
     * to a function of their choosing. An inherited read would install it as
     * the sanitization engine — replacing the real one, or (in an app without
     * one) flipping production's render-empty fallback into rendering
     * attacker-shaped output — with no code execution inside Vueform at all.
     *
     * Measure: every `$security` option is read as an OWN property, so an
     * inherited engine is invisible: the real engine keeps running, and an
     * engineless module keeps its fallback.
     *
     * Verified red→green: with a naive `options.sanitizer` read, the polluted
     * engine's output reached the caller.
     */
    test('it should ignore a polluted Object.prototype.sanitizer', async () => {
      ;(Object.prototype as any).sanitizer = () => 'POLLUTED'
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      try {
        // With a real engine: it keeps running.
        const withEngine = getSecurityModule(
          createVueform({
            modules: { model, security },
            plugins: [dompurify()],
            $security: { allowHtml: ['content'] },
          } as any)
        )

        expect(
          withEngine.sanitizeHtml('<img src=x onerror="window.__pp1 = true">')
        ).not.toContain('POLLUTED')
        expect(
          withEngine.sanitizeHtml('<img src=x onerror="window.__pp1 = true">')
        ).not.toContain('onerror')

        // Without one: the fallback stays in charge (dev identity + warn),
        // never the inherited function.
        const engineless = getSecurityModule(
          createVueform({
            modules: { model, security },
            $security: { allowHtml: ['content'] },
          } as any)
        )

        expect(engineless.sanitizeHtml('<b>x</b>')).toBe('<b>x</b>')
      } finally {
        delete (Object.prototype as any).sanitizer
        warn.mockRestore()
      }
    })

    /**
     * Threat: the same gadget against the allowlists — a polluted
     * `Object.prototype.allowHtml`/`allowComponents` granting rendering rights
     * nothing in the config granted.
     *
     * Measure: own-property reads; inherited allowlists are invisible.
     */
    test('it should ignore polluted allowHtml and allowComponents', async () => {
      ;(Object.prototype as any).allowHtml = ['content', 'grid', 'slots']
      ;(Object.prototype as any).allowComponents = ['Leaked']

      try {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const vueform = createVueform({
          modules: { model, security },
          plugins: [dompurify()],
          $security: {},
        } as any)

        const sec = getSecurityModule(vueform)

        // The polluted allowlists granted nothing.
        expect(sec.allowsHtml('content')).toBe(false)
        expect(sec.allowsComponent('Leaked')).toBe(false)

        warn.mockRestore()
      } finally {
        delete (Object.prototype as any).allowHtml
        delete (Object.prototype as any).allowComponents
      }
    })
  })

  describe('server error-map keys', () => {
    /**
     * Threat: a 422 error map keyed `constructor` or `__proto__` — lookup keys
     * chosen by the server walking into unintended objects.
     *
     * Measure: element lookup is a `Map`, which has no prototype chain to walk;
     * unknown keys resolve to no element and are ignored.
     */
    test('it should ignore prototype-named keys in server error maps', async () => {
      const failing422 = async (config: any) => {
        const err = new (await import('@vueform/core')).HttpError(
          'unprocessable',
          config,
          'http',
          {
            // Built via JSON.parse: an object LITERAL `__proto__` key would
            // set the prototype instead of an own key.
            data: JSON.parse(
              '{"errors": {"constructor": ["x"], "__proto__": ["y"], "name": ["Taken"]}}'
            ),
            status: 422,
            statusText: 'Unprocessable',
            headers: {},
            config,
          }
        )
        throw err
      }

      const { form$, name } = createForm(
        {
          schema: defineSchema({ name: { type: 'text', default: 'x' } }),
          endpoint: '/api/save',
          setInvalid: true,
        },
        { $http: { adapter: failing422 as any } }
      )

      const result = await form$.submit()
      await flushPromises()

      expect(result?.type).toBe('invalid')
      expect(name.errors).toHaveLength(1)
      expect(({} as any).polluted).toBeUndefined()
    })
  })
})
