import {
  defineSchema,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
  type ConditionalProp,
} from '@vueform/core'
import { defineComponent, nextTick, ref } from 'vue'
import { createForm, flushPromises, mountApp } from '../../helpers'

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
// SINGLE MODE (VfSelect)
// =============================================================================
describe('Single mode (VfSelect)', () => {
  describe('Plain array via schema', () => {
    it('should normalize plain string array items', () => {
      const { select } = createForm({
        schema: defineSchema({
          select: {
            type: 'select',
            items: ['Foo', 'Bar', 'Baz'],
          },
        }),
      })

      expect(select.items).toEqual([
        {
          value: 'Foo',
          label: 'Foo',
          disabled: false,
          key: 0,
          $raw: { value: 'Foo', label: 'Foo' },
        },
        {
          value: 'Bar',
          label: 'Bar',
          disabled: false,
          key: 1,
          $raw: { value: 'Bar', label: 'Bar' },
        },
        {
          value: 'Baz',
          label: 'Baz',
          disabled: false,
          key: 2,
          $raw: { value: 'Baz', label: 'Baz' },
        },
      ])
    })

    it('should normalize numeric array items', () => {
      const { select } = createForm({
        schema: defineSchema({
          select: {
            type: 'select',
            items: [1, 2, 3],
          },
        }),
      })

      expect(select.items).toEqual([
        {
          value: 1,
          label: 1,
          disabled: false,
          key: 0,
          $raw: { value: 1, label: 1 },
        },
        {
          value: 2,
          label: 2,
          disabled: false,
          key: 1,
          $raw: { value: 2, label: 2 },
        },
        {
          value: 3,
          label: 3,
          disabled: false,
          key: 2,
          $raw: { value: 3, label: 3 },
        },
      ])
    })
  })

  describe('Plain array via inline template', () => {
    it('should normalize plain string array items in inline template', async () => {
      const App = defineComponent({
        template: `
          <VfForm ref="form$">
            <VfSelect name="select" :items="['Foo', 'Bar', 'Baz']" :label="label" />
          </VfForm>
        `,
        setup() {
          const form$ = ref()
          const label = ref('Pick one')
          return { form$, label }
        },
      })

      const app = mountApp(App)
      await nextTick()

      const el$ = app.vm.form$.find('select')
      expect(el$.items).toHaveLength(3)
      expect(el$.items[0].value).toBe('Foo')
      expect(el$.items[1].value).toBe('Bar')
      expect(el$.items[2].value).toBe('Baz')
    })

    it('should not re-resolve inline array items when another prop changes', async () => {
      let resolveCount = 0

      const App = defineComponent({
        template: `
          <VfForm ref="form$">
            <VfSelect name="select" :items="itemsFn" :label="label" />
          </VfForm>
        `,
        setup() {
          const form$ = ref()
          const label = ref('Pick one')
          const itemsFn = () => {
            resolveCount++
            return ['Foo', 'Bar', 'Baz']
          }
          return { form$, label, itemsFn }
        },
      })

      const app = mountApp(App)
      await nextTick()

      expect(resolveCount).toBe(1)

      const el$ = app.vm.form$.find('select')
      expect(el$.items).toHaveLength(3)

      app.vm.label = 'Choose'
      await nextTick()

      expect(resolveCount).toBe(1)
      expect(el$.items).toHaveLength(3)
      expect(el$.items[0].value).toBe('Foo')
    })
  })

  describe('Plain object', () => {
    it('should normalize object items with keys as values and values as labels', () => {
      const { select } = createForm({
        schema: defineSchema({
          select: {
            type: 'select',
            items: { foo: 'Foo', bar: 'Bar', baz: 'Baz' },
          },
        }),
      })

      expect(select.items[0].value).toBe('foo')
      expect(select.items[0].label).toBe('Foo')
      expect(select.items[0].disabled).toBe(false)
      expect(select.items[1].value).toBe('bar')
      expect(select.items[1].label).toBe('Bar')
      expect(select.items[2].value).toBe('baz')
      expect(select.items[2].label).toBe('Baz')
    })
  })

  describe('Array of objects', () => {
    it('should normalize array of objects with itemLabel and itemValue', () => {
      const { select } = createForm({
        schema: defineSchema({
          select: {
            type: 'select',
            items: [
              { id: 1, name: 'Foo' },
              { id: 2, name: 'Bar' },
            ],
            itemValue: 'id',
            itemLabel: 'name',
          },
        }),
      })

      expect(select.items).toEqual([
        {
          value: 1,
          label: 'Foo',
          disabled: false,
          $raw: { id: 1, name: 'Foo' },
          key: 0,
        },
        {
          value: 2,
          label: 'Bar',
          disabled: false,
          $raw: { id: 2, name: 'Bar' },
          key: 1,
        },
      ])
    })

    it('should use full object as value when itemValue is not set', () => {
      const { select } = createForm({
        schema: defineSchema({
          select: {
            type: 'select',
            items: [
              { id: 1, name: 'Foo' },
              { id: 2, name: 'Bar' },
            ],
            itemLabel: 'name',
          },
        }),
      })

      expect(select.items[0].value).toEqual({ id: 1, name: 'Foo' })
      expect(select.items[1].value).toEqual({ id: 2, name: 'Bar' })
    })

    it('should display JSON when itemLabel is not set', () => {
      const { select } = createForm({
        schema: defineSchema({
          select: {
            type: 'select',
            items: [
              { id: 1, name: 'Foo' },
              { id: 2, name: 'Bar' },
            ],
            itemValue: 'id',
          },
        }),
      })

      expect(select.items[0].label).toBe(JSON.stringify({ id: 1, name: 'Foo' }))
      expect(select.items[1].label).toBe(JSON.stringify({ id: 2, name: 'Bar' }))
    })

    it('should include $raw with the original object', () => {
      const items = [
        { id: 1, name: 'Foo', extra: 'data' },
        { id: 2, name: 'Bar', extra: 'info' },
      ]

      const { select } = createForm({
        schema: defineSchema({
          select: {
            type: 'select',
            items,
            itemValue: 'id',
            itemLabel: 'name',
          },
        }),
      })

      expect(select.items[0].$raw).toEqual(items[0])
      expect(select.items[1].$raw).toEqual(items[1])
    })

    it('should not include $raw for plain array items', () => {
      const { select } = createForm({
        schema: defineSchema({
          select: {
            type: 'select',
            items: ['Foo', 'Bar'],
          },
        }),
      })

      expect(select.items[0].$raw).toEqual({ value: 'Foo', label: 'Foo' })
      expect(select.items[1].$raw).toEqual({ value: 'Bar', label: 'Bar' })
    })
  })

  describe('String items (endpoint)', () => {
    it('should fetch items from a static endpoint', async () => {
      const { adapter, calls } = mockAdapter({
        data: ['Foo', 'Bar', 'Baz'],
      })

      const { select } = createForm(
        {
          schema: defineSchema({
            select: {
              type: 'select',
              items: '/api/items',
            },
          }),
        },
        { $http: { adapter } }
      )

      expect(select.resolving).toBe(true)

      await flushPromises()

      expect(select.resolving).toBe(false)
      expect(calls).toHaveLength(1)
      expect(calls[0].url).toBe('/api/items')
      expect(select.items).toHaveLength(3)
      expect(select.items[0].value).toBe('Foo')
    })

    it('should resolve expressions in the endpoint URL', async () => {
      const { adapter, calls } = mockAdapter({
        data: [
          { id: 1, name: 'City A' },
          { id: 2, name: 'City B' },
        ],
      })

      const { select } = createForm(
        {
          schema: defineSchema({
            country: { type: 'text', default: 'us' },
            select: {
              type: 'select',
              items: '/api/cities/{country}',
              itemValue: 'id',
              itemLabel: 'name',
              itemsDebounce: 0,
            },
          }),
        },
        { $http: { adapter } }
      )

      await flushPromises()

      expect(calls[0].url).toBe('/api/cities/us')
      expect(select.items).toHaveLength(2)
      expect(select.items[0].value).toBe(1)
      expect(select.items[0].label).toBe('City A')
    })

    it('should refetch when expression path value changes but not when other fields change', async () => {
      const { adapter, calls } = mockAdapter({
        data: ['A', 'B'],
      })

      const { country, other } = createForm(
        {
          schema: defineSchema({
            country: { type: 'text', default: 'us' },
            other: { type: 'text', default: 'x' },
            select: {
              type: 'select',
              items: '/api/cities/{country}',
              itemsDebounce: 0,
            },
          }),
        },
        { $http: { adapter } }
      )

      await flushPromises()
      expect(calls).toHaveLength(1)
      expect(calls[0].url).toBe('/api/cities/us')

      country.update('uk')
      await nextTick()
      await flushPromises()

      expect(calls).toHaveLength(2)
      expect(calls[1].url).toBe('/api/cities/uk')

      other.update('y')
      await nextTick()
      await flushPromises()

      expect(calls).toHaveLength(2)
    })

    it('should apply transformItems to endpoint response', async () => {
      const { adapter } = mockAdapter({
        data: {
          results: [
            { id: 1, name: 'Foo' },
            { id: 2, name: 'Bar' },
          ],
        },
      })

      const { select } = createForm(
        {
          schema: defineSchema({
            select: {
              type: 'select',
              items: '/api/items',
              transformItems: (data: any) => data.results,
              itemValue: 'id' as any,
              itemLabel: 'name' as any,
            },
          }),
        },
        { $http: { adapter } }
      )

      await flushPromises()

      expect(select.items).toHaveLength(2)
      expect(select.items[0].value).toBe(1)
      expect(select.items[0].label).toBe('Foo')
    })

    it('should debounce endpoint refetch with itemsDebounce', async () => {
      const { adapter, calls } = mockAdapter({ data: ['A'] })

      const { country } = createForm(
        {
          schema: defineSchema({
            country: { type: 'text', default: 'us' },
            select: {
              type: 'select',
              items: '/api/{country}',
              itemsDebounce: 100,
            },
          }),
        },
        { $http: { adapter } }
      )

      await flushPromises()
      expect(calls).toHaveLength(1)

      country.update('uk')
      await nextTick()
      country.update('de')
      await nextTick()
      country.update('fr')
      await nextTick()

      expect(calls).toHaveLength(1)

      await new Promise((r) => setTimeout(r, 150))
      await flushPromises()

      expect(calls).toHaveLength(2)
      expect(calls[1].url).toBe('/api/fr')
    })
  })
})

