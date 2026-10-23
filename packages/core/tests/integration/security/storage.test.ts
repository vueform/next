import {
  defineSchema,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from '@vueform/core'
import * as modules from '@vueform/core/modules'
/**
 * # Persistence security (draft storage)
 *
 * Threat model: drafts write the form model — potentially PII — into
 * localStorage, on a device the app doesn't control (shared browsers, stolen
 * disks, backups). The storage key is schema-reachable and localStorage is a
 * shared namespace, and drafts read back from storage are untrusted data. The
 * guarantees: schema keys cannot address arbitrary storage entries, drafts
 * encrypt through the app's `$security` ciphers with plaintext being a loud or
 * deliberate choice, `sensitive` fields never touch the disk, and corrupt or
 * unreadable drafts are discarded instead of trusted.
 */
import { nextTick } from 'vue'

import { createForm, flushPromises } from '../../helpers'

function mockStorage(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial }

  return {
    store,
    storage: {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
    },
  }
}

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

const reverse = (value: string) => value.split('').reverse().join('')

const { security: _security, ...modulesWithoutSecurity } = modules as any

describe('Security: persistence', () => {
  describe('storage keys are namespaced', () => {
    /**
     * Threat: `draft: { key: "access_token" }` — a schema
     * addressing an arbitrary localStorage entry, clobbering the host app's
     * session token on every keystroke (and reading whatever was stored there
     * back into the form).
     *
     * Measure: custom keys are forced under the `vueform:` prefix, so the
     * draft cycle can only ever touch Vueform's own namespace.
     *
     * Verified red→green: the un-prefixed key was written before the fix.
     */
    test('it should force custom keys under the vueform: prefix', async () => {
      const { store, storage } = mockStorage({
        access_token: 'the-apps-session-token',
      })

      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        draft: { storage, key: 'access_token' },
      })

      await nextTick()

      name.update('Jane')
      await flushPromises()

      // The app's entry is untouched; the draft lives in the namespace.
      expect(store['access_token']).toBe('the-apps-session-token')
      expect(JSON.parse(store['vueform:access_token'])).toEqual({
        name: 'Jane',
      })
    })

    /**
     * Threat: none — idempotence check.
     *
     * Measure: an already-prefixed custom key is not double-prefixed.
     */
    test('it should not double-prefix an already prefixed key', async () => {
      const { store, storage } = mockStorage()

      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        draft: { storage, key: 'vueform:my-draft' },
      })

      await nextTick()

      name.update('Jane')
      await flushPromises()

      expect(Object.keys(store)).toEqual(['vueform:my-draft'])
    })
  })

  describe('draft encryption', () => {
    /**
     * Threat: plaintext drafts on shared or stolen devices — the model can hold
     * names, addresses, anything the form collects.
     *
     * Measure: drafts pass through the app-level `$security.encrypt` cipher
     * before storage, with the `'draft'` purpose tag so one cipher
     * implementation can serve every persisting feature. (Migrated from the
     * autosave suite.)
     */
    it('should encrypt drafts with the configured $security cipher', async () => {
      const { store, storage } = mockStorage()
      const purposes: string[] = []

      const { name } = createForm(
        {
          name: 'draft_form',
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          draft: { storage },
        },
        {
          $security: {
            encrypt: (value: string, purpose: string) => {
              purposes.push(purpose)
              return reverse(value)
            },
            decrypt: (value: string) => reverse(value),
          },
        }
      )

      await nextTick()

      name.update('Jane')
      await flushPromises()

      expect(store['vueform:draft_form']).toBe(
        reverse(JSON.stringify({ name: 'Jane' }))
      )
      expect(purposes).toContain('draft')
    })

    /**
     * Threat: none — the read path of the same guarantee.
     *
     * Measure: stored drafts decrypt through `$security.decrypt` on load.
     * (Migrated from the autosave suite.)
     */
    it('should decrypt drafts on the automatic load', async () => {
      const { storage } = mockStorage({
        'vueform:draft_form': reverse(JSON.stringify({ name: 'Stored' })),
      })

      const { name } = createForm(
        {
          name: 'draft_form',
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          draft: { storage },
        },
        {
          $security: {
            encrypt: (value: string) => reverse(value),
            decrypt: (value: string) => reverse(value),
          },
        }
      )

      await flushPromises()

      expect(name.value).toBe('Stored')
    })

    /**
     * Threat: real-world ciphers are Web Crypto, which is async — a sync-only
     * pipeline would push apps back to plaintext.
     *
     * Measure: both ciphers may be async end to end. (Migrated from the
     * autosave suite.)
     */
    it('should support async ciphers', async () => {
      const { store, storage } = mockStorage({
        'vueform:draft_form': reverse(JSON.stringify({ name: 'Stored' })),
      })

      const { form$, name } = createForm(
        {
          name: 'draft_form',
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          draft: { storage, restore: false, on: ['step'] },
        },
        {
          $security: {
            encrypt: async (value: string) => reverse(value),
            decrypt: async (value: string) => reverse(value),
          },
        }
      )

      await flushPromises()

      expect(await form$.restoreDraft()).toBe(true)
      await nextTick()
      expect(name.value).toBe('Stored')

      name.update('Jane')
      ;(form$ as any).fire('step')
      await flushPromises()

      expect(store['vueform:draft_form']).toBe(
        reverse(JSON.stringify({ name: 'Jane' }))
      )
    })

    /**
     * Threat: none — the per-form escape hatch must stay deliberate and local.
     *
     * Measure: `draft.encrypt: false` skips the app-level cipher for that form
     * only. (Migrated from the autosave suite.)
     */
    it('should skip the cipher when draft.encrypt is false', async () => {
      const { store, storage } = mockStorage({
        'vueform:draft_form': JSON.stringify({ name: 'Stored' }),
      })

      const { form$, name } = createForm(
        {
          name: 'draft_form',
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          draft: { storage, encrypt: false, on: ['step'] },
        },
        {
          $security: {
            encrypt: (value: string) => reverse(value),
            decrypt: (value: string) => reverse(value),
          },
        }
      )

      await flushPromises()

      expect(name.value).toBe('Stored')

      name.update('Jane')
      ;(form$ as any).fire('step')
      await flushPromises()

      expect(store['vueform:draft_form']).toBe(JSON.stringify({ name: 'Jane' }))
    })

    /**
     * Threat: silent plaintext — an app persisting drafts without ever deciding
     * whether that's acceptable.
     *
     * Measure: storing drafts with no ciphers configured warns in dev;
     * plaintext is a decision, not a default that goes unnoticed. (Migrated
     * from the autosave suite.)
     */
    it('should warn when drafts are stored without configured ciphers', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { storage } = mockStorage()

      createForm({
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        draft: { storage },
      })

      await flushPromises()

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('stored in plaintext')
      )

      warnSpy.mockRestore()
    })

    /**
     * Threat: none — the deliberate opt-outs must not nag.
     *
     * Measure: registering identity ciphers (a conscious opt-out) silences the
     * plaintext warning. (Migrated from the autosave suite.)
     */
    it('should not warn when identity ciphers are registered as a conscious opt-out', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { storage } = mockStorage()

      createForm(
        {
          name: 'draft_form',
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          draft: { storage },
        },
        {
          $security: {
            encrypt: (value: string) => value,
            decrypt: (value: string) => value,
          },
        }
      )

      await flushPromises()

      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    /**
     * Threat: none — the per-form opt-out variant.
     *
     * Measure: `draft.encrypt: false` also counts as a conscious decision.
     * (Migrated from the autosave suite.)
     */
    it('should not warn when the form opts out with draft.encrypt false', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { storage } = mockStorage()

      createForm({
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        draft: { storage, encrypt: false },
      })

      await flushPromises()

      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    /**
     * Threat: a stored blob that no longer decrypts (rotated key, tampered
     * ciphertext) being restored into the form as garbage — or worse, trusted.
     *
     * Measure: a throwing `decrypt` marks the draft unreadable: it is not
     * restored and is removed from storage. (Migrated from the autosave
     * suite.)
     */
    it('should discard the draft when decrypt throws', async () => {
      const { store, storage } = mockStorage({
        'vueform:draft_form': 'ciphertext-for-another-key',
      })

      const { name } = createForm(
        {
          name: 'draft_form',
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          draft: { storage },
        },
        {
          $security: {
            encrypt: (value: string) => reverse(value),
            decrypt: () => {
              throw new Error('bad key')
            },
          },
        }
      )

      await flushPromises()

      expect(name.value).toBe('John')
      expect('vueform:draft_form' in store).toBe(false)
    })

    /**
     * Threat: a race where an in-flight async encryption lands its write AFTER
     * the user cleared the draft — resurrecting data the user asked to delete.
     *
     * Measure: a write sequence counter drops stale writes. (Migrated from the
     * autosave suite.)
     */
    it('should not land an in-flight write after discardDraft', async () => {
      const { store, storage } = mockStorage()

      let release!: (value: string) => void
      const pending = new Promise<string>((resolve) => (release = resolve))

      const { form$, name } = createForm(
        {
          name: 'draft_form',
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          draft: { storage },
        },
        {
          $security: {
            encrypt: (value: string) => pending.then(() => value),
            decrypt: (value: string) => value,
          },
        }
      )

      await nextTick()

      name.update('Jane')
      await nextTick()

      form$.discardDraft()
      release('done')
      await flushPromises()

      expect('vueform:draft_form' in store).toBe(false)
    })

    /**
     * Threat: a modular setup configuring ciphers without registering the
     * `security` module — encryption silently not happening.
     *
     * Measure: drafts store plaintext (the ciphers cannot run) but a dev
     * warning states exactly that. (Migrated from the module-absence suite.)
     */
    it('should store plaintext and warn when ciphers are configured without the module', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { store, storage } = mockStorage()

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

  describe('sensitive fields never touch the disk', () => {
    /**
     * Threat: passwords and card data persisted into localStorage as part of a
     * draft — the exact values a stolen disk or shared browser exposes.
     *
     * Measure: `sensitive: true` values are stripped from the local draft
     * before storage. (Migrated from the autosave suite.)
     */
    it('should strip sensitive element values from the local draft', async () => {
      const { store, storage } = mockStorage()

      const { name } = createForm({
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
          password: { type: 'text', sensitive: true, default: 'secret' },
        }),
        draft: { storage },
      })

      await nextTick()

      name.update('Jane')
      await flushPromises()

      expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Jane' })
    })

    /**
     * Threat: the container variants of the same leak — a sensitive nested
     * group (card data) or flat group (secrets).
     *
     * Measure: `sensitive` on a container strips its whole subtree. (Migrated
     * from the autosave suite.)
     */
    it('should strip sensitive containers and nested sensitive elements', async () => {
      const { store, storage } = mockStorage()

      const { name } = createForm({
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
          card: {
            type: 'group',
            nested: true,
            sensitive: true,
            schema: {
              number: { type: 'text', default: '4111111111111111' },
              cvc: { type: 'text', default: '123' },
            },
          },
          secrets: {
            type: 'group',
            sensitive: true,
            schema: {
              token: { type: 'text', default: 'abc' },
            },
          },
          account: {
            type: 'group',
            nested: true,
            schema: {
              email: { type: 'text', default: 'john@test.com' },
              password: { type: 'text', sensitive: true, default: 'secret' },
            },
          },
        }),
        draft: { storage },
      })

      await nextTick()

      name.update('Jane')
      await flushPromises()

      expect(JSON.parse(store['vueform:draft_form'])).toEqual({
        name: 'Jane',
        account: { email: 'john@test.com' },
      })
    })

    /**
     * Threat: the navigation save path skipping the stripping the
     * change-triggered one applies.
     *
     * Measure: navigation-event saves strip the same way. (Migrated from the
     * autosave suite.)
     */
    it('should strip sensitive values from navigation-triggered drafts', async () => {
      const { store, storage } = mockStorage()

      const { form$ } = createForm({
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
          password: { type: 'text', sensitive: true, default: 'secret' },
        }),
        draft: { storage, on: ['step'] },
      })

      await nextTick()

      ;(form$ as any).fire('step')
      await flushPromises()

      expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'John' })
    })

    /**
     * Threat: autosave shipping passwords and card data to the server on every
     * keystroke — values the user never chose to submit yet, landing in logs
     * and intermediate storage.
     *
     * Measure: `sensitive: true` values are stripped from remote autosave
     * payloads by default, same as from drafts. Regular submits are unaffected.
     */
    it('should strip sensitive values from remote autosave data by default', async () => {
      const { adapter, calls } = mockAdapter()
      const { store, storage } = mockStorage()

      vi.useFakeTimers()

      const { name } = createForm(
        {
          name: 'draft_form',
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
            password: { type: 'text', sensitive: true, default: 'secret' },
          }),
          autosave: {
            endpoint: '/api/autosave',
          },
          draft: { storage },
        },
        { $http: { adapter } }
      )

      await nextTick()

      name.update('Jane')
      await nextTick()

      vi.advanceTimersByTime(1000)
      await flushPromises()

      expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Jane' })
      expect(calls).toHaveLength(1)
      expect(calls[0].data).toEqual({ name: 'Jane' })

      vi.useRealTimers()
    })

    /**
     * Threat: none — the deliberate opt-in. An app autosaving to its own
     * authenticated server may legitimately need the full model.
     *
     * Measure: `autosave.sensitive: true` keeps sensitive values in the remote
     * payload. The draft stays stripped unless it opts in itself.
     */
    it('should send sensitive values when autosave.sensitive is true', async () => {
      const { adapter, calls } = mockAdapter()
      const { store, storage } = mockStorage()

      vi.useFakeTimers()

      const { name } = createForm(
        {
          name: 'draft_form',
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
            password: { type: 'text', sensitive: true, default: 'secret' },
          }),
          autosave: {
            endpoint: '/api/autosave',
            sensitive: true,
          },
          draft: { storage },
        },
        { $http: { adapter } }
      )

      await nextTick()

      name.update('Jane')
      await nextTick()

      vi.advanceTimersByTime(1000)
      await flushPromises()

      // the opt-in is per target: the draft stays stripped
      expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Jane' })
      expect(calls).toHaveLength(1)
      expect(calls[0].data).toEqual({ name: 'Jane', password: 'secret' })

      vi.useRealTimers()
    })

    /**
     * Threat: none — the draft-side opt-in variant.
     *
     * Measure: `draft.sensitive: true` stores sensitive values in the draft.
     */
    it('should store sensitive values when draft.sensitive is true', async () => {
      const { store, storage } = mockStorage()

      const { name } = createForm({
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
          password: { type: 'text', sensitive: true, default: 'secret' },
        }),
        draft: { storage, sensitive: true },
      })

      await nextTick()

      name.update('Jane')
      await flushPromises()

      expect(JSON.parse(store['vueform:draft_form'])).toEqual({
        name: 'Jane',
        password: 'secret',
      })
    })
  })

  describe('stored drafts are untrusted input', () => {
    /**
     * Threat: a corrupt or tampered localStorage entry crashing the form on
     * mount, or being half-trusted.
     *
     * Measure: malformed stored JSON is discarded and removed; the form starts
     * from its defaults.
     */
    it('should discard malformed stored drafts without crashing', async () => {
      const { store, storage } = mockStorage({
        'vueform:draft_form': '{not json at all',
      })

      const { name } = createForm({
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        draft: { storage },
      })

      await flushPromises()

      expect(name.value).toBe('John')
      expect('vueform:draft_form' in store).toBe(false)
    })
  })

  describe('cipher configuration is validated', () => {
    /**
     * Threat: a half-configured cipher pair. `encrypt` without `decrypt` makes
     * every stored draft permanently unreadable; `decrypt` without `encrypt`
     * feeds plaintext to a decryptor. Either way the app believes it configured
     * encryption and did not.
     *
     * Measure: a dev warning names the missing half at instance creation.
     * (Migrated from the original suite.)
     */
    test('it should warn when encrypt is configured without decrypt', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      createForm(
        { schema: defineSchema({ name: { type: 'text', default: 'John' } }) },
        { $security: { encrypt: (value: string) => value } }
      )

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '`$security.encrypt` is configured without `decrypt`'
        )
      )

      warnSpy.mockRestore()
    })

    /**
     * Threat: the mirror case — see above.
     *
     * Measure: same warning, naming `encrypt` as the missing half. (Migrated
     * from the original suite.)
     */
    test('it should warn when decrypt is configured without encrypt', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      createForm(
        { schema: defineSchema({ name: { type: 'text', default: 'John' } }) },
        { $security: { decrypt: (value: string) => value } }
      )

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          '`$security.decrypt` is configured without `encrypt`'
        )
      )

      warnSpy.mockRestore()
    })

    /**
     * Threat: none — no false alarms on a correct configuration.
     *
     * Measure: a complete pair warns about nothing. (Migrated from the original
     * suite.)
     */
    test('it should not warn when both ciphers are configured', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      createForm(
        { schema: defineSchema({ name: { type: 'text', default: 'John' } }) },
        {
          $security: {
            encrypt: (value: string) => value,
            decrypt: (value: string) => value,
          },
        }
      )

      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })
  })
})
