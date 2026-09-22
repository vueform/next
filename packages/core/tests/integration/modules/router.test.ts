import {
  defineSchema,
  type RouterModule,
  type VueformRouter,
} from '@vueform/core'
import { ref } from 'vue'
import { createForm, flushPromises } from '../../helpers'

function mockRouter(overrides: Partial<VueformRouter> = {}): VueformRouter {
  return {
    currentRoute: ref({
      path: '/form',
      query: {},
    }),
    push: vi.fn(),
    back: vi.fn(),
    ...overrides,
  } as unknown as VueformRouter
}

// =============================================================================
// DEFAULT ROUTER MODULE (pushState)
// =============================================================================

describe('Default router module', () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>
  let backSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    pushStateSpy = vi.spyOn(history, 'pushState').mockImplementation(() => {})
    backSpy = vi.spyOn(history, 'back').mockImplementation(() => {})
  })

  afterEach(() => {
    pushStateSpy.mockRestore()
    backSpy.mockRestore()
  })

  it('should push history state on step navigation when history is enabled', async () => {
    const { form$ } = createForm({
      stepped: true,
      history: true,
      schema: defineSchema({
        step1: {
          type: 'group',
          page: 'Step 1',
          schema: { name: { type: 'text', default: 'x' } },
        },
        step2: {
          type: 'group',
          page: 'Step 2',
          schema: { email: { type: 'text' } },
        },
      }),
    })

    expect(form$.steps.page).toBe('step1')

    await form$.steps.next()
    await flushPromises()

    expect(pushStateSpy).toHaveBeenCalled()
    const lastCall = pushStateSpy.mock.calls[pushStateSpy.mock.calls.length - 1]
    const stateObj = lastCall[0] as Record<string, any>
    const stateKey = Object.keys(stateObj)[0]
    expect(stateObj[stateKey]).toEqual({ page: 'step2' })
  })

  it('should not push history state when history is disabled', async () => {
    const { form$ } = createForm({
      stepped: true,
      schema: defineSchema({
        step1: {
          type: 'group',
          page: 'Step 1',
          schema: { name: { type: 'text', default: 'x' } },
        },
        step2: {
          type: 'group',
          page: 'Step 2',
          schema: { email: { type: 'text' } },
        },
      }),
    })

    await form$.steps.next()
    await flushPromises()

    expect(pushStateSpy).not.toHaveBeenCalled()
  })

  it('should call history.back() on steps.back()', async () => {
    const { form$ } = createForm({
      stepped: true,
      history: true,
      schema: defineSchema({
        step1: {
          type: 'group',
          page: 'Step 1',
          schema: { name: { type: 'text', default: 'x' } },
        },
        step2: {
          type: 'group',
          page: 'Step 2',
          schema: { email: { type: 'text', default: 'y' } },
        },
      }),
    })

    await form$.steps.next()
    await flushPromises()

    await form$.steps.back()
    await flushPromises()

    expect(backSpy).toHaveBeenCalled()
    expect(form$.steps.page).toBe('step1')
  })

  it('should push separate history entries for each step', async () => {
    const { form$ } = createForm({
      stepped: true,
      history: true,
      schema: defineSchema({
        step1: {
          type: 'group',
          page: 'Step 1',
          schema: { a: { type: 'text', default: 'x' } },
        },
        step2: {
          type: 'group',
          page: 'Step 2',
          schema: { b: { type: 'text', default: 'y' } },
        },
        step3: {
          type: 'group',
          page: 'Step 3',
          schema: { c: { type: 'text' } },
        },
      }),
    })

    await form$.steps.next()
    await flushPromises()
    await form$.steps.next()
    await flushPromises()

    const pushCalls = pushStateSpy.mock.calls
    const states = pushCalls.map(([state]) => {
      const key = Object.keys(state as Record<string, any>)[0]
      return (state as Record<string, any>)[key]
    })

    expect(states).toContainEqual({ page: 'step2' })
    expect(states).toContainEqual({ page: 'step3' })
  })
})

// =============================================================================
// CUSTOM ROUTER ADAPTER (override via config)
// =============================================================================

describe('Custom router adapter', () => {
  it('should use a custom router adapter when provided via $router config', async () => {
    const pushFn = vi.fn()
    const backFn = vi.fn()

    const customRouter: RouterModule = {
      make: () => ({
        push: pushFn,
        back: backFn,
      }),
    }

    const { form$ } = createForm(
      {
        stepped: true,
        history: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', default: 'x' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text', default: 'y' } },
          },
        }),
      },
      {
        $router: { adapter: () => customRouter },
      }
    )

    await form$.steps.next()
    await flushPromises()

    expect(pushFn).toHaveBeenCalledWith({ page: 'step2' })

    await form$.steps.back()
    await flushPromises()

    expect(backFn).toHaveBeenCalled()
  })

  it('should invoke the onNavigate callback when custom adapter triggers it', async () => {
    let capturedOnNavigate: ((state: any) => void) | undefined

    const customRouter: RouterModule = {
      make: (_active, onNavigate) => {
        capturedOnNavigate = onNavigate
        return {
          push: () => {},
          back: () => {},
        }
      },
    }

    const { form$ } = createForm(
      {
        stepped: true,
        history: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', default: 'x' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text', default: 'y' } },
          },
        }),
      },
      {
        $router: { adapter: () => customRouter },
      }
    )

    expect(form$.steps.page).toBe('step1')

    capturedOnNavigate!({ page: 'step2' })
    await flushPromises()

    expect(form$.steps.page).toBe('step2')
  })
})