// =============================================================================
// MULTIPLE MODE (VfSelect with multiple: true)
// =============================================================================
describe('Multiple mode (VfSelect multiple)', () => {
  it('should select multiple values from a plain array', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          multiple: true,
          default: ['Foo', 'Bar'],
          items: ['Foo', 'Bar', 'Baz'],
        },
      }),
    })

    expect(select.model).toEqual(['Foo', 'Bar'])
    expect(select.items).toHaveLength(3)
  })

  it('should select multiple values from an object', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          multiple: true,
          default: ['foo', 'baz'],
          items: { foo: 'Foo', bar: 'Bar', baz: 'Baz' },
        },
      }),
    })

    expect(select.model).toEqual(['foo', 'baz'])
  })

  it('should select multiple values from array of objects', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          multiple: true,
          default: [1, 3],
          items: [
            { id: 1, name: 'Foo' },
            { id: 2, name: 'Bar' },
            { id: 3, name: 'Baz' },
          ],
          itemValue: 'id',
          itemLabel: 'name',
        },
      }),
    })

    expect(select.model).toEqual([1, 3])
  })

  it('should remove unavailable values when conditions become unmet', async () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'show_all' },
        select: {
          type: 'select',
          multiple: true,
          default: ['a', 'b', 'c'],
          items: [
            { value: 'a', label: 'A', group: 'x' },
            { value: 'b', label: 'B', group: 'y' },
            { value: 'c', label: 'C', group: 'x' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemConditions: (item: any): ConditionalProp => [
            [
              ['trigger', '==', 'show_all'],
              ['trigger', '==', item.group],
            ],
          ],
        },
      }),
    })

    expect(select.model).toEqual(['a', 'b', 'c'])

    trigger.update('x')
    await nextTick()

    expect(select.items.map((i: any) => i.value)).toEqual(['a', 'c'])
    expect(select.model).toEqual(['a', 'c'])
  })

  it('should properly handle object values in multiple mode', async () => {
    const objA = { id: 1, name: 'A' }
    const objB = { id: 2, name: 'B' }
    const objC = { id: 3, name: 'C' }

    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'show_all' },
        select: {
          type: 'select',
          multiple: true,
          default: [objA, objB, objC],
          items: [
            { ...objA, group: 'x' },
            { ...objB, group: 'y' },
            { ...objC, group: 'x' },
          ],
          itemLabel: 'name',
          itemValue: (item: any) => ({ id: item.id, name: item.name }),
          itemConditions: (item: any): ConditionalProp => [
            [
              ['trigger', '==', 'show_all'],
              ['trigger', '==', item.group],
            ],
          ],
        },
      }),
    })

    expect(select.model).toEqual([objA, objB, objC])

    trigger.update('x')
    await nextTick()

    expect(select.model).toEqual([objA, objC])
  })
})

