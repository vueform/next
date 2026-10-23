import {
  defineSchema,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from '@vueform/core'
/**
 * # Persistence security (draft storage)
 *
 * Threat model: drafts write the form model — potentially PII — into
 * localStorage, on a device the app doesn't control (shared browsers, stolen
 * disks, backups). The storage key is schema-reachable and localStorage is a
 * shared namespace, and drafts read back from storage are untrusted data. The
 * guarantees: schema keys cannot address arbitrary storage entries, `sensitive`
 * fields never touch the disk or the wire by default, and corrupt or unreadable
 * drafts are discarded instead of trusted. Cipher functionality — round-trips,
 * async support, opt-outs, warnings — lives in
 * `integration/modules/draft-ciphers.test.ts`.
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
  })

  describe('unreadable ciphertext', () => {
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
})