// =============================================================================
// VUE-ROUTER MODE (config.router provided)
// =============================================================================

describe('Router module with vue-router instance', () => {
  describe('path mode (default)', () => {
    it('should call router.push with path segment on step navigation', async () => {
      const router = mockRouter()
      ;(router.currentRoute.value as any).path = '/wizard/step1'

      const { form$ } = createForm(
        {
          stepped: true,
          history: true,
          schema: defineSchema({
            step1: {
              type: 'group',
              page: 'Step 1',
              schema: { name: { type: 'text', default: 'x' } },
            },
            step2: {
              type: 'group',
              page: 'Step 2',
              schema: { email: { type: 'text' } },
            },
          }),
        },
        { router } as any
      )

      await flushPromises()
      await form$.steps.next()
      await flushPromises()

      expect(router.push).toHaveBeenCalledWith('/wizard/step2')
    })

    it('should call router.back() on steps.back()', async () => {
      const router = mockRouter()
      ;(router.currentRoute.value as any).path = '/wizard/step1'

      const { form$ } = createForm(
        {
          stepped: true,
          history: true,
          schema: defineSchema({
            step1: {
              type: 'group',
              page: 'Step 1',
              schema: { name: { type: 'text', default: 'x' } },
            },
            step2: {
              type: 'group',
              page: 'Step 2',
              schema: { email: { type: 'text', default: 'y' } },
            },
          }),
        },
        { router } as any
      )

      await flushPromises()
      await form$.steps.next()
      await flushPromises()

      await form$.steps.back()
      await flushPromises()

      expect(router.back).toHaveBeenCalled()
    })

    it('should not call router.push when history is disabled', async () => {
      const router = mockRouter()

      const { form$ } = createForm(
        {
          stepped: true,
          schema: defineSchema({
            step1: {
              type: 'group',
              page: 'Step 1',
              schema: { name: { type: 'text', default: 'x' } },
            },
            step2: {
              type: 'group',
              page: 'Step 2',
              schema: { email: { type: 'text' } },
            },
          }),
        },
        { router } as any
      )

      await flushPromises()
      await form$.steps.next()
      await flushPromises()

      expect(router.push).not.toHaveBeenCalled()
    })

    it('should navigate to a step when the route changes externally', async () => {
      const router = mockRouter()

      const { form$ } = createForm(
        {
          stepped: true,
          history: true,
          schema: defineSchema({
            step1: {
              type: 'group',
              page: 'Step 1',
              schema: { name: { type: 'text', default: 'x' } },
            },
            step2: {
              type: 'group',
              page: 'Step 2',
              schema: { email: { type: 'text', default: 'y' } },
            },
          }),
        },
        { router } as any
      )

      await flushPromises()
      ;(router.currentRoute as any).value = {
        path: '/wizard/step2',
        query: {},
      }
      await flushPromises()

      expect(form$.steps.page).toBe('step2')
    })
  })

  describe('query param mode (routerQueryParam set)', () => {
    it('should call router.push with query param on step navigation', async () => {
      const router = mockRouter()

      const { form$ } = createForm(
        {
          stepped: true,
          history: true,
          schema: defineSchema({
            step1: {
              type: 'group',
              page: 'Step 1',
              schema: { name: { type: 'text', default: 'x' } },
            },
            step2: {
              type: 'group',
              page: 'Step 2',
              schema: { email: { type: 'text' } },
            },
          }),
        },
        { router, $router: { queryParam: 'step' } } as any
      )

      await flushPromises()
      await form$.steps.next()
      await flushPromises()

      expect(router.push).toHaveBeenCalledWith({ query: { step: 'step2' } })
    })

    it('should use a custom query param name', async () => {
      const router = mockRouter()

      const { form$ } = createForm(
        {
          stepped: true,
          history: true,
          schema: defineSchema({
            step1: {
              type: 'group',
              page: 'Step 1',
              schema: { name: { type: 'text', default: 'x' } },
            },
            step2: {
              type: 'group',
              page: 'Step 2',
              schema: { email: { type: 'text' } },
            },
          }),
        },
        { router, $router: { queryParam: 'page' } } as any
      )

      await flushPromises()
      await form$.steps.next()
      await flushPromises()

      expect(router.push).toHaveBeenCalledWith({ query: { page: 'step2' } })
    })

    it('should preserve existing query parameters', async () => {
      const router = mockRouter()
      ;(router.currentRoute.value as any).query = { foo: 'bar' }

      const { form$ } = createForm(
        {
          stepped: true,
          history: true,
          schema: defineSchema({
            step1: {
              type: 'group',
              page: 'Step 1',
              schema: { name: { type: 'text', default: 'x' } },
            },
            step2: {
              type: 'group',
              page: 'Step 2',
              schema: { email: { type: 'text' } },
            },
          }),
        },
        { router, $router: { queryParam: 'step' } } as any
      )

      await flushPromises()
      await form$.steps.next()
      await flushPromises()

      expect(router.push).toHaveBeenCalledWith({
        query: { foo: 'bar', step: 'step2' },
      })
    })
  })
})