// =============================================================================
// itemValue
// =============================================================================
describe('itemValue', () => {
  it('should extract value via string property name', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { code: 'us', name: 'United States' },
            { code: 'uk', name: 'United Kingdom' },
          ],
          itemValue: 'code',
          itemLabel: 'name',
        },
      }),
    })

    expect(select.items[0].value).toBe('us')
    expect(select.items[1].value).toBe('uk')
  })

  it('should extract value via function', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { code: 'us', name: 'United States' },
            { code: 'uk', name: 'United Kingdom' },
          ],
          itemValue: (item: any) => item.code.toUpperCase(),
          itemLabel: 'name',
        },
      }),
    })

    expect(select.items[0].value).toBe('US')
    expect(select.items[1].value).toBe('UK')
  })
})

// =============================================================================
// itemLabel
// =============================================================================
describe('itemLabel', () => {
  it('should extract label via string property name', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { id: 1, title: 'First' },
            { id: 2, title: 'Second' },
          ],
          itemValue: 'id',
          itemLabel: 'title',
        },
      }),
    })

    expect(select.items[0].label).toBe('First')
    expect(select.items[1].label).toBe('Second')
  })

  it('should extract label via function', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { first: 'John', last: 'Doe' },
            { first: 'Jane', last: 'Smith' },
          ],
          itemValue: 'first',
          itemLabel: (item: any) => `${item.first} ${item.last}`,
        },
      }),
    })

    expect(select.items[0].label).toBe('John Doe')
    expect(select.items[1].label).toBe('Jane Smith')
  })
})

