import {
  defineSchema,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from '@vueform/core'
import { nextTick } from 'vue'

import { createForm, flushPromises } from '../../helpers'

/**
 * Drafts subscribe to navigation EVENTS, not their payloads — these tests
 * simulate the bare event on step-less forms where real navigation can't fire.
 * The cast drops the payload tuple deliberately.
 */
function fireNav(form$: { fire(...args: unknown[]): void }, event: string) {
  form$.fire(event)
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

// =============================================================================
// SAVING
// =============================================================================

describe('Draft saving', () => {
  it('should save the model to storage on change without delay', async () => {
    const { store, storage } = mockStorage()

    const { name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
    })

    await nextTick()

    name.update('Jane')
    await flushPromises()

    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Jane' })
  })

  it('should enable drafts with defaults when draft is true', async () => {
    window.localStorage.clear()

    const { name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: true,
    })

    await nextTick()

    name.update('Jane')
    await flushPromises()

    expect(
      JSON.parse(window.localStorage.getItem('vueform:draft_form')!)
    ).toEqual({ name: 'Jane' })

    window.localStorage.clear()
  })

  it('should debounce rapid changes after the first immediate save', async () => {
    vi.useFakeTimers()
    const { store, storage } = mockStorage()

    const { name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
    })

    await flushPromises()

    // the first change writes immediately
    name.update('Jane')
    await flushPromises()
    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Jane' })

    // a rapid follow-up is debounced
    name.update('Janet')
    await flushPromises()
    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Jane' })

    vi.advanceTimersByTime(1000)
    await flushPromises()
    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Janet' })

    vi.useRealTimers()
  })

  it('should apply a custom debounce', async () => {
    vi.useFakeTimers()
    const { store, storage } = mockStorage()

    const { name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage, debounce: 100 },
    })

    await flushPromises()

    name.update('Jane')
    await flushPromises()
    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Jane' })

    name.update('Janet')
    await flushPromises()
    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Jane' })

    vi.advanceTimersByTime(100)
    await flushPromises()
    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Janet' })

    vi.useRealTimers()
  })

  it('should flush a save within the debounce window while typing continuously', async () => {
    vi.useFakeTimers()
    const writes: string[] = []
    const { store, storage } = mockStorage()
    const countingStorage = {
      ...storage,
      setItem: (key: string, value: string) => {
        writes.push(value)
        storage.setItem(key, value)
      },
    }

    const { name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage: countingStorage },
    })

    await flushPromises()

    name.update('v0')
    await flushPromises()
    expect(writes).toHaveLength(1)

    // continuous typing: a change every 50ms for 1.5s never pauses long
    // enough for the debounce, but the max wait flushes mid-burst
    for (let i = 1; i <= 30; i++) {
      vi.advanceTimersByTime(50)
      name.update(`v${i}`)
      await flushPromises()
    }

    expect(writes.length).toBeGreaterThanOrEqual(2)

    // the trailing debounce writes the final state once typing pauses
    vi.advanceTimersByTime(1000)
    await flushPromises()
    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'v30' })

    vi.useRealTimers()
  })

  it('should save on navigation events', async () => {
    const { store, storage } = mockStorage()

    const { form$ } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
    })

    await nextTick()

    fireNav(form$, 'step')
    await flushPromises()

    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'John' })
  })

  it('should save while the form is invalid', async () => {
    const { store, storage } = mockStorage()

    const { form$, name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', rules: 'required' },
      }),
      draft: { storage },
    })

    await nextTick()

    await form$.validate()
    await nextTick()
    expect(form$.invalid).toBe(true)

    name.update('')
    await flushPromises()

    expect('vueform:draft_form' in store).toBe(true)
  })

  it('should fall back to the app-level $autosave.storage', async () => {
    const { store, storage } = mockStorage()

    const { name } = createForm(
      {
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        draft: true,
      },
      { $autosave: { storage } }
    )

    await nextTick()

    name.update('Jane')
    await flushPromises()

    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Jane' })
  })

  it('should prefer draft.storage over the app-level $autosave.storage', async () => {
    const { store: appStore, storage: appStorage } = mockStorage()
    const { store, storage } = mockStorage()

    const { name } = createForm(
      {
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        draft: { storage },
      },
      { $autosave: { storage: appStorage } }
    )

    await nextTick()

    name.update('Jane')
    await flushPromises()

    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Jane' })
    expect(Object.keys(appStore)).toHaveLength(0)
  })

  it('should use a custom key when set', async () => {
    const { store, storage } = mockStorage()

    const { name } = createForm({
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage, key: 'my-draft' },
    })

    await nextTick()

    name.update('Jane')
    await flushPromises()

    expect(JSON.parse(store['vueform:my-draft'])).toEqual({ name: 'Jane' })
  })

  it('should warn and disable drafts without a name or key', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { store, storage } = mockStorage()

    const { name } = createForm({
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
    })

    await nextTick()

    name.update('Jane')
    await flushPromises()

    expect(Object.keys(store)).toHaveLength(0)
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Drafts require')
    )

    warnSpy.mockRestore()
  })

  it('should work alongside a remote endpoint', async () => {
    const { adapter, calls } = mockAdapter()
    const { store, storage } = mockStorage()

    vi.useFakeTimers()

    const { name } = createForm(
      {
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
          on: [],
        },
        draft: { storage },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await flushPromises()

    // the draft saves immediately, remote waits for the interval
    expect(JSON.parse(store['vueform:draft_form'])).toEqual({ name: 'Jane' })
    expect(calls).toHaveLength(0)

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(1)

    vi.useRealTimers()
  })
})

