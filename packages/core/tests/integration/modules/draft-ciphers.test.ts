import {
  defineSchema,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from '@vueform/core'
/**
 * # Draft ciphers and sensitive opt-ins
 *
 * Functional coverage of draft persistence through the `$security` ciphers —
 * the encrypt/decrypt round-trip, async cipher support, the per-form
 * `draft.encrypt: false` escape hatch, the plaintext warning and its conscious
 * opt-outs, write sequencing, storage-key idempotence, and the `sensitive`
 * opt-ins (`autosave.sensitive` / `draft.sensitive`).
 *
 * The adversarial side — key clobbering, tampered or unreadable drafts,
 * sensitive values leaking to disk or the network — lives in
 * `tests/integration/security/storage.test.ts`.
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

describe('draft ciphers', () => {
  /**
   * Drafts pass through the app-level `$security.encrypt` cipher before
   * storage, with the `'draft'` purpose tag so one cipher implementation can
   * serve every persisting feature.
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

  /** The read path: stored drafts decrypt through `$security.decrypt` on load. */
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
   * Real-world ciphers are Web Crypto, which is async — a sync-only pipeline
   * would push apps back to plaintext. Both ciphers may be async end to end.
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
   * The per-form escape hatch stays deliberate and local — `draft.encrypt:
   * false` skips the app-level cipher for that form only.
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
   * Storing drafts with no ciphers configured warns in dev — plaintext is a
   * decision, not a default that goes unnoticed.
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
   * The deliberate opt-outs must not nag — registering identity ciphers (a
   * conscious opt-out) silences the plaintext warning.
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

  /** The per-form opt-out also counts as a conscious decision. */
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
   * A race where an in-flight async encryption lands its write AFTER the user
   * cleared the draft would resurrect data the user asked to delete. A write
   * sequence counter drops stale writes.
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
})

describe('draft storage keys', () => {
  /** An already-prefixed custom key is not double-prefixed. */
  it('should not double-prefix an already prefixed key', async () => {
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

describe('sensitive opt-ins', () => {
  /**
   * The deliberate opt-in: an app autosaving to its own authenticated server
   * may legitimately need the full model. `autosave.sensitive: true` keeps
   * sensitive values in the remote payload; the draft stays stripped unless it
   * opts in itself.
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

  /** The draft-side opt-in variant. */
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