// =============================================================================
// groupLabel
// =============================================================================
describe('groupLabel', () => {
  it('should resolve group label via string property', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            {
              category: 'Fruits',
              options: [
                { id: 1, name: 'Apple' },
                { id: 2, name: 'Banana' },
              ],
            },
            {
              category: 'Vegetables',
              options: [{ id: 3, name: 'Carrot' }],
            },
          ],
          groupLabel: 'category',
          groupChildren: 'options',
          itemValue: 'id',
          itemLabel: 'name',
        },
      }),
    })

    expect(select.grouped).toBe(true)
    expect(select.groups).toHaveLength(2)
    expect(select.groups[0].label).toBe('Fruits')
    expect(select.groups[0].items).toHaveLength(2)
    expect(select.groups[0].items[0].value).toBe(1)
    expect(select.groups[0].items[0].label).toBe('Apple')
    expect(select.groups[1].label).toBe('Vegetables')
    expect(select.groups[1].items).toHaveLength(1)
    expect(select.groups[1].items[0].value).toBe(3)
  })

  it('should resolve group label via function', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { cat: 'fruit', items: ['Apple'] },
            { cat: 'veggie', items: ['Carrot'] },
          ],
          groupLabel: (group: any) => group.cat.toUpperCase(),
          groupChildren: 'items',
        },
      }),
    })

    expect(select.groups[0].label).toBe('FRUIT')
    expect(select.groups[1].label).toBe('VEGGIE')
  })
})

// =============================================================================
// groupChildren
// =============================================================================
describe('groupChildren', () => {
  it('should resolve group children via string property', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { name: 'Group A', opts: ['X', 'Y'] },
            { name: 'Group B', opts: ['Z'] },
          ],
          groupLabel: 'name',
          groupChildren: 'opts',
        },
      }),
    })

    expect(select.groups[0].items).toHaveLength(2)
    expect(select.groups[0].items[0].value).toBe('X')
    expect(select.groups[0].items[1].value).toBe('Y')
    expect(select.groups[1].items).toHaveLength(1)
    expect(select.groups[1].items[0].value).toBe('Z')
  })

  it('should resolve group children via function', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { name: 'Group A', data: { list: ['X', 'Y'] } },
            { name: 'Group B', data: { list: ['Z'] } },
          ],
          groupLabel: 'name',
          groupChildren: (group: any) => group.data.list,
        },
      }),
    })

    expect(select.groups[0].items).toHaveLength(2)
    expect(select.groups[0].items[0].value).toBe('X')
    expect(select.groups[1].items[0].value).toBe('Z')
  })

  it('should support groupChildren returning object format', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { name: 'Colors', opts: { red: 'Red', blue: 'Blue' } },
            { name: 'Sizes', opts: { sm: 'Small', lg: 'Large' } },
          ],
          groupLabel: 'name',
          groupChildren: 'opts',
        },
      }),
    })

    expect(select.groups[0].items[0].value).toBe('red')
    expect(select.groups[0].items[0].label).toBe('Red')
    expect(select.groups[0].items[1].value).toBe('blue')
    expect(select.groups[1].items[0].value).toBe('sm')
    expect(select.groups[1].items[0].label).toBe('Small')
  })

  it('should store $raw on each group', () => {
    const groups = [
      { category: 'Fruits', options: ['Apple'], extra: 'data' },
      { category: 'Vegetables', options: ['Carrot'] },
    ]

    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: groups,
          groupLabel: 'category',
          groupChildren: 'options',
        },
      }),
    })

    expect(select.groups[0].$raw).toEqual(groups[0])
    expect(select.groups[1].$raw).toEqual(groups[1])
  })
})

