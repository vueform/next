import {
  defineSchema,
  HttpError,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from '@vueform/core'
import { nextTick } from 'vue'

import { createForm, flushPromises } from '../../helpers'

/**
 * Autosave subscribes to navigation EVENTS, not their payloads — these tests
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
// INTERVAL
// =============================================================================

describe('Autosave Interval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should autosave on interval when interval > 0 and endpoint is set', async () => {
    const { adapter, calls } = mockAdapter()

    createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    expect(calls).toHaveLength(0)

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/autosave')
    expect(calls[0].method).toBe('POST')

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(2)
  })

  it('should not autosave on interval when interval is 0', async () => {
    const { adapter, calls } = mockAdapter()

    createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    vi.advanceTimersByTime(20000)
    await flushPromises()

    expect(calls).toHaveLength(0)
  })

  it('should not autosave on interval when no endpoint is set', async () => {
    const { adapter, calls } = mockAdapter()

    createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    vi.advanceTimersByTime(15000)
    await flushPromises()

    expect(calls).toHaveLength(0)
  })

  it('should save on change by default, with no interval', async () => {
    const { adapter, calls } = mockAdapter()

    const { name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    // no interval by default — nothing fires without a change
    vi.advanceTimersByTime(30000)
    await flushPromises()
    expect(calls).toHaveLength(0)

    // a change saves after the default 1000ms debounce
    name.update('Jane')
    await nextTick()

    vi.advanceTimersByTime(999)
    await flushPromises()
    expect(calls).toHaveLength(0)

    vi.advanceTimersByTime(1)
    await flushPromises()
    expect(calls).toHaveLength(1)
  })

  it('should send form data in interval autosave request', async () => {
    const { adapter, calls } = mockAdapter()

    createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
          email: { type: 'text', default: 'john@test.com' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls[0].data).toEqual({
      name: 'John',
      email: 'john@test.com',
    })
  })
})

// =============================================================================
// INTERVAL + VALID
// =============================================================================

describe('Autosave validity gate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should skip interval autosave while the form is invalid by default', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    await form$.validate()
    await nextTick()

    expect(form$.invalid).toBe(true)

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls).toHaveLength(0)
  })

  it('should autosave on interval while the form is valid', async () => {
    const { adapter, calls } = mockAdapter()

    createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls).toHaveLength(1)
  })

  it('should treat valid in on as a plain event trigger', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['valid'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    await form$.validate()
    await nextTick()

    expect(form$.invalid).toBe(true)
    expect(calls).toHaveLength(0)

    name.update('John')
    await form$.validate()
    await flushPromises()

    expect(form$.invalid).toBe(false)
    expect(calls).toHaveLength(1)
  })

  it('should autosave on interval while invalid when invalid is set', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
          invalid: true,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    await form$.validate()
    await nextTick()

    expect(form$.invalid).toBe(true)

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls).toHaveLength(1)
  })
})

// =============================================================================
// CHANGE
// =============================================================================

describe('Autosave on change', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should autosave when model changes and on has change', async () => {
    const { adapter, calls } = mockAdapter()

    const { name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['change'],
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await nextTick()

    vi.advanceTimersByTime(500)
    await flushPromises()

    expect(calls).toHaveLength(1)
    expect(calls[0].data).toEqual({ name: 'Jane' })
  })

  it('should debounce change autosave by debounce', async () => {
    const { adapter, calls } = mockAdapter()

    const { name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['change'],
          debounce: 1000,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('J')
    await nextTick()
    vi.advanceTimersByTime(300)

    name.update('Ja')
    await nextTick()
    vi.advanceTimersByTime(300)

    name.update('Jan')
    await nextTick()
    vi.advanceTimersByTime(300)

    await flushPromises()
    expect(calls).toHaveLength(0)

    vi.advanceTimersByTime(700)
    await flushPromises()

    expect(calls).toHaveLength(1)
    expect(calls[0].data).toEqual({ name: 'Jan' })
  })

  it('should use default debounce of 1000', async () => {
    const { adapter, calls } = mockAdapter()

    const { name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['change'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await nextTick()

    vi.advanceTimersByTime(999)
    await flushPromises()
    expect(calls).toHaveLength(0)

    vi.advanceTimersByTime(1)
    await flushPromises()
    expect(calls).toHaveLength(1)
  })

  it('should not autosave on change when on does not include change', async () => {
    const { adapter, calls } = mockAdapter()

    const { name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: [],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls).toHaveLength(0)
  })
})

// =============================================================================
// CHANGE + VALID
// =============================================================================

describe('Autosave on change with validity gate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should skip change autosave while the form is invalid by default', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
          email: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['change'],
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('John')
    await nextTick()

    await form$.validate()
    await nextTick()

    expect(form$.invalid).toBe(true)

    vi.advanceTimersByTime(500)
    await flushPromises()

    expect(calls).toHaveLength(0)
  })

  it('should autosave on change while the form is valid', async () => {
    const { adapter, calls } = mockAdapter()

    const { name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['change'],
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await nextTick()

    vi.advanceTimersByTime(500)
    await flushPromises()

    expect(calls).toHaveLength(1)
  })

  it('should autosave on change while invalid when invalid is set', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['change'],
          debounce: 500,
          invalid: true,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    await form$.validate()
    await nextTick()

    expect(form$.invalid).toBe(true)

    name.update('John')
    await nextTick()

    vi.advanceTimersByTime(500)
    await flushPromises()

    expect(calls).toHaveLength(1)
  })

  it('should defer a gated save and flush it when the form becomes valid', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    await form$.validate()
    await nextTick()
    expect(form$.invalid).toBe(true)

    // the change fires, but the form still reads invalid at debounce time
    name.update('John')
    await nextTick()
    vi.advanceTimersByTime(500)
    await flushPromises()
    expect(calls).toHaveLength(0)

    // revalidation flips the form valid — the deferred save flushes
    await form$.validate()
    await flushPromises()
    expect(form$.invalid).toBe(false)
    expect(calls).toHaveLength(1)
  })
})

// =============================================================================
// NAVIGATION EVENTS
// =============================================================================

describe('Autosave on navigation events', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should autosave on next when on has next', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['next'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    fireNav(form$, 'next')
    await flushPromises()

    expect(calls).toHaveLength(1)
  })

  it('should autosave on back when on has back', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['back'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    fireNav(form$, 'back')
    await flushPromises()

    expect(calls).toHaveLength(1)
  })

  it('should autosave on step when on has step', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['step'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    fireNav(form$, 'step')
    await flushPromises()

    expect(calls).toHaveLength(1)
  })

  it('should not autosave on navigation events not in on', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['next'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    fireNav(form$, 'back')
    fireNav(form$, 'step')
    await flushPromises()

    expect(calls).toHaveLength(0)
  })

  it('should trigger navigation autosave immediately without debounce', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['next'],
          debounce: 5000,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    fireNav(form$, 'next')
    await flushPromises()

    expect(calls).toHaveLength(1)
  })
})

describe('Autosave navigation dedupe', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not double save when on lists step alongside next or back', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['step', 'next', 'back'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    // one step navigation fires both `step` and the direction event
    fireNav(form$, 'next')
    fireNav(form$, 'step')
    await flushPromises()
    expect(calls).toHaveLength(1)

    fireNav(form$, 'back')
    fireNav(form$, 'step')
    await flushPromises()
    expect(calls).toHaveLength(2)
  })
})

// =============================================================================
// NAVIGATION EVENTS + VALID
// =============================================================================

describe('Autosave on navigation events with validity gate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should skip navigation autosave while the form is invalid by default', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['next'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    await form$.validate()
    await nextTick()

    expect(form$.invalid).toBe(true)

    fireNav(form$, 'next')
    await flushPromises()

    expect(calls).toHaveLength(0)
  })

  it('should autosave on navigation while the form is valid', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['next'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    fireNav(form$, 'next')
    await flushPromises()

    expect(calls).toHaveLength(1)
  })

  it('should autosave on navigation while invalid when invalid is set', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['next', 'back'],
          invalid: true,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    await form$.validate()
    await nextTick()

    expect(form$.invalid).toBe(true)

    fireNav(form$, 'next')
    fireNav(form$, 'back')
    await flushPromises()

    expect(calls).toHaveLength(2)
  })
})

// =============================================================================
// AUTOSAVED EVENT
// =============================================================================

describe('Autosave success event', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should fire autosaveSuccess event after successful interval save', async () => {
    const { adapter } = mockAdapter({ data: { saved: true } })
    const autosaveSuccessHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    form$.on('autosaveSuccess', autosaveSuccessHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(autosaveSuccessHandler).toHaveBeenCalledTimes(1)
    expect(autosaveSuccessHandler.mock.calls[0][0]).toMatchObject({
      data: { saved: true },
      status: 200,
    })
    expect(autosaveSuccessHandler.mock.calls[0][1]).toMatchObject({
      uid: form$.uid,
    })
  })

  it('should fire autosaveSuccess event after successful change save', async () => {
    const { adapter } = mockAdapter({ data: { saved: true } })
    const autosaveSuccessHandler = vi.fn()

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['change'],
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    form$.on('autosaveSuccess', autosaveSuccessHandler)
    await nextTick()

    name.update('Jane')
    await nextTick()

    vi.advanceTimersByTime(500)
    await flushPromises()

    expect(autosaveSuccessHandler).toHaveBeenCalledTimes(1)
  })

  it('should fire autosaveSuccess event after successful navigation save', async () => {
    const { adapter } = mockAdapter({ data: { saved: true } })
    const autosaveSuccessHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['next'],
        },
      },
      { $http: { adapter } }
    )

    form$.on('autosaveSuccess', autosaveSuccessHandler)
    await nextTick()

    fireNav(form$, 'next')
    await flushPromises()

    expect(autosaveSuccessHandler).toHaveBeenCalledTimes(1)
  })
})

// =============================================================================
// AUTOSAVE PRE-HOOK EVENT
// =============================================================================

describe('Autosave pre-hook event', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should fire autosave event before the request with form data', async () => {
    const { adapter, calls } = mockAdapter()
    const autosaveHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    form$.on('autosave', autosaveHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(autosaveHandler).toHaveBeenCalledTimes(1)
    expect(autosaveHandler.mock.calls[0][0]).toEqual({ name: 'John' })
    expect(autosaveHandler.mock.calls[0][1]).toMatchObject({ uid: form$.uid })
    expect(calls).toHaveLength(1)
  })

  it('should cancel autosave when event handler returns false', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    form$.on('autosave', () => false)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls).toHaveLength(0)
  })

  it('should use response returned by event handler instead of making request', async () => {
    const { adapter, calls } = mockAdapter()
    const autosaveSuccessHandler = vi.fn()
    const customResponse: HttpResponse = {
      data: { id: 42 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    }

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    form$.on('autosave', () => customResponse)
    form$.on('autosaveSuccess', autosaveSuccessHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls).toHaveLength(0)
    expect(autosaveSuccessHandler).toHaveBeenCalledTimes(1)
    expect(autosaveSuccessHandler.mock.calls[0][0]).toMatchObject({
      type: 'success',
      status: 200,
      data: { id: 42 },
    })
    expect(autosaveSuccessHandler.mock.calls[0][0].response).toBe(
      customResponse
    )
  })
})

// =============================================================================
// AUTOSAVE FUNCTION PROP
// =============================================================================

describe('Autosave function prop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call autosave function with data and context on interval', async () => {
    const autosaveFn = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: autosaveFn,
          interval: 5000,
        },
      },
      {}
    )

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(autosaveFn).toHaveBeenCalledTimes(1)
    expect(autosaveFn.mock.calls[0][0]).toEqual({ name: 'John' })
    expect(autosaveFn.mock.calls[0][1]).toMatchObject({ uid: form$.uid })
  })

  it('should use a returned string as the endpoint URL', async () => {
    const { adapter, calls } = mockAdapter()
    const autosaveSuccessHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          user_id: { type: 'text', default: '42' },
        }),
        autosave: {
          endpoint: (data: Record<string, any>) => `/api/users/${data.user_id}`,
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    form$.on('autosaveSuccess', autosaveSuccessHandler)

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/users/42')
    expect(calls[0].method).toBe('POST')
    expect(autosaveSuccessHandler).toHaveBeenCalledTimes(1)
  })

  it('should not fire autosaveSuccess when function returns false', async () => {
    const autosaveSuccessHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: () => false,
          interval: 5000,
        },
      },
      {}
    )

    form$.on('autosaveSuccess', autosaveSuccessHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(autosaveSuccessHandler).not.toHaveBeenCalled()
  })

  it('should fire autosaveSuccess when function returns an HttpResponse', async () => {
    const autosaveSuccessHandler = vi.fn()
    const customResponse: HttpResponse = {
      data: { id: 99 },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: {} as any,
    }

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: () => customResponse,
          interval: 5000,
        },
      },
      {}
    )

    form$.on('autosaveSuccess', autosaveSuccessHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(autosaveSuccessHandler).toHaveBeenCalledTimes(1)
    expect(autosaveSuccessHandler.mock.calls[0][0]).toMatchObject({
      type: 'success',
      status: 201,
      data: { id: 99 },
    })
    expect(autosaveSuccessHandler.mock.calls[0][0].response).toBe(
      customResponse
    )
  })

  it('should not fire autosaveSuccess when function returns void', async () => {
    const autosaveSuccessHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: () => {},
          interval: 5000,
        },
      },
      {}
    )

    form$.on('autosaveSuccess', autosaveSuccessHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(autosaveSuccessHandler).not.toHaveBeenCalled()
  })

  it('should initialize autosave when function prop is set without URL', async () => {
    const autosaveFn = vi.fn()

    createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: autosaveFn,
          interval: 5000,
        },
      },
      {}
    )

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(autosaveFn).toHaveBeenCalledTimes(1)
  })

  it('should respect the validity gate with function prop', async () => {
    const autosaveFn = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: autosaveFn,
          interval: 5000,
        },
      },
      {}
    )

    await nextTick()

    await form$.validate()
    await nextTick()

    expect(form$.invalid).toBe(true)

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(autosaveFn).not.toHaveBeenCalled()
  })
})

// =============================================================================
// AUTOSAVE FAIL EVENT
// =============================================================================

describe('Autosave fail event', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should fire autosaveFail event when request fails', async () => {
    const error = new HttpError(
      'Network error',
      { url: '/api/autosave' } as any,
      'network'
    )

    const failAdapter: HttpAdapter = async () => {
      throw error
    }
    const failHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter: failAdapter } }
    )

    form$.on('autosaveFail', failHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(failHandler).toHaveBeenCalledTimes(1)
    expect(failHandler.mock.calls[0][0]).toMatchObject({
      type: 'fail',
      reason: 'network',
      status: null,
      message: 'Network error',
      data: null,
      response: null,
    })
    expect(failHandler.mock.calls[0][1]).toMatchObject({ uid: form$.uid })
  })

  it('should not fire autosaveSuccess when request fails', async () => {
    const failAdapter: HttpAdapter = async () => {
      throw new HttpError(
        'Server error',
        { url: '/api/autosave' } as any,
        'http'
      )
    }
    const autosaveSuccessHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter: failAdapter } }
    )

    form$.on('autosaveSuccess', autosaveSuccessHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(autosaveSuccessHandler).not.toHaveBeenCalled()
  })

  it('should not fire autosaveFail for non-HttpError errors', async () => {
    const failAdapter: HttpAdapter = async () => {
      throw new TypeError('Unexpected error')
    }
    const failHandler = vi.fn()
    const catcher = vi.fn()
    process.on('unhandledRejection', catcher)

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter: failAdapter } }
    )

    form$.on('autosaveFail', failHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(failHandler).not.toHaveBeenCalled()
    expect(catcher).toHaveBeenCalledTimes(1)
    expect(catcher.mock.calls[0][0]).toBeInstanceOf(TypeError)

    process.removeListener('unhandledRejection', catcher)
  })
})

// =============================================================================
// RETRY AFTER FAILURE
// =============================================================================

describe('Autosave retry after failure', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function togglingAdapter(failStatus?: number): {
    adapter: HttpAdapter
    calls: HttpRequestConfig[]
    succeed: () => void
  } {
    const calls: HttpRequestConfig[] = []
    let fail = true

    const adapter: HttpAdapter = async <T = any>(
      config: HttpRequestConfig
    ): Promise<HttpResponse<T>> => {
      calls.push(config)

      if (fail) {
        const response =
          failStatus === undefined
            ? undefined
            : {
                data: null,
                status: failStatus,
                statusText: 'Error',
                headers: {},
                config,
              }

        throw new HttpError(
          'Request failed',
          { url: config.url } as any,
          failStatus === undefined ? 'network' : 'http',
          response
        )
      }
      return {
        data: null as T,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    }

    return { adapter, calls, succeed: () => (fail = false) }
  }

  it('should not retry a 422 on the invalid→valid transition', async () => {
    const { adapter, calls, succeed } = togglingAdapter(422)

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
          on: [],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    // the server rejects data the client judged valid — its validation missed
    // something the server enforces, so revalidating client-side proves nothing
    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(1)

    succeed()
    name.update('')
    await form$.validate()
    await nextTick()
    expect(form$.invalid).toBe(true)

    name.update('Jane')
    await form$.validate()
    await flushPromises()
    expect(form$.invalid).toBe(false)

    // no transition retry — recovery is the next trigger or interval tick
    expect(calls).toHaveLength(1)

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(2)
  })

  it('should not retry non-422 failures on the invalid→valid transition', async () => {
    const { adapter, calls, succeed } = togglingAdapter()

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
          on: [],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    // a network failure says nothing about the data
    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(1)

    succeed()
    name.update('')
    await form$.validate()
    await nextTick()
    expect(form$.invalid).toBe(true)

    name.update('Jane')
    await form$.validate()
    await flushPromises()
    expect(form$.invalid).toBe(false)

    // no transition retry — recovery is the next trigger or interval tick
    expect(calls).toHaveLength(1)

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(2)
  })

  it('should not couple failures to validity when invalid is enabled', async () => {
    const { adapter, calls, succeed } = togglingAdapter(422)

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
          on: [],
          invalid: true,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    await form$.validate()
    await nextTick()
    expect(form$.invalid).toBe(true)

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(1)

    succeed()
    name.update('John')
    await form$.validate()
    await flushPromises()
    expect(form$.invalid).toBe(false)

    // validity never governs sending in this mode — no transition retry
    expect(calls).toHaveLength(1)

    // the next interval tick retries as usual
    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(2)
  })
})

// =============================================================================
// ENDPOINT GATING
// =============================================================================

describe('Autosave endpoint gating', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not register change handler when no endpoint is set', async () => {
    const { adapter, calls } = mockAdapter()

    const { name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          interval: 0,
          on: ['change'],
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await nextTick()

    vi.advanceTimersByTime(500)
    await flushPromises()

    expect(calls).toHaveLength(0)
  })

  it('should not register navigation handlers when no endpoint is set', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          interval: 0,
          on: ['next', 'back', 'step'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    fireNav(form$, 'next')
    fireNav(form$, 'back')
    fireNav(form$, 'step')
    await flushPromises()

    expect(calls).toHaveLength(0)
  })

  it('should start interval when endpoint becomes defined', async () => {
    const { adapter, calls } = mockAdapter()

    const { form } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(0)

    await form.setProps({
      autosave: { endpoint: '/api/autosave', interval: 5000 },
    })
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(1)
  })

  it('should stop interval when endpoint becomes undefined', async () => {
    const { adapter, calls } = mockAdapter()

    const { form } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(1)

    await form.setProps({ autosave: undefined })
    await nextTick()

    vi.advanceTimersByTime(10000)
    await flushPromises()
    expect(calls).toHaveLength(1)
  })

  it('should start event handlers when endpoint becomes defined', async () => {
    const { adapter, calls } = mockAdapter()

    const { form, form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          interval: 0,
          on: ['next'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    fireNav(form$, 'next')
    await flushPromises()
    expect(calls).toHaveLength(0)

    await form.setProps({
      autosave: { endpoint: '/api/autosave', interval: 0, on: ['next'] },
    })
    await nextTick()

    fireNav(form$, 'next')
    await flushPromises()
    expect(calls).toHaveLength(1)
  })

  it('should stop event handlers when endpoint becomes undefined', async () => {
    const { adapter, calls } = mockAdapter()

    const { form, form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['next'],
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    fireNav(form$, 'next')
    await flushPromises()
    expect(calls).toHaveLength(1)

    await form.setProps({ autosave: undefined })
    await nextTick()

    fireNav(form$, 'next')
    await flushPromises()
    expect(calls).toHaveLength(1)
  })

  it('should start change handler when endpoint becomes defined', async () => {
    const { adapter, calls } = mockAdapter()

    const { form, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          interval: 0,
          on: ['change'],
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await nextTick()
    vi.advanceTimersByTime(500)
    await flushPromises()
    expect(calls).toHaveLength(0)

    await form.setProps({
      autosave: {
        endpoint: '/api/autosave',
        interval: 0,
        on: ['change'],
        debounce: 500,
      },
    })
    await nextTick()

    name.update('Bob')
    await nextTick()
    vi.advanceTimersByTime(500)
    await flushPromises()
    expect(calls).toHaveLength(1)
  })

  it('should stop change handler when endpoint becomes undefined', async () => {
    const { adapter, calls } = mockAdapter()

    const { form, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 0,
          on: ['change'],
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await nextTick()
    vi.advanceTimersByTime(500)
    await flushPromises()
    expect(calls).toHaveLength(1)

    await form.setProps({ autosave: undefined })
    await nextTick()

    name.update('Bob')
    await nextTick()
    vi.advanceTimersByTime(500)
    await flushPromises()
    expect(calls).toHaveLength(1)
  })
})

// =============================================================================
// COMBINED TRIGGERS
// =============================================================================

describe('Autosave combined triggers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should support interval and change together', async () => {
    const { adapter, calls } = mockAdapter()

    const { name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
          on: ['change'],
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await nextTick()

    vi.advanceTimersByTime(500)
    await flushPromises()
    expect(calls).toHaveLength(1)

    vi.advanceTimersByTime(4500)
    await flushPromises()
    expect(calls).toHaveLength(2)
  })

  it('should support interval, change, and navigation together', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 10000,
          on: ['change', 'next'],
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await nextTick()
    vi.advanceTimersByTime(500)
    await flushPromises()
    expect(calls).toHaveLength(1)

    fireNav(form$, 'next')
    await flushPromises()
    expect(calls).toHaveLength(2)

    vi.advanceTimersByTime(9500)
    await flushPromises()
    expect(calls).toHaveLength(3)
  })

  it('should apply valid gate across all trigger types', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
          on: ['change', 'next', 'valid'],
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    await form$.validate()
    await nextTick()
    expect(form$.invalid).toBe(true)

    vi.advanceTimersByTime(5000)
    await flushPromises()
    expect(calls).toHaveLength(0)

    fireNav(form$, 'next')
    await flushPromises()
    expect(calls).toHaveLength(0)
  })
})

// =============================================================================
// TRANSFORM AUTOSAVE
// =============================================================================

describe('Autosave transform', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should run transform on the payload with transformPayload applied', async () => {
    const { adapter, calls } = mockAdapter()

    createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
          email: { type: 'text', default: 'john@test.com' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
          transform: (data: Record<string, any>) => {
            return { ...data, draft: true }
          },
        },
        transformPayload: (data: Record<string, any>) => {
          return { ...data, submittedAt: '2026-01-01' }
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls[0].data).toEqual({
      name: 'John',
      email: 'john@test.com',
      submittedAt: '2026-01-01',
      draft: true,
    })
  })

  it('should only send what transform returns', async () => {
    const { adapter, calls } = mockAdapter()

    createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
          email: { type: 'text', default: 'john@test.com' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
          transform: (data: Record<string, any>) => {
            return { name: data.name }
          },
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls[0].data).toEqual({ name: 'John' })
  })

  it('should fall back to transformPayload when transform is not defined', async () => {
    const { adapter, calls } = mockAdapter()

    createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
        transformPayload: (data: Record<string, any>) => {
          return { ...data, extra: true }
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls[0].data).toEqual({ name: 'John', extra: true })
  })

  it('should pass form context to transform', async () => {
    const { adapter } = mockAdapter()
    const spy = vi.fn((data: Record<string, any>, _oldData?: any) => data)

    createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
          transform: spy,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toEqual({ name: 'John' })
    expect(spy.mock.calls[0][1]).toBeDefined()
  })
})

// =============================================================================
// STRING SHORTHAND
// =============================================================================

describe('Autosave string shorthand', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should treat a string autosave prop as the endpoint', async () => {
    const { adapter, calls } = mockAdapter()

    const { name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: '/api/autosave',
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await nextTick()

    vi.advanceTimersByTime(1000)
    await flushPromises()

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/autosave')
    expect(calls[0].method).toBe('POST')
  })
})

// =============================================================================
// RESPONSE + AUTOSAVED EVENTS
// =============================================================================

describe('Autosave response events', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should fire autosaveResponse and autosaveSuccess after a successful save', async () => {
    const { adapter } = mockAdapter({ data: { saved: true } })
    const responseHandler = vi.fn()
    const successHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    form$.on('autosaveResponse', responseHandler)
    form$.on('autosaveSuccess', successHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(responseHandler).toHaveBeenCalledTimes(1)
    expect(responseHandler.mock.calls[0][0]).toMatchObject({
      data: { saved: true },
      status: 200,
    })
    expect(successHandler).toHaveBeenCalledTimes(1)
    expect(successHandler.mock.calls[0][0]).toMatchObject({
      type: 'success',
      status: 200,
      data: { saved: true },
    })
    expect(successHandler.mock.calls[0][1]).toMatchObject({ uid: form$.uid })
  })

  it('should fire autosaveResponse with the error response on failure', async () => {
    const errorResponse = {
      data: { message: 'nope' },
      status: 500,
      statusText: 'Server Error',
      headers: {},
      config: {} as any,
    }
    const failAdapter: HttpAdapter = async () => {
      throw new HttpError(
        'Server error',
        { url: '/api/autosave' } as any,
        'http',
        errorResponse
      )
    }
    const responseHandler = vi.fn()
    const failHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter: failAdapter } }
    )

    form$.on('autosaveResponse', responseHandler)
    form$.on('autosaveFail', failHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(responseHandler).toHaveBeenCalledTimes(1)
    expect(responseHandler.mock.calls[0][0]).toBe(errorResponse)
    expect(failHandler).toHaveBeenCalledTimes(1)
    expect(failHandler.mock.calls[0][0]).toMatchObject({
      type: 'fail',
      reason: 'http',
      status: 500,
      data: { message: 'nope' },
    })
    expect(failHandler.mock.calls[0][0].response).toBe(errorResponse)
  })

  it('should fire autosaveFail when a returned response has a non-2xx status', async () => {
    const successHandler = vi.fn()
    const failHandler = vi.fn()
    const errorResponse: HttpResponse = {
      data: { message: 'nope' },
      status: 500,
      statusText: 'Server Error',
      headers: {},
      config: {} as any,
    }

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: () => errorResponse,
          interval: 5000,
        },
      },
      {}
    )

    form$.on('autosaveSuccess', successHandler)
    form$.on('autosaveFail', failHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(successHandler).not.toHaveBeenCalled()
    expect(failHandler).toHaveBeenCalledTimes(1)
    expect(failHandler.mock.calls[0][0]).toMatchObject({
      type: 'fail',
      reason: 'http',
      status: 500,
      data: { message: 'nope' },
    })
    expect(failHandler.mock.calls[0][0].response).toBe(errorResponse)
  })

  it('should report a 422 failure with reason invalid', async () => {
    const errorResponse: HttpResponse = {
      data: { errors: { name: ['Required'] } },
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: {},
      config: {} as any,
    }
    const failAdapter: HttpAdapter = async () => {
      throw new HttpError(
        'Validation failed',
        { url: '/api/autosave' } as any,
        'http',
        errorResponse
      )
    }
    const failHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter: failAdapter } }
    )

    form$.on('autosaveFail', failHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(failHandler).toHaveBeenCalledTimes(1)
    expect(failHandler.mock.calls[0][0]).toMatchObject({
      type: 'fail',
      reason: 'invalid',
      status: 422,
    })
  })

  it('should not fire autosaveResponse when a failure carries no response', async () => {
    const failAdapter: HttpAdapter = async () => {
      throw new HttpError(
        'Network error',
        { url: '/api/autosave' } as any,
        'network'
      )
    }
    const responseHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter: failAdapter } }
    )

    form$.on('autosaveResponse', responseHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(responseHandler).not.toHaveBeenCalled()
  })

  it('should settle silently when a handler function returns void', async () => {
    const responseHandler = vi.fn()
    const successHandler = vi.fn()
    const failHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: () => {},
          interval: 5000,
        },
      },
      {}
    )

    form$.on('autosaveResponse', responseHandler)
    form$.on('autosaveSuccess', successHandler)
    form$.on('autosaveFail', failHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(responseHandler).not.toHaveBeenCalled()
    expect(successHandler).not.toHaveBeenCalled()
    expect(failHandler).not.toHaveBeenCalled()
  })

  it('should settle silently when a handler function returns false', async () => {
    const responseHandler = vi.fn()
    const successHandler = vi.fn()
    const failHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: () => false,
          interval: 5000,
        },
      },
      {}
    )

    form$.on('autosaveResponse', responseHandler)
    form$.on('autosaveSuccess', successHandler)
    form$.on('autosaveFail', failHandler)
    await nextTick()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(responseHandler).not.toHaveBeenCalled()
    expect(successHandler).not.toHaveBeenCalled()
    expect(failHandler).not.toHaveBeenCalled()
  })
})

// =============================================================================
// ABORT
// =============================================================================

describe('Autosave abort', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /**
   * An adapter whose requests resolve after `delay` ms unless their signal
   * aborts first — then they reject with an abort HttpError, like the real
   * fetch adapter.
   */
  const slowAdapter = (delay: number) => {
    const calls: { aborted: boolean }[] = []

    const adapter: HttpAdapter = <T = any>(config: HttpRequestConfig) =>
      new Promise<HttpResponse<T>>((resolve, reject) => {
        const call = { aborted: false }
        calls.push(call)

        config.signal?.addEventListener('abort', () => {
          call.aborted = true
          reject(new HttpError('Aborted', config, 'abort'))
        })

        setTimeout(() => {
          resolve({
            data: { saved: true } as T,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          })
        }, delay)
      })

    return { adapter, calls }
  }

  it('should abort the in-flight request when a new save starts', async () => {
    const { adapter, calls } = slowAdapter(10000)
    const successHandler = vi.fn()
    const failHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    form$.on('autosaveSuccess', successHandler)
    form$.on('autosaveFail', failHandler)
    await nextTick()

    vi.advanceTimersByTime(5000) // first save sent
    await flushPromises()

    vi.advanceTimersByTime(5000) // second save aborts the first
    await flushPromises()

    expect(calls).toHaveLength(2)
    expect(calls[0].aborted).toBe(true)
    expect(calls[1].aborted).toBe(false)

    vi.advanceTimersByTime(10000) // second request resolves
    await flushPromises()

    expect(successHandler).toHaveBeenCalledTimes(1)
    expect(failHandler).not.toHaveBeenCalled()
  })

  it('should abort the in-flight request silently via abortAutosave()', async () => {
    const { adapter, calls } = slowAdapter(10000)
    const responseHandler = vi.fn()
    const successHandler = vi.fn()
    const failHandler = vi.fn()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          interval: 5000,
        },
      },
      { $http: { adapter } }
    )

    form$.on('autosaveResponse', responseHandler)
    form$.on('autosaveSuccess', successHandler)
    form$.on('autosaveFail', failHandler)
    await nextTick()

    vi.advanceTimersByTime(5000) // save sent
    await flushPromises()

    expect(calls).toHaveLength(1)

    form$.abortAutosave()
    await flushPromises()

    expect(calls[0].aborted).toBe(true)
    expect(responseHandler).not.toHaveBeenCalled()
    expect(successHandler).not.toHaveBeenCalled()
    expect(failHandler).not.toHaveBeenCalled()
  })

  it('should cancel a pending debounced save', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          debounce: 1000,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    name.update('Jane')
    await nextTick()

    form$.abortAutosave()

    vi.advanceTimersByTime(5000)
    await flushPromises()

    expect(calls).toHaveLength(0)

    // autosaving stays armed — the next change saves as usual
    name.update('Joe')
    await nextTick()
    vi.advanceTimersByTime(1000)
    await flushPromises()

    expect(calls).toHaveLength(1)
  })

  it('should drop a pending gated retry', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          debounce: 500,
        },
      },
      { $http: { adapter } }
    )

    await nextTick()

    await form$.validate()
    await nextTick()
    expect(form$.invalid).toBe(true)

    // gated at debounce time — the save is deferred
    name.update('John')
    await nextTick()
    vi.advanceTimersByTime(500)
    await flushPromises()
    expect(calls).toHaveLength(0)

    form$.abortAutosave()

    // the transition to valid no longer flushes anything
    await form$.validate()
    await flushPromises()
    expect(form$.invalid).toBe(false)
    expect(calls).toHaveLength(0)
  })
})