// =============================================================================
// SAVE EVENTS
// =============================================================================

describe('Draft save events', () => {
  it('should fire saveDraft before the write and draftSaved after', async () => {
    const { store, storage } = mockStorage()
    const saveDraftHandler = vi.fn()
    const draftSavedHandler = vi.fn()

    const { form$, name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
    })

    form$.on('saveDraft', saveDraftHandler)
    form$.on('draftSaved', draftSavedHandler)
    await nextTick()

    name.update('Jane')
    await flushPromises()

    expect(saveDraftHandler).toHaveBeenCalledTimes(1)
    expect(saveDraftHandler.mock.calls[0][0]).toEqual({ name: 'Jane' })
    expect(saveDraftHandler.mock.calls[0][1]).toMatchObject({ uid: form$.uid })
    expect(draftSavedHandler).toHaveBeenCalledTimes(1)
    expect(draftSavedHandler.mock.calls[0][0]).toEqual({ name: 'Jane' })
    expect('vueform:draft_form' in store).toBe(true)
  })

  it('should cancel the write when a saveDraft handler returns false', async () => {
    const { store, storage } = mockStorage()
    const draftSavedHandler = vi.fn()

    const { form$, name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
      onSaveDraft: () => false,
    })

    form$.on('draftSaved', draftSavedHandler)
    await nextTick()

    name.update('Jane')
    await flushPromises()

    expect(Object.keys(store)).toHaveLength(0)
    expect(draftSavedHandler).not.toHaveBeenCalled()
  })
})

// =============================================================================
// RESTORING
// =============================================================================