// =============================================================================
// itemDisabled
// =============================================================================
describe('itemDisabled', () => {
  it('should disable items via string property lookup', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { value: 'a', label: 'A', inactive: false },
            { value: 'b', label: 'B', inactive: true },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemDisabled: 'inactive',
        },
      }),
    })

    expect(select.items[0].disabled).toBe(false)
    expect(select.items[1].disabled).toBe(true)
  })

  it('should disable items via function returning boolean', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemDisabled: (item: any) => item.value === 'b',
        },
      }),
    })

    expect(select.items[0].disabled).toBe(false)
    expect(select.items[1].disabled).toBe(true)
  })

  it('should disable items via function returning expression condition string', () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'a' },
        select: {
          type: 'select',
          items: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemDisabled: (item: any) => `trigger == "${item.value}"`,
        },
      }),
    })

    expect(select.items[0].disabled).toBe(true)
    expect(select.items[1].disabled).toBe(false)

    trigger.update('b')
    expect(select.items[0].disabled).toBe(false)
    expect(select.items[1].disabled).toBe(true)
  })

  it('should disable items via function returning structured condition', () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'a' },
        select: {
          type: 'select',
          items: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemDisabled: (item: any) => [['trigger', '==', item.value]],
        },
      }),
    })

    expect(select.items[0].disabled).toBe(true)
    expect(select.items[1].disabled).toBe(false)

    trigger.update('b')
    expect(select.items[0].disabled).toBe(false)
    expect(select.items[1].disabled).toBe(true)
  })

  it('should disable items via function returning a functional condition', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { value: 'a', label: 'A', off: true },
            { value: 'b', label: 'B', off: false },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemDisabled: (item: any) => () => item.off,
        },
      }),
    })

    expect(select.items[0].disabled).toBe(true)
    expect(select.items[1].disabled).toBe(false)
  })

  it('should disable items via function returning an async functional condition', async () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { value: 'a', label: 'A', off: true },
            { value: 'b', label: 'B', off: false },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemDisabled: (item: any) => async () => item.off,
        },
      }),
    })

    await flushPromises()
    await nextTick()

    expect(select.items[0].disabled).toBe(true)
    expect(select.items[1].disabled).toBe(false)
  })

  it('should not disable any items when itemDisabled is not set', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
        },
      }),
    })

    expect(select.items[0].disabled).toBe(false)
    expect(select.items[1].disabled).toBe(false)
  })

  it('should apply itemDisabled to grouped items', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            {
              label: 'Group',
              options: [
                { value: 'a', label: 'A', off: true },
                { value: 'b', label: 'B', off: false },
              ],
            },
          ],
          groupLabel: 'label',
          groupChildren: 'options',
          itemValue: 'value',
          itemLabel: 'label',
          itemDisabled: 'off',
        },
      }),
    })

    expect(select.groups[0].items[0].disabled).toBe(true)
    expect(select.groups[0].items[1].disabled).toBe(false)
  })
})

// =============================================================================
// itemConditions
// =============================================================================
describe('itemConditions', () => {
  it('should hide items via function returning structured condition', () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'show_a' },
        select: {
          type: 'select',
          items: [
            { value: 'a', label: 'A', showWhen: 'show_a' },
            { value: 'b', label: 'B', showWhen: 'show_b' },
            { value: 'c', label: 'C', showWhen: 'show_a' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemConditions: (item: any): ConditionalProp => [
            ['trigger', '==', item.showWhen],
          ],
        },
      }),
    })

    expect(select.items.map((i: any) => i.value)).toEqual(['a', 'c'])

    trigger.update('show_b')
    expect(select.items.map((i: any) => i.value)).toEqual(['b'])
  })

  it('should hide items via function returning expression string', () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'yes' },
        select: {
          type: 'select',
          items: [
            { value: 'a', label: 'A', show: 'yes' },
            { value: 'b', label: 'B', show: 'no' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemConditions: (item: any): ConditionalProp =>
            `trigger == "${item.show}"`,
        },
      }),
    })

    expect(select.items.map((i: any) => i.value)).toEqual(['a'])

    trigger.update('no')
    expect(select.items.map((i: any) => i.value)).toEqual(['b'])
  })

  it('should show all items when itemConditions is not set', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
        },
      }),
    })

    expect(select.items).toHaveLength(2)
  })

  it('should apply itemConditions to grouped items', () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'show_a' },
        select: {
          type: 'select',
          items: [
            {
              label: 'Group',
              options: [
                { value: 'a', label: 'A', show: 'show_a' },
                { value: 'b', label: 'B', show: 'show_b' },
              ],
            },
          ],
          groupLabel: 'label',
          groupChildren: 'options',
          itemValue: 'value',
          itemLabel: 'label',
          itemConditions: (item: any): ConditionalProp => [
            ['trigger', '==', item.show],
          ],
        },
      }),
    })

    expect(select.groups[0].items).toHaveLength(1)
    expect(select.groups[0].items[0].value).toBe('a')

    trigger.update('show_b')
    expect(select.groups[0].items).toHaveLength(1)
    expect(select.groups[0].items[0].value).toBe('b')
  })
})