// =============================================================================
// MANUAL METHOD
// =============================================================================

describe('Autosave method', () => {
  it('should save remotely immediately via the autosave method', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          on: [],
        },
      },
      { $http: { adapter } }
    )

    await flushPromises()

    await form$.autosave()
    await flushPromises()

    expect(calls).toHaveLength(1)
  })

  it('should not write a draft via the autosave method', async () => {
    const { adapter, calls } = mockAdapter()
    const { store, storage } = mockStorage()

    const { form$ } = createForm(
      {
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          on: [],
        },
        draft: { storage, restore: false },
      },
      { $http: { adapter } }
    )

    await flushPromises()

    await form$.autosave()
    await flushPromises()

    expect(calls).toHaveLength(1)
    expect(Object.keys(store)).toHaveLength(0)
  })

  it('should be a no-op without an endpoint', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()

    await expect(form$.autosave()).resolves.toBeUndefined()
    expect(calls).toHaveLength(0)
  })

  it('should respect the validity gate on manual autosave by default', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          on: [],
        },
      },
      { $http: { adapter } }
    )

    await flushPromises()

    await form$.validate()
    await nextTick()
    expect(form$.invalid).toBe(true)

    await form$.autosave()
    await flushPromises()

    expect(calls).toHaveLength(0)
  })

  it('should send invalid data when autosave is called with invalid true', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          on: [],
        },
      },
      { $http: { adapter } }
    )

    await flushPromises()

    await form$.validate()
    await nextTick()
    expect(form$.invalid).toBe(true)

    await form$.autosave({ invalid: true })
    await flushPromises()

    expect(calls).toHaveLength(1)
  })

  it('should enforce the gate with invalid false even when config allows invalid', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          on: [],
          invalid: true,
        },
      },
      { $http: { adapter } }
    )

    await flushPromises()

    await form$.validate()
    await nextTick()
    expect(form$.invalid).toBe(true)

    await form$.autosave({ invalid: false })
    await flushPromises()

    expect(calls).toHaveLength(0)
  })

  it('should defer a gated manual autosave until the form becomes valid', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          on: [],
        },
      },
      { $http: { adapter } }
    )

    await flushPromises()

    await form$.validate()
    await nextTick()
    expect(form$.invalid).toBe(true)

    await form$.autosave()
    await flushPromises()
    expect(calls).toHaveLength(0)

    name.update('John')
    await form$.validate()
    await flushPromises()
    expect(form$.invalid).toBe(false)

    // held back, not dropped — the manual save flushes on the transition
    expect(calls).toHaveLength(1)
  })
})