describe('Draft restoring', () => {
  it('should restore a stored draft on mount', async () => {
    const { storage } = mockStorage({
      'vueform:draft_form': JSON.stringify({ name: 'Stored' }),
    })

    const { name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
    })

    await flushPromises()

    expect(name.value).toBe('Stored')
  })

  it('should fire restoreDraft before the automatic restore', async () => {
    const { storage } = mockStorage({
      'vueform:draft_form': JSON.stringify({ name: 'Stored' }),
    })
    const restoreHandler = vi.fn()

    const { form$ } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
      onRestoreDraft: restoreHandler,
    })

    await flushPromises()

    expect(restoreHandler).toHaveBeenCalledTimes(1)
    expect(restoreHandler.mock.calls[0][0]).toEqual({ name: 'Stored' })
    expect(restoreHandler.mock.calls[0][1]).toMatchObject({ uid: form$.uid })
  })

  it('should skip restore when a restoreDraft handler returns false', async () => {
    const { store, storage } = mockStorage({
      'vueform:draft_form': JSON.stringify({ name: 'Stored' }),
    })

    const { name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
      onRestoreDraft: () => false,
    })

    await flushPromises()

    expect(name.value).toBe('John')
    expect('vueform:draft_form' in store).toBe(true)
  })

  it('should skip the automatic restore when restore is false', async () => {
    const { storage } = mockStorage({
      'vueform:draft_form': JSON.stringify({ name: 'Stored' }),
    })

    const { name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage, restore: false },
    })

    await flushPromises()

    expect(name.value).toBe('John')
  })

  it('should restore a stored draft manually via restoreDraft', async () => {
    const { storage } = mockStorage({
      'vueform:draft_form': JSON.stringify({ name: 'Stored' }),
    })

    const { form$, name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage, restore: false },
    })

    await flushPromises()
    expect(name.value).toBe('John')

    expect(await form$.restoreDraft()).toBe(true)
    await nextTick()

    expect(name.value).toBe('Stored')
  })

  it('should return false from restoreDraft when nothing is stored', async () => {
    const { storage } = mockStorage()

    const { form$ } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage, restore: false },
    })

    await flushPromises()

    expect(await form$.restoreDraft()).toBe(false)
  })

  it('should resolve the stored draft via getDraft without loading it', async () => {
    const { storage } = mockStorage({
      'vueform:draft_form': JSON.stringify({ name: 'Stored' }),
    })

    const { form$, name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage, restore: false },
    })

    await flushPromises()

    expect(await form$.getDraft()).toEqual({ name: 'Stored' })
    expect(name.value).toBe('John')
  })

  it('should resolve undefined from getDraft when nothing is stored', async () => {
    const { storage } = mockStorage()

    const { form$ } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage, restore: false },
    })

    await flushPromises()

    expect(await form$.getDraft()).toBeUndefined()
  })

  it('should remove a corrupt stored draft without restoring', async () => {
    const { store, storage } = mockStorage({
      'vueform:draft_form': '{not json',
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

// =============================================================================
// DISCARDING
// =============================================================================

describe('Draft discarding', () => {
  it('should discard the stored draft on successful submit', async () => {
    const { store, storage } = mockStorage({
      'vueform:draft_form': JSON.stringify({ name: 'Stored' }),
    })

    const { form$ } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
    })

    await flushPromises()

    form$.fire('success', {} as any)
    await flushPromises()

    expect('vueform:draft_form' in store).toBe(false)
  })

  it('should keep the stored draft on success when discardOnSuccess is false', async () => {
    const { store, storage } = mockStorage({
      'vueform:draft_form': JSON.stringify({ name: 'Stored' }),
    })

    const { form$ } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage, discardOnSuccess: false },
    })

    await flushPromises()

    form$.fire('success', {} as any)
    await flushPromises()

    expect('vueform:draft_form' in store).toBe(true)
  })

  it('should fire discardDraft before the automatic discard and draftDiscarded after', async () => {
    const { storage } = mockStorage({
      'vueform:draft_form': JSON.stringify({ name: 'Stored' }),
    })
    const discardHandler = vi.fn()
    const discardedHandler = vi.fn()

    const { form$ } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
      onDiscardDraft: discardHandler,
      onDraftDiscarded: discardedHandler,
    })

    await flushPromises()

    form$.fire('success', {} as any)
    await flushPromises()

    expect(discardHandler).toHaveBeenCalledTimes(1)
    expect(discardHandler.mock.calls[0][0]).toMatchObject({ uid: form$.uid })
    expect(discardedHandler).toHaveBeenCalledTimes(1)
  })

  it('should keep the draft when a discardDraft handler returns false', async () => {
    const { store, storage } = mockStorage({
      'vueform:draft_form': JSON.stringify({ name: 'Stored' }),
    })

    const { form$ } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
      onDiscardDraft: () => false,
    })

    await flushPromises()

    form$.fire('success', {} as any)
    await flushPromises()

    expect('vueform:draft_form' in store).toBe(true)
  })

  it('should discard manually via discardDraft and fire draftDiscarded', async () => {
    const { store, storage } = mockStorage()
    const discardedHandler = vi.fn()

    const { form$, name } = createForm({
      name: 'draft_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
      draft: { storage },
    })

    form$.on('draftDiscarded', discardedHandler)
    await nextTick()

    name.update('Jane')
    await flushPromises()
    expect('vueform:draft_form' in store).toBe(true)

    form$.discardDraft()
    expect('vueform:draft_form' in store).toBe(false)
    expect(discardedHandler).toHaveBeenCalledTimes(1)
  })
})