// =============================================================================
// groupConditions
// =============================================================================
describe('groupConditions', () => {
  it('should omit groups via function returning structured condition', () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'yes' },
        select: {
          type: 'select',
          items: [
            { name: 'Visible', show: 'yes', options: ['A', 'B'] },
            { name: 'Hidden', show: 'no', options: ['C'] },
          ],
          groupLabel: 'name',
          groupChildren: 'options',
          groupConditions: (group: any) => [['trigger', '==', group.show]],
        },
      }),
    })

    expect(select.groups).toHaveLength(1)
    expect(select.groups[0].label).toBe('Visible')

    trigger.update('no')
    expect(select.groups).toHaveLength(1)
    expect(select.groups[0].label).toBe('Hidden')
  })

  it('should omit groups via function returning expression string', () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'yes' },
        select: {
          type: 'select',
          items: [
            { name: 'Show', show: 'yes', options: ['A'] },
            { name: 'Hide', show: 'no', options: ['B'] },
          ],
          groupLabel: 'name',
          groupChildren: 'options',
          groupConditions: (group: any) => `trigger == "${group.show}"`,
        },
      }),
    })

    expect(select.groups).toHaveLength(1)
    expect(select.groups[0].label).toBe('Show')

    trigger.update('no')
    expect(select.groups).toHaveLength(1)
    expect(select.groups[0].label).toBe('Hide')
  })

  it('should omit groups via string property lookup', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: [
            { name: 'Active', active: true, options: ['A'] },
            { name: 'Inactive', active: false, options: ['B'] },
          ],
          groupLabel: 'name',
          groupChildren: 'options',
          groupConditions: 'active',
        },
      }),
    })

    expect(select.groups).toHaveLength(1)
    expect(select.groups[0].label).toBe('Active')
  })

  it('should clear value when its group becomes unavailable', async () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'show' },
        select: {
          type: 'select',
          default: 'a',
          items: [
            {
              name: 'Group',
              options: [
                { value: 'a', label: 'A' },
                { value: 'b', label: 'B' },
              ],
            },
          ],
          groupLabel: 'name',
          groupChildren: 'options',
          itemValue: 'value',
          itemLabel: 'label',
          groupConditions: (): ConditionalProp => [['trigger', '==', 'show']],
        },
      }),
    })

    expect(select.model).toBe('a')

    trigger.update('hide')
    await nextTick()

    expect(select.groups).toHaveLength(0)
    expect(select.model).toBeNull()
  })
})

// =============================================================================
// VALUE CLEARING ON CONDITION CHANGE
// =============================================================================
describe('Value clearing on condition change', () => {
  it('should clear single select value when selected item becomes unavailable', async () => {
    const schema = ref(
      defineSchema({
        trigger: { type: 'text', default: 'show_all' },
        select: {
          type: 'select',
          default: 'b',
          items: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemConditions: (): ConditionalProp => [
            ['trigger', '==', 'show_all'],
          ],
        },
      })
    ) as any

    const { trigger, select } = createForm({ schema })

    expect(select.model).toBe('b')
    expect(select.items).toHaveLength(2)

    trigger.update('hide_all')
    await nextTick()

    expect(select.items).toHaveLength(0)
    expect(select.model).toBeNull()
  })

  it('should remove unavailable values from multiple select', async () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'show_all' },
        select: {
          type: 'select',
          multiple: true,
          default: ['a', 'b', 'c'],
          items: [
            { value: 'a', label: 'A', group: 'x' },
            { value: 'b', label: 'B', group: 'y' },
            { value: 'c', label: 'C', group: 'x' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemConditions: (item: any): ConditionalProp => [
            [
              ['trigger', '==', 'show_all'],
              ['trigger', '==', item.group],
            ],
          ],
        },
      }),
    })

    expect(select.model).toEqual(['a', 'b', 'c'])

    trigger.update('x')
    await nextTick()

    expect(select.items.map((i: any) => i.value)).toEqual(['a', 'c'])
    expect(select.model).toEqual(['a', 'c'])
  })

  it('should not clear value when item is still available', () => {
    const { select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'show' },
        select: {
          type: 'select',
          default: 'a',
          items: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemConditions: (): ConditionalProp => [['trigger', '==', 'show']],
        },
      }),
    })

    expect(select.model).toBe('a')
    expect(select.items).toHaveLength(2)
  })

  it('should handle object values when clearing unavailable selections', async () => {
    const objA = { id: 1, name: 'A' }
    const objB = { id: 2, name: 'B' }

    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'show_all' },
        select: {
          type: 'select',
          default: objA,
          items: [objA, objB],
          itemLabel: 'name',
          itemConditions: (): ConditionalProp => [
            ['trigger', '==', 'show_all'],
          ],
        },
      }),
    })

    expect(select.model).toEqual(objA)

    trigger.update('hide')
    await nextTick()

    expect(select.items).toHaveLength(0)
    expect(select.model).toBeNull()
  })

  it('should clear value when grouped item becomes unavailable', async () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'show' },
        select: {
          type: 'select',
          default: 'a',
          items: [
            {
              label: 'Group',
              options: [{ value: 'a', label: 'A' }],
            },
          ],
          groupLabel: 'label',
          groupChildren: 'options',
          itemValue: 'value',
          itemLabel: 'label',
          itemConditions: (): ConditionalProp => [['trigger', '==', 'show']],
        },
      }),
    })

    expect(select.model).toBe('a')

    trigger.update('hide')
    await nextTick()

    expect(select.model).toBeNull()
  })
})

