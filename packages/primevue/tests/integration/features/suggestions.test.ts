import { defineComponent, nextTick, ref } from 'vue'
import { createForm, flushPromises, mountApp } from '../../helpers'
import type {
  HttpAdapter,
  HttpRequestConfig,
  HttpResponse,
} from '@vueform/core'
import { defineSchema } from '#primevue'

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

// =============================================================================
// PLAIN ARRAY SUGGESTIONS
// =============================================================================
describe('Plain array suggestions', () => {
  it('should render plain string array suggestions as-is', () => {
    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: ['Apple', 'Banana', 'Cherry'],
        },
      }),
    })

    expect(ac.suggestions).toHaveLength(3)
    expect(ac.suggestions[0]).toBe('Apple')
    expect(ac.suggestions[1]).toBe('Banana')
    expect(ac.suggestions[2]).toBe('Cherry')
  })

  it('should render numeric array suggestions as-is', () => {
    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: [10, 20, 30],
        },
      }),
    })

    expect(ac.suggestions).toHaveLength(3)
    expect(ac.suggestions[0]).toBe(10)
  })

  it('should select a value from plain array suggestions', async () => {
    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: ['Apple', 'Banana', 'Cherry'],
        },
      }),
    })

    ac.update('Apple')
    await nextTick()

    expect(ac.model).toBe('Apple')
  })
})

// =============================================================================
// ARRAY OF OBJECTS SUGGESTIONS
// =============================================================================
describe('Array of objects suggestions', () => {
  it('should render array of objects with optionValue and optionLabel', () => {
    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: [
            { id: 1, name: 'Apple' },
            { id: 2, name: 'Banana' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
        },
      }),
    })

    expect(ac.suggestions).toHaveLength(2)
    expect(ac.suggestions[0]).toEqual({ id: 1, name: 'Apple' })
    expect(ac.suggestions[1]).toEqual({ id: 2, name: 'Banana' })
  })

  it('should select a value from array of objects', async () => {
    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          defaultValue: 1,
          suggestions: [
            { id: 1, name: 'Apple' },
            { id: 2, name: 'Banana' },
          ],
          optionValue: 'id',
          optionLabel: 'name',
        },
      }),
    })

    expect(ac.model).toBe(1)
  })
})

// =============================================================================
// FUNCTION-BASED SUGGESTIONS
// =============================================================================
describe('Function-based suggestions', () => {
  it('should resolve suggestions from a sync function', () => {
    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: () => ['Apple', 'Banana', 'Cherry'],
        },
      }),
    })

    expect(ac.suggestions).toHaveLength(3)
    expect(ac.suggestions[0]).toEqual({ value: 'Apple', label: 'Apple' })
  })

  it('should resolve suggestions from an async function', async () => {
    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: async () => ['Apple', 'Banana', 'Cherry'],
        },
      }),
    })

    expect(ac.suggestions).toHaveLength(0)
    expect(ac.resolving).toBe(true)

    await flushPromises()

    expect(ac.suggestions).toHaveLength(3)
    expect(ac.resolving).toBe(false)
  })

  it('should re-resolve function suggestions on handleComplete', async () => {
    let callCount = 0

    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: () => {
            callCount++
            return ['Apple', 'Banana', 'Cherry']
          },
        },
      }),
    })

    expect(callCount).toBe(1)

    ac.handleComplete({ query: 'app', originalEvent: new Event('input') })
    await nextTick()

    expect(callCount).toBe(2)
  })

  it('should re-resolve function suggestions when optionsTrigger path changes', async () => {
    let callCount = 0

    const { category } = createForm({
      schema: defineSchema({
        category: { type: 'input-text', defaultValue: 'fruit' },
        ac: {
          type: 'auto-complete',
          suggestions: () => {
            callCount++
            return ['Apple', 'Banana']
          },
          optionsTrigger: ['category'],
          optionsDebounce: 0,
        },
      }),
    })

    expect(callCount).toBe(1)

    category.update('veggie')
    await nextTick()

    expect(callCount).toBe(2)
  })

  it('should not re-resolve when unrelated fields change', async () => {
    let callCount = 0

    const { other } = createForm({
      schema: defineSchema({
        category: { type: 'input-text', defaultValue: 'fruit' },
        other: { type: 'input-text', defaultValue: 'x' },
        ac: {
          type: 'auto-complete',
          suggestions: () => {
            callCount++
            return ['Apple', 'Banana']
          },
          optionsTrigger: ['category'],
          optionsDebounce: 0,
        },
      }),
    })

    expect(callCount).toBe(1)

    other.update('y')
    await nextTick()

    expect(callCount).toBe(1)
  })

  it('should not refetch when query has not changed on handleComplete when multiple', async () => {
    let callCount = 0

    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          multiple: true,
          suggestions: () => {
            callCount++
            return ['Apple', 'Banana']
          },
        },
      }),
    })

    expect(callCount).toBe(1)

    ac.handleComplete({ query: 'app', originalEvent: new Event('input') })
    await nextTick()

    expect(callCount).toBe(2)

    ac.handleComplete({ query: 'app', originalEvent: new Event('input') })
    await nextTick()

    expect(callCount).toBe(2)
  })

  it('should refetch when query has not changed on handleComplete', async () => {
    let callCount = 0

    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: () => {
            callCount++
            return ['Apple', 'Banana']
          },
        },
      }),
    })

    expect(callCount).toBe(1)

    ac.handleComplete({ query: 'app', originalEvent: new Event('input') })
    await nextTick()

    expect(callCount).toBe(2)

    ac.handleComplete({ query: 'app', originalEvent: new Event('input') })
    await nextTick()

    expect(callCount).toBe(3)
  })
})