// =============================================================================
// FUNCTION ITEMS
// =============================================================================
describe('Function items', () => {
  it('should resolve items from a sync function', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: () => ['Foo', 'Bar', 'Baz'],
        },
      }),
    })

    expect(select.items).toHaveLength(3)
    expect(select.items[0].value).toBe('Foo')
  })

  it('should resolve items from a sync function returning objects', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: () => [
            { id: 1, name: 'Foo' },
            { id: 2, name: 'Bar' },
          ],
          itemValue: 'id',
          itemLabel: 'name',
        },
      }),
    })

    expect(select.items[0].value).toBe(1)
    expect(select.items[0].label).toBe('Foo')
  })

  it('should resolve items from a sync function returning a plain object', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: () => ({ foo: 'Foo', bar: 'Bar' }),
        },
      }),
    })

    expect(select.items[0].value).toBe('foo')
    expect(select.items[0].label).toBe('Foo')
  })

  it('should resolve items from an async function', async () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: async () => ['Foo', 'Bar', 'Baz'],
        },
      }),
    })

    expect(select.items).toHaveLength(0)
    expect(select.resolving).toBe(true)

    await flushPromises()

    expect(select.items).toHaveLength(3)
    expect(select.items[0].value).toBe('Foo')
    expect(select.resolving).toBe(false)
  })

  it('should handle empty result from function', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: () => [],
        },
      }),
    })

    expect(select.items).toHaveLength(0)
  })

  it('should handle null/undefined result from function', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: () => null,
        },
      }),
    })

    expect(select.items).toHaveLength(0)
  })

  it('should re-resolve when items function reference changes', async () => {
    const schema = ref(
      defineSchema({
        select: {
          type: 'select',
          items: () => ['Foo', 'Bar'],
        },
      })
    ) as any

    const { select } = createForm({ schema })

    expect(select.items).toHaveLength(2)

    schema.value.select.items = () => ['A', 'B', 'C']
    await nextTick()

    expect(select.items).toHaveLength(3)
    expect(select.items[2].value).toBe('C')
  })
})

// =============================================================================
// REACTIVITY
// =============================================================================
describe('Reactivity', () => {
  it('should react to items prop changes', async () => {
    const schema = ref(
      defineSchema({
        select: {
          type: 'select',
          items: ['Foo', 'Bar'],
        },
      })
    ) as any

    const { select } = createForm({ schema })

    expect(select.items).toHaveLength(2)

    schema.value.select.items = ['Foo', 'Bar', 'Baz']
    await nextTick()

    expect(select.items).toHaveLength(3)
    expect(select.items[2].value).toBe('Baz')
  })

  it('should react to itemDisabled condition changes', () => {
    const { trigger, select } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'none' },
        select: {
          type: 'select',
          items: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
          itemValue: 'value',
          itemLabel: 'label',
          itemDisabled: (item: any) => [['trigger', '==', item.value]],
        },
      }),
    })

    expect(select.items[0].disabled).toBe(false)
    expect(select.items[1].disabled).toBe(false)

    trigger.update('a')
    expect(select.items[0].disabled).toBe(true)
    expect(select.items[1].disabled).toBe(false)

    trigger.update('b')
    expect(select.items[0].disabled).toBe(false)
    expect(select.items[1].disabled).toBe(true)
  })
})

// =============================================================================
// itemsTrigger
// =============================================================================
describe('itemsTrigger', () => {
  it('should re-resolve when itemsTrigger array paths change via schema', async () => {
    let callCount = 0

    const { country, other } = createForm({
      schema: defineSchema({
        country: { type: 'text', default: 'us' },
        other: { type: 'text', default: 'x' },
        select: {
          type: 'select',
          items: () => {
            callCount++
            return ['A', 'B']
          },
          itemsTrigger: ['country'],
          itemsDebounce: 0,
        },
      }),
    })

    expect(callCount).toBe(1)

    country.update('uk')
    await nextTick()

    expect(callCount).toBe(2)

    other.update('y')
    await nextTick()

    expect(callCount).toBe(2)
  })

  it('should re-resolve when itemsTrigger array paths change via inline template', async () => {
    let callCount = 0
    const itemsFn = () => {
      callCount++
      return ['A', 'B']
    }

    const App = defineComponent({
      template: `
        <VfForm ref="form$">
          <VfSelect name="country" :default="'us'" type="text" />
          <VfSelect name="other" :default="'x'" type="text" />
          <VfSelect name="select" :items="itemsFn" :items-trigger="['country']" :items-debounce="0" :label="label" />
        </VfForm>
      `,
      setup() {
        const form$ = ref()
        const label = ref('Pick')
        return { form$, itemsFn, label }
      },
    })

    const app = mountApp(App)
    await nextTick()

    expect(callCount).toBe(1)

    app.vm.form$.find('country').update('uk')
    await nextTick()

    expect(callCount).toBe(2)

    app.vm.form$.find('other').update('y')
    await nextTick()

    expect(callCount).toBe(2)

    app.vm.label = 'Choose'
    await nextTick()

    expect(callCount).toBe(2)
  })

  it('should re-resolve when itemsTrigger is a ref and its value changes', async () => {
    let callCount = 0
    const trigger = ref('initial')

    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: () => {
            callCount++
            return ['A', 'B']
          },
          itemsTrigger: trigger,
          itemsDebounce: 0,
        },
      }),
    })

    expect(callCount).toBe(1)

    trigger.value = 'changed'
    await nextTick()

    expect(callCount).toBe(2)

    select.update('A')
    await nextTick()

    expect(callCount).toBe(2)
  })

  it('should re-resolve when itemsTrigger is a function and its return value changes', async () => {
    let callCount = 0

    const { country, select } = createForm({
      schema: defineSchema({
        country: { type: 'text', default: 'us' },
        select: {
          type: 'select',
          items: () => {
            callCount++
            return ['A', 'B']
          },
          itemsTrigger: (el$: any) => el$.form$?.get('country'),
          itemsDebounce: 0,
        },
      }),
    })

    const initialCount = callCount

    country.update('uk')
    await nextTick()

    expect(callCount).toBe(initialCount + 1)

    select.update('A')
    await nextTick()

    expect(callCount).toBe(initialCount + 1)
  })

  it('should debounce re-resolution with itemsDebounce', async () => {
    let callCount = 0

    const { country } = createForm({
      schema: defineSchema({
        country: { type: 'text', default: 'us' },
        select: {
          type: 'select',
          items: () => {
            callCount++
            return ['A', 'B']
          },
          itemsTrigger: ['country'],
          itemsDebounce: 100,
        },
      }),
    })

    expect(callCount).toBe(1)

    country.update('uk')
    await nextTick()
    country.update('de')
    await nextTick()
    country.update('fr')
    await nextTick()

    expect(callCount).toBe(1)

    await new Promise((r) => setTimeout(r, 150))

    expect(callCount).toBe(2)
  })
})

// =============================================================================
// transformItems
// =============================================================================
describe('transformItems', () => {
  it('should transform items when options is a string endpoint', async () => {
    const { adapter } = mockAdapter({
      data: {
        results: [
          { id: 1, name: 'Foo' },
          { id: 2, name: 'Bar' },
        ],
      },
    })

    const { select } = createForm(
      {
        schema: defineSchema({
          select: {
            type: 'select',
            items: '/api/items',
            transformItems: (data: any) => data.results,
            itemValue: 'id' as any,
            itemLabel: 'name' as any,
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()

    expect(select.items).toHaveLength(2)
    expect(select.items[0].value).toBe(1)
    expect(select.items[0].label).toBe('Foo')
  })

  it('should transform items when options is a sync function', () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: () => ({
            results: [
              { id: 1, name: 'Foo' },
              { id: 2, name: 'Bar' },
            ],
          }),
          transformItems: (data: any) => data.results,
          itemValue: 'id' as any,
          itemLabel: 'name' as any,
        },
      }),
    })

    expect(select.items).toHaveLength(2)
    expect(select.items[0].value).toBe(1)
    expect(select.items[0].label).toBe('Foo')
  })

  it('should transform items when options is an async function', async () => {
    const { select } = createForm({
      schema: defineSchema({
        select: {
          type: 'select',
          items: async () => ({
            results: [
              { id: 1, name: 'Foo' },
              { id: 2, name: 'Bar' },
            ],
          }),
          transformItems: (data: any) => data.results,
          itemValue: 'id' as any,
          itemLabel: 'name' as any,
        },
      }),
    })

    await flushPromises()

    expect(select.items).toHaveLength(2)
    expect(select.items[0].value).toBe(1)
    expect(select.items[1].value).toBe(2)
  })
})

// =============================================================================
// GROUPED ITEMS FROM ENDPOINT
// =============================================================================
describe('Grouped items from endpoint', () => {
  it('should work with grouped items from an endpoint', async () => {
    const { adapter } = mockAdapter({
      data: [
        {
          category: 'Fruits',
          options: [
            { id: 1, name: 'Apple' },
            { id: 2, name: 'Banana' },
          ],
        },
        {
          category: 'Vegetables',
          options: [{ id: 3, name: 'Carrot' }],
        },
      ],
    })

    const { select } = createForm(
      {
        schema: defineSchema({
          select: {
            type: 'select',
            items: '/api/grouped',
            groupLabel: 'category',
            groupChildren: 'options',
            itemValue: 'id',
            itemLabel: 'name',
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()

    expect(select.grouped).toBe(true)
    expect(select.groups).toHaveLength(2)
    expect(select.groups[0].label).toBe('Fruits')
    expect(select.groups[0].items).toHaveLength(2)
    expect(select.groups[1].label).toBe('Vegetables')
    expect(select.groups[1].items[0].value).toBe(3)
  })
})