// =============================================================================
// STRING ENDPOINT SUGGESTIONS
// =============================================================================
describe('String endpoint suggestions', () => {
  it('should fetch suggestions from a static endpoint', async () => {
    const { adapter, calls } = mockAdapter({
      data: ['Apple', 'Banana', 'Cherry'],
    })

    const { ac } = createForm(
      {
        schema: defineSchema({
          ac: {
            type: 'auto-complete',
            suggestions: '/api/suggestions',
          },
        }),
      },
      { $http: { adapter } }
    )

    expect(ac.resolving).toBe(true)

    await flushPromises()

    expect(ac.resolving).toBe(false)
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/suggestions')
    expect(ac.suggestions).toHaveLength(3)
  })

  it('should resolve expressions in the endpoint URL', async () => {
    const { adapter, calls } = mockAdapter({
      data: ['Apple', 'Banana'],
    })

    createForm(
      {
        schema: defineSchema({
          category: { type: 'input-text', defaultValue: 'fruit' },
          ac: {
            type: 'auto-complete',
            suggestions: '/api/suggestions/{category}',
            optionsDebounce: 0,
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()

    expect(calls[0].url).toBe('/api/suggestions/fruit')
  })

  it('should refetch when expression path changes but not when other fields change', async () => {
    const { adapter, calls } = mockAdapter({
      data: ['A', 'B'],
    })

    const { category, other } = createForm(
      {
        schema: defineSchema({
          category: { type: 'input-text', defaultValue: 'fruit' },
          other: { type: 'input-text', defaultValue: 'x' },
          ac: {
            type: 'auto-complete',
            suggestions: '/api/{category}',
            optionsDebounce: 0,
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()
    expect(calls).toHaveLength(1)

    category.update('veggie')
    await nextTick()
    await flushPromises()

    expect(calls).toHaveLength(2)
    expect(calls[1].url).toBe('/api/veggie')

    other.update('y')
    await nextTick()
    await flushPromises()

    expect(calls).toHaveLength(2)
  })

  it('should apply transformOptions to endpoint response', async () => {
    const { adapter } = mockAdapter({
      data: {
        results: [
          { id: 1, name: 'Apple' },
          { id: 2, name: 'Banana' },
        ],
      },
    })

    const { ac } = createForm(
      {
        schema: defineSchema({
          ac: {
            type: 'auto-complete',
            suggestions: '/api/suggestions',
            transformOptions: (data) => data.results,
            optionValue: 'id',
            optionLabel: 'name',
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()

    expect(ac.suggestions).toHaveLength(2)
    expect(ac.suggestions[0].id).toBe(1)
    expect(ac.suggestions[0].name).toBe('Apple')
  })
})

// =============================================================================
// INLINE TEMPLATE REACTIVITY
// =============================================================================
describe('Inline template reactivity', () => {
  it('should not re-resolve inline function suggestions when another prop changes', async () => {
    let resolveCount = 0

    const App = defineComponent({
      template: `
        <VfForm ref="form$">
          <VfAutoComplete name="ac" :suggestions="suggestionsFn" :label="label" />
        </VfForm>
      `,
      setup() {
        const form$ = ref()
        const label = ref('Search')
        const suggestionsFn = () => {
          resolveCount++
          return ['Apple', 'Banana', 'Cherry']
        }
        return { form$, label, suggestionsFn }
      },
    })

    const app = mountApp(App)
    await nextTick()

    expect(resolveCount).toBe(1)

    const el$ = app.vm.form$.find('ac')
    expect(el$.suggestions).toHaveLength(3)

    app.vm.label = 'Type here'
    await nextTick()

    expect(resolveCount).toBe(1)
    expect(el$.suggestions).toHaveLength(3)
  })

  it('should not re-resolve inline trigger array when another prop changes', async () => {
    let resolveCount = 0

    const App = defineComponent({
      template: `
        <VfForm ref="form$">
          <VfSelect name="category" type="text" :default-value="'fruit'" />
          <VfAutoComplete name="ac" :suggestions="suggestionsFn" :options-trigger="['category']" :options-debounce="0" :label="label" />
        </VfForm>
      `,
      setup() {
        const form$ = ref()
        const label = ref('Search')
        const suggestionsFn = () => {
          resolveCount++
          return ['Apple', 'Banana']
        }
        return { form$, label, suggestionsFn }
      },
    })

    const app = mountApp(App)
    await nextTick()

    expect(resolveCount).toBe(1)

    app.vm.form$.find('category').update('veggie')
    await nextTick()

    expect(resolveCount).toBe(2)

    app.vm.label = 'Type here'
    await nextTick()

    expect(resolveCount).toBe(2)
  })
})

// =============================================================================
// ORIGINAL PRIMEVUE @complete + :suggestions PATTERN
// =============================================================================
describe('Original PrimeVue @complete + :suggestions pattern', () => {
  it('should work with static plain array suggestions without function/string', () => {
    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: ['Apple', 'Banana', 'Cherry'],
        },
      }),
    })

    expect(ac.suggestions).toHaveLength(3)

    ac.handleComplete({ query: 'app', originalEvent: new Event('input') })

    expect(ac.suggestions).toHaveLength(3)
  })

  it('should not call resolveOptions on handleComplete when suggestions is a plain array', async () => {
    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: ['Apple', 'Banana', 'Cherry'],
        },
      }),
    })

    const originalSuggestions = ac.suggestions

    ac.handleComplete({ query: 'app', originalEvent: new Event('input') })
    await nextTick()

    expect(ac.suggestions).toHaveLength(3)
    expect(ac.suggestions).toEqual(originalSuggestions)
  })
})

// =============================================================================
// QUERY TRACKING
// =============================================================================
describe('Query tracking', () => {
  it('should track the query value', () => {
    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: () => ['Apple', 'Banana'],
        },
      }),
    })

    expect(ac.query).toBe('')

    ac.handleComplete({ query: 'app', originalEvent: new Event('input') })

    expect(ac.query).toBe('app')
  })
})

// =============================================================================
// LOADING STATE
// =============================================================================
describe('Loading state', () => {
  it('should set resolving while loading async suggestions', async () => {
    const { ac } = createForm({
      schema: defineSchema({
        ac: {
          type: 'auto-complete',
          suggestions: async () => ['Apple', 'Banana'],
        },
      }),
    })

    expect(ac.resolving).toBe(true)
    expect(ac.loading).toBe(false)

    await flushPromises()

    expect(ac.resolving).toBe(false)
  })
})
