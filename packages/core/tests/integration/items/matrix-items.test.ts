import {
  defineSchema,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from '@vueform/core'
import { nextTick } from 'vue'
import { createForm, flushPromises } from '../../helpers'

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
// PLAIN ARRAY
// =============================================================================
describe('Plain array cols/rows', () => {
  it('should use primitives as both value and label', () => {
    const { form$, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: ['Q1', 'Q2'],
          rows: ['Marketing', 'Engineering'],
        },
      }),
    })

    expect(matrix.resolvedCols).toHaveLength(2)
    expect(matrix.resolvedCols[0].value).toBe('Q1')
    expect(matrix.resolvedCols[0].label).toBe('Q1')
    expect(matrix.resolvedCols[1].value).toBe('Q2')
    expect(matrix.resolvedCols[1].label).toBe('Q2')

    expect(matrix.resolvedRows).toHaveLength(2)
    expect(matrix.resolvedRows[0].props.name).toBe('Marketing')
    expect(matrix.resolvedRows[0].props.label).toBe('Marketing')

    expect(form$.model).toEqual({
      matrix: {
        Marketing: { Q1: null, Q2: null },
        Engineering: { Q1: null, Q2: null },
      },
    })
  })
})

// =============================================================================
// PLAIN OBJECT
// =============================================================================
describe('Plain object cols/rows', () => {
  it('should use keys as values and values as labels', () => {
    const { form$, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: { q1: 'Question 1', q2: 'Question 2' },
          rows: { r1: 'Row 1', r2: 'Row 2' },
        },
      }),
    })

    expect(matrix.resolvedCols[0].value).toBe('q1')
    expect(matrix.resolvedCols[0].label).toBe('Question 1')
    expect(matrix.resolvedCols[1].value).toBe('q2')
    expect(matrix.resolvedCols[1].label).toBe('Question 2')

    expect(matrix.resolvedRows[0].props.name).toBe('r1')
    expect(matrix.resolvedRows[0].props.label).toBe('Row 1')

    expect(form$.model).toEqual({
      matrix: {
        r1: { q1: null, q2: null },
        r2: { q1: null, q2: null },
      },
    })
  })
})

// =============================================================================
// ARRAY OF OBJECTS
// =============================================================================
describe('Array of objects cols/rows', () => {
  it('should use default value/label keys without colValue/colLabel', () => {
    const { form$, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'col_1', label: 'Col 1' },
            { value: 'col_2', label: 'Col 2' },
          ],
          rows: [
            { value: 'row_1', label: 'Row 1' },
            { value: 'row_2', label: 'Row 2' },
          ],
        },
      }),
    })

    expect(matrix.resolvedCols[0].value).toBe('col_1')
    expect(matrix.resolvedCols[0].label).toBe('Col 1')
    expect(matrix.resolvedRows[0].props.name).toBe('row_1')
    expect(matrix.resolvedRows[0].props.label).toBe('Row 1')

    expect(form$.model).toEqual({
      matrix: {
        row_1: { col_1: null, col_2: null },
        row_2: { col_1: null, col_2: null },
      },
    })
  })

  it('should resolve custom keys via colValue/colLabel and rowValue/rowLabel', () => {
    const { form$, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [
            { id: 'q1', name: 'Question 1' },
            { id: 'q2', name: 'Question 2' },
          ],
          colValue: 'id',
          colLabel: 'name',
          rows: [
            { id: 'r1', title: 'Row 1' },
            { id: 'r2', title: 'Row 2' },
          ],
          rowValue: 'id',
          rowLabel: 'title',
        },
      }),
    })

    expect(matrix.resolvedCols[0].value).toBe('q1')
    expect(matrix.resolvedCols[0].label).toBe('Question 1')
    expect(matrix.resolvedRows[0].props.name).toBe('r1')
    expect(matrix.resolvedRows[0].props.label).toBe('Row 1')

    expect(form$.model).toEqual({
      matrix: {
        r1: { q1: null, q2: null },
        r2: { q1: null, q2: null },
      },
    })
  })

  it('should resolve keys via functions', () => {
    const { form$, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [{ meta: { key: 'q1', text: 'Question 1' } }],
          colValue: (col) => col.meta.key,
          colLabel: (col) => col.meta.text,
          rows: [{ meta: { key: 'r1', text: 'Row 1' } }],
          rowValue: (row) => row.meta.key,
          rowLabel: (row) => row.meta.text,
        },
      }),
    })

    expect(matrix.resolvedCols[0].value).toBe('q1')
    expect(matrix.resolvedCols[0].label).toBe('Question 1')
    expect(matrix.resolvedRows[0].props.name).toBe('r1')
    expect(matrix.resolvedRows[0].props.label).toBe('Row 1')

    expect(form$.model).toEqual({
      matrix: {
        r1: { q1: null },
      },
    })
  })
})

// =============================================================================
// COL VALUE — FULL OBJECT
// =============================================================================
describe('colValue null — full object values', () => {
  it('should use full col objects as values in multiple mode', () => {
    const col1 = { id: 'email', label: 'Email', priority: 1 }
    const col2 = { id: 'sms', label: 'SMS', priority: 2 }

    const { form$, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [col1, col2],
          colValue: null,
          rows: [{ value: 'news', label: 'News' }],
          mode: 'multiple',
        },
      }),
    })

    expect(matrix.resolvedCols[0].value).toEqual(col1)
    expect(matrix.resolvedCols[1].value).toEqual(col2)

    form$.find('matrix.news').update([col1])
    expect(form$.model.matrix.news).toEqual([col1])
  })

  it('should use full col objects as values in single mode', () => {
    const col1 = { id: 'email', label: 'Email' }
    const col2 = { id: 'sms', label: 'SMS' }

    const { form$, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [col1, col2],
          colValue: null,
          rows: [{ value: 'news', label: 'News' }],
          mode: 'single',
        },
      }),
    })

    expect(matrix.resolvedCols[0].value).toEqual(col1)

    form$.find('matrix.news').update(col1)
    expect(form$.model.matrix.news).toEqual(col1)
  })

  it('should still extract value key when colValue is not provided', () => {
    const { matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
          ],
          rows: [{ value: 'news', label: 'News' }],
          mode: 'multiple',
        },
      }),
    })

    expect(matrix.resolvedCols[0].value).toBe('email')
    expect(matrix.resolvedCols[1].value).toBe('sms')
  })
})

// =============================================================================
// COL SCHEMA
// =============================================================================
describe('colSchema', () => {
  it('should use the default schema key', () => {
    const { matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'notes', label: 'Notes', schema: { type: 'textarea' } },
            { value: 'name', label: 'Name' },
          ],
          rows: ['row_1'],
        },
      }),
    })

    expect(matrix.resolvedCols[0].component).toBe('VfTextarea')
    expect(matrix.resolvedCols[1].component).toBe('VfText')
  })

  it('should resolve the schema via a custom key', () => {
    const { matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [
            {
              id: 'notes',
              name: 'Notes',
              field: { type: 'textarea', placeholder: 'Add notes' },
            },
          ],
          colValue: 'id',
          colLabel: 'name',
          colSchema: 'field',
          rows: ['row_1'],
        },
      }),
    })

    expect(matrix.resolvedCols[0].component).toBe('VfTextarea')
    expect(matrix.resolvedCols[0].props.placeholder).toBe('Add notes')
  })

  it('should resolve the schema via a function', () => {
    const { matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [{ value: 'qty', label: 'Qty', input: 'textarea' }],
          colSchema: (col) => (col.input ? { type: col.input } : undefined),
          rows: ['row_1'],
        },
      }),
    })

    expect(matrix.resolvedCols[0].component).toBe('VfTextarea')
  })
})

// =============================================================================
// COL MIN/MAX WIDTH
// =============================================================================
describe('colMinWidth / colMaxWidth', () => {
  it('should use the default minWidth/maxWidth keys', () => {
    const { matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'col_1', label: 'Col 1', minWidth: 100, maxWidth: 200 },
          ],
          rows: ['row_1'],
        },
      }),
    })

    expect(matrix.resolvedCols[0].minWidth).toBe('100px')
    expect(matrix.resolvedCols[0].maxWidth).toBe('200px')
    expect(matrix.gridColumns).toContain('minmax(100px, 200px)')
  })

  it('should resolve widths via custom keys', () => {
    const { matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [{ value: 'col_1', label: 'Col 1', min: '4rem', max: '2fr' }],
          colMinWidth: 'min',
          colMaxWidth: 'max',
          rows: ['row_1'],
        },
      }),
    })

    expect(matrix.resolvedCols[0].minWidth).toBe('4rem')
    expect(matrix.resolvedCols[0].maxWidth).toBe('2fr')
    expect(matrix.gridColumns).toContain('minmax(4rem, 2fr)')
  })

  it('should fall back to matrix-level minWidth/maxWidth', () => {
    const { matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [{ value: 'col_1', label: 'Col 1' }],
          minWidth: 50,
          maxWidth: 150,
          rows: ['row_1'],
        },
      }),
    })

    expect(matrix.resolvedCols[0].minWidth).toBe('50px')
    expect(matrix.resolvedCols[0].maxWidth).toBe('150px')
  })
})

// =============================================================================
// ROW RULES
// =============================================================================
describe('rowRules', () => {
  it('should use the default rules key', () => {
    const { matrix, form$ } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: ['col_1'],
          rows: [
            { value: 'row_1', label: 'Row 1', rules: 'required' },
            { value: 'row_2', label: 'Row 2' },
          ],
        },
      }),
    })

    expect(matrix.resolvedRows[0].props.rules).toBe('required')
    expect(matrix.resolvedRows[1].props.rules).toBeUndefined()
    expect(form$.find('matrix.row_1').props.rules).toBe('required')
  })

  it('should resolve rules via a custom key', () => {
    const { matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: ['col_1'],
          rows: [
            { value: 'row_1', label: 'Row 1', validation: 'required|min:3' },
          ],
          rowRules: 'validation',
        },
      }),
    })

    expect(matrix.resolvedRows[0].props.rules).toBe('required|min:3')
  })

  it('should resolve rules via a function', () => {
    const { matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: ['col_1'],
          rows: [
            { value: 'row_1', label: 'Row 1', mandatory: true },
            { value: 'row_2', label: 'Row 2', mandatory: false },
          ],
          rowRules: (row) => (row.mandatory ? 'required' : undefined),
        },
      }),
    })

    expect(matrix.resolvedRows[0].props.rules).toBe('required')
    expect(matrix.resolvedRows[1].props.rules).toBeUndefined()
  })

  it('should fall back to matrix-level rules when the row has none', () => {
    const { matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: ['col_1'],
          rows: [
            { value: 'row_1', label: 'Row 1', rules: 'required' },
            { value: 'row_2', label: 'Row 2' },
          ],
          rules: 'nullable',
        },
      }),
    })

    expect(matrix.resolvedRows[0].props.rules).toBe('required')
    expect(matrix.resolvedRows[1].props.rules).toBe(undefined)
  })
})

// =============================================================================
// COL CONDITIONS
// =============================================================================
describe('colConditions', () => {
  it('should use the default conditions key', () => {
    const { matrix, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'no' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'col_1', label: 'Col 1' },
            {
              value: 'col_2',
              label: 'Col 2',
              conditions: [['trigger', '==', 'yes']],
            },
          ],
          rows: ['row_1'],
        },
      }),
    })

    expect(matrix.resolvedCols[0].available.value).toBe(true)
    expect(matrix.resolvedCols[1].available.value).toBe(false)

    trigger.update('yes')

    expect(matrix.resolvedCols[1].available.value).toBe(true)
  })

  it('should resolve conditions via a custom key', () => {
    const { matrix, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'no' },
        matrix: {
          type: 'matrix',
          cols: [
            {
              value: 'col_1',
              label: 'Col 1',
              visible: [['trigger', '==', 'yes']],
            },
          ],
          colConditions: 'visible',
          rows: ['row_1'],
        },
      }),
    })

    expect(matrix.resolvedCols[0].available.value).toBe(false)

    trigger.update('yes')

    expect(matrix.resolvedCols[0].available.value).toBe(true)
  })

  it('should resolve conditions via a function', () => {
    const { matrix, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'no' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'col_1', label: 'Col 1', restricted: true },
            { value: 'col_2', label: 'Col 2', restricted: false },
          ],
          colConditions: (col) =>
            col.restricted ? [['trigger', '==', 'yes']] : undefined,
          rows: ['row_1'],
        },
      }),
    })

    expect(matrix.resolvedCols[0].available.value).toBe(false)
    expect(matrix.resolvedCols[1].available.value).toBe(true)

    trigger.update('yes')

    expect(matrix.resolvedCols[0].available.value).toBe(true)
  })

  it('should exclude unavailable cols from row cells', () => {
    const { matrix, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'no' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'col_1', label: 'Col 1' },
            {
              value: 'col_2',
              label: 'Col 2',
              conditions: [['trigger', '==', 'yes']],
            },
          ],
          rows: ['row_1'],
        },
      }),
    })

    expect(matrix.resolvedRows[0].cols).toHaveLength(1)
    expect(matrix.resolvedRows[0].cols[0].value).toBe('col_1')

    trigger.update('yes')

    expect(matrix.resolvedRows[0].cols).toHaveLength(2)
    expect(matrix.resolvedRows[0].cols[1].value).toBe('col_2')
  })

  it('should exclude unavailable cols from the grid template', () => {
    const { matrix, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'no' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'col_1', label: 'Col 1' },
            {
              value: 'col_2',
              label: 'Col 2',
              conditions: [['trigger', '==', 'yes']],
            },
          ],
          rows: ['row_1'],
        },
      }),
    })

    const hiddenColCount = () =>
      matrix.gridColumns.match(/minmax\(min-content, 1fr\)/g)?.length ?? 0

    expect(hiddenColCount()).toBe(1)

    trigger.update('yes')

    expect(hiddenColCount()).toBe(2)
  })
})

// =============================================================================
// ROW CONDITIONS
// =============================================================================
describe('rowConditions', () => {
  it('should expose available on resolved rows', () => {
    const { matrix, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'no' },
        matrix: {
          type: 'matrix',
          cols: ['col_1'],
          rows: [
            { value: 'row_1', label: 'Row 1' },
            {
              value: 'row_2',
              label: 'Row 2',
              conditions: [['trigger', '==', 'yes']],
            },
          ],
        },
      }),
    })

    expect(matrix.resolvedRows[0].available.value).toBe(true)
    expect(matrix.resolvedRows[1].available.value).toBe(false)

    trigger.update('yes')

    expect(matrix.resolvedRows[1].available.value).toBe(true)
  })

  it('should use the default conditions key', () => {
    const { form$, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'no' },
        matrix: {
          type: 'matrix',
          cols: ['col_1'],
          rows: [
            { value: 'row_1', label: 'Row 1' },
            {
              value: 'row_2',
              label: 'Row 2',
              conditions: [['trigger', '==', 'yes']],
            },
          ],
        },
      }),
    })

    expect(form$.find('matrix.row_1').available).toBe(true)
    expect(form$.find('matrix.row_2').available).toBe(false)

    trigger.update('yes')

    expect(form$.find('matrix.row_2').available).toBe(true)
  })

  it('should resolve conditions via a custom key', () => {
    const { form$, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'no' },
        matrix: {
          type: 'matrix',
          cols: ['col_1'],
          rows: [
            {
              value: 'row_1',
              label: 'Row 1',
              visible: [['trigger', '==', 'yes']],
            },
          ],
          rowConditions: 'visible',
        },
      }),
    })

    expect(form$.find('matrix.row_1').available).toBe(false)

    trigger.update('yes')

    expect(form$.find('matrix.row_1').available).toBe(true)
  })

  it('should resolve conditions via a function', () => {
    const { form$, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'text', default: 'no' },
        matrix: {
          type: 'matrix',
          cols: ['col_1'],
          rows: [
            { value: 'row_1', label: 'Row 1', restricted: true },
            { value: 'row_2', label: 'Row 2', restricted: false },
          ],
          rowConditions: (row) =>
            row.restricted ? [['trigger', '==', 'yes']] : undefined,
        },
      }),
    })

    expect(form$.find('matrix.row_1').available).toBe(false)
    expect(form$.find('matrix.row_2').available).toBe(true)

    trigger.update('yes')

    expect(form$.find('matrix.row_1').available).toBe(true)
  })
})

// =============================================================================
// ENDPOINT (STRING URL)
// =============================================================================
describe('Endpoint cols/rows', () => {
  it('should fetch cols from a static endpoint', async () => {
    const { adapter, calls } = mockAdapter({
      data: ['col_1', 'col_2'],
    })

    const { form$, matrix } = createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            cols: '/api/cols',
            rows: ['row_1'],
          },
        }),
      },
      { $http: { adapter } }
    )

    expect(matrix.resolvedCols).toHaveLength(0)

    await flushPromises()
    await nextTick()

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/cols')
    expect(matrix.resolvedCols).toHaveLength(2)
    expect(matrix.resolvedCols[0].value).toBe('col_1')

    await nextTick()

    expect(form$.model).toEqual({
      matrix: {
        row_1: { col_1: null, col_2: null },
      },
    })
  })

  it('should fetch rows from a static endpoint with custom keys', async () => {
    const { adapter, calls } = mockAdapter({
      data: [
        { id: 'r1', title: 'Row 1' },
        { id: 'r2', title: 'Row 2' },
      ],
    })

    const { form$, matrix } = createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            cols: ['col_1'],
            rows: '/api/rows',
            rowValue: 'id',
            rowLabel: 'title',
          },
        }),
      },
      { $http: { adapter } }
    )

    expect(matrix.resolvedRows).toHaveLength(0)

    await flushPromises()
    await nextTick()

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/rows')
    expect(matrix.resolvedRows).toHaveLength(2)
    expect(matrix.resolvedRows[0].props.name).toBe('r1')
    expect(matrix.resolvedRows[0].props.label).toBe('Row 1')

    expect(form$.model).toEqual({
      matrix: {
        r1: { col_1: null },
        r2: { col_1: null },
      },
    })
  })

  it('should fetch cols and rows from separate endpoints', async () => {
    const calls: HttpRequestConfig[] = []

    const adapter: HttpAdapter = async <T = any>(
      config: HttpRequestConfig
    ): Promise<HttpResponse<T>> => {
      calls.push(config)
      return {
        data: (config.url?.includes('cols')
          ? [{ value: 'q1', label: 'Question 1' }]
          : [{ value: 'r1', label: 'Row 1' }]) as T,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    }

    const { form$, matrix } = createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            cols: '/api/cols',
            rows: '/api/rows',
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()
    await nextTick()

    expect(calls).toHaveLength(2)
    expect(matrix.resolvedCols[0].value).toBe('q1')
    expect(matrix.resolvedRows[0].props.name).toBe('r1')

    expect(form$.model).toEqual({
      matrix: {
        r1: { q1: null },
      },
    })
  })

  it('should resolve expressions in the endpoint URL and refetch on change', async () => {
    const { adapter, calls } = mockAdapter({
      data: ['col_1'],
    })

    const { country } = createForm(
      {
        schema: defineSchema({
          country: { type: 'text', default: 'us' },
          matrix: {
            type: 'matrix',
            cols: '/api/cols/{country}',
            rows: ['row_1'],
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/cols/us')

    country.update('uk')
    await nextTick()
    await flushPromises()

    expect(calls).toHaveLength(2)
    expect(calls[1].url).toBe('/api/cols/uk')
  })

  it('should resolve expressions in the rows endpoint URL', async () => {
    const { adapter, calls } = mockAdapter({
      data: ['row_1'],
    })

    const { department } = createForm(
      {
        schema: defineSchema({
          department: { type: 'text', default: 'sales' },
          matrix: {
            type: 'matrix',
            cols: ['col_1'],
            rows: '/api/rows/{department}',
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/rows/sales')

    department.update('support')
    await nextTick()
    await flushPromises()

    expect(calls).toHaveLength(2)
    expect(calls[1].url).toBe('/api/rows/support')
  })
})

// =============================================================================
// FUNCTION SOURCE
// =============================================================================
describe('Function cols/rows', () => {
  it('should resolve cols from a sync function receiving the context', () => {
    let receivedContext$: any

    const { form$, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: (context$) => {
            receivedContext$ = context$
            return ['col_1', 'col_2']
          },
          rows: ['row_1'],
        },
      }),
    })

    expect(receivedContext$).toBeTruthy()
    expect(matrix.resolvedCols).toHaveLength(2)
    expect(matrix.resolvedCols[0].value).toBe('col_1')

    expect(form$.model).toEqual({
      matrix: {
        row_1: { col_1: null, col_2: null },
      },
    })
  })

  it('should resolve cols from an async function', async () => {
    const { form$, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: async () => [
            { value: 'q1', label: 'Question 1' },
            { value: 'q2', label: 'Question 2' },
          ],
          rows: ['row_1'],
        },
      }),
    })

    expect(matrix.resolvedCols).toHaveLength(0)

    await flushPromises()
    await nextTick()

    expect(matrix.resolvedCols).toHaveLength(2)
    expect(matrix.resolvedCols[0].label).toBe('Question 1')

    await nextTick()

    expect(form$.model).toEqual({
      matrix: {
        row_1: { q1: null, q2: null },
      },
    })
  })

  it('should resolve rows from an async function with custom keys', async () => {
    const { form$, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: ['col_1'],
          rows: async () => [
            { id: 'r1', title: 'Row 1' },
            { id: 'r2', title: 'Row 2' },
          ],
          rowValue: 'id',
          rowLabel: 'title',
        },
      }),
    })

    expect(matrix.resolvedRows).toHaveLength(0)

    await flushPromises()
    await nextTick()

    expect(matrix.resolvedRows).toHaveLength(2)
    expect(matrix.resolvedRows[1].props.name).toBe('r2')
    expect(matrix.resolvedRows[1].props.label).toBe('Row 2')

    expect(form$.model).toEqual({
      matrix: {
        r1: { col_1: null },
        r2: { col_1: null },
      },
    })
  })
})

// =============================================================================
// SHARED ENDPOINT
// =============================================================================
describe('endpoint (shared cols + rows)', () => {
  it('should load cols and rows from a single endpoint with default keys', async () => {
    const { adapter, calls } = mockAdapter({
      data: {
        cols: [
          { value: 'q1', label: 'Question 1' },
          { value: 'q2', label: 'Question 2' },
        ],
        rows: [{ value: 'r1', label: 'Row 1' }],
      },
    })

    const { form$, matrix } = createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            endpoint: '/api/matrix',
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()
    await nextTick()

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/matrix')
    expect(matrix.resolvedCols).toHaveLength(2)
    expect(matrix.resolvedCols[0].value).toBe('q1')
    expect(matrix.resolvedRows).toHaveLength(1)
    expect(matrix.resolvedRows[0].props.label).toBe('Row 1')

    expect(form$.model).toEqual({
      matrix: {
        r1: { q1: null, q2: null },
      },
    })
  })

  it('should extract cols and rows via custom colsKey/rowsKey keys', async () => {
    const { adapter } = mockAdapter({
      data: {
        columns: ['q1'],
        records: ['r1'],
      },
    })

    const { form$, matrix } = createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            endpoint: '/api/matrix',
            colsKey: 'columns',
            rowsKey: 'records',
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()
    await nextTick()

    expect(matrix.resolvedCols[0].value).toBe('q1')
    expect(matrix.resolvedRows[0].props.name).toBe('r1')

    expect(form$.model).toEqual({
      matrix: {
        r1: { q1: null },
      },
    })
  })

  it('should extract cols and rows via functions', async () => {
    const { adapter } = mockAdapter({
      data: {
        definition: {
          cols: ['q1'],
          rows: ['r1'],
        },
      },
    })

    const { matrix } = createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            endpoint: '/api/matrix',
            colsKey: (data) => data.definition?.cols,
            rowsKey: (data) => data.definition?.rows,
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()
    await nextTick()

    expect(matrix.resolvedCols[0].value).toBe('q1')
    expect(matrix.resolvedRows[0].props.name).toBe('r1')
  })

  it('should apply transformEndpoint before extracting cols and rows', async () => {
    const { adapter } = mockAdapter({
      data: {
        data: {
          cols: ['q1'],
          rows: ['r1'],
        },
      },
    })

    const { matrix } = createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            endpoint: '/api/matrix',
            transformEndpoint: (data) => data.data,
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()
    await nextTick()

    expect(matrix.resolvedCols[0].value).toBe('q1')
    expect(matrix.resolvedRows[0].props.name).toBe('r1')
  })

  it('should let explicit cols override the endpoint cols', async () => {
    const { adapter } = mockAdapter({
      data: {
        cols: ['endpoint_col'],
        rows: ['r1'],
      },
    })

    const { form$, matrix } = createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            endpoint: '/api/matrix',
            cols: ['own_col'],
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()
    await nextTick()

    expect(matrix.resolvedCols).toHaveLength(1)
    expect(matrix.resolvedCols[0].value).toBe('own_col')
    expect(matrix.resolvedRows[0].props.name).toBe('r1')

    expect(form$.model).toEqual({
      matrix: {
        r1: { own_col: null },
      },
    })
  })

  it('should keep numeric rows dynamic while cols come from the endpoint', async () => {
    const { adapter } = mockAdapter({
      data: {
        cols: ['q1'],
        rows: ['ignored'],
      },
    })

    const { form$, matrix } = createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            endpoint: '/api/matrix',
            rows: 2,
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()
    await nextTick()

    expect(matrix.resolvedCols[0].value).toBe('q1')
    expect(matrix.resolvedRows).toHaveLength(2)

    expect(form$.model).toEqual({
      matrix: [{ q1: null }, { q1: null }],
    })
  })

  it('should resolve expressions in the endpoint URL and refetch on change', async () => {
    const { adapter, calls } = mockAdapter({
      data: {
        cols: ['q1'],
        rows: ['r1'],
      },
    })

    const { country } = createForm(
      {
        schema: defineSchema({
          country: { type: 'text', default: 'us' },
          matrix: {
            type: 'matrix',
            endpoint: '/api/matrix/{country}',
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/matrix/us')

    country.update('uk')
    await nextTick()
    await flushPromises()

    expect(calls).toHaveLength(2)
    expect(calls[1].url).toBe('/api/matrix/uk')
  })

  it('should apply custom headers and method to the endpoint request', async () => {
    const { adapter, calls } = mockAdapter({
      data: { cols: ['q1'], rows: ['r1'] },
    })

    createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            endpoint: '/api/matrix',
            headers: { Authorization: 'Bearer token' },
            method: 'POST',
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()

    expect(calls).toHaveLength(1)
    expect(calls[0].method).toBe('POST')
    expect(calls[0].headers).toEqual({ Authorization: 'Bearer token' })
  })
})

// =============================================================================
// TRIGGERS
// =============================================================================
describe('colsTrigger / rowsTrigger', () => {
  it('should re-resolve function cols when a trigger path changes', async () => {
    let resolveCount = 0

    const { matrix, category, other } = createForm({
      schema: defineSchema({
        category: { type: 'text', default: 'a' },
        other: { type: 'text', default: 'x' },
        matrix: {
          type: 'matrix',
          cols: () => {
            resolveCount++
            return ['col_1']
          },
          colsTrigger: ['category'],
          colsDebounce: 0,
          rows: ['row_1'],
        },
      }),
    })

    expect(resolveCount).toBe(1)
    expect(matrix.resolvedCols).toHaveLength(1)

    category.update('b')
    await nextTick()
    await flushPromises()

    expect(resolveCount).toBe(2)

    other.update('y')
    await nextTick()
    await flushPromises()

    expect(resolveCount).toBe(2)
  })

  it('should re-resolve function rows when a trigger path changes', async () => {
    let resolveCount = 0

    const { matrix, category } = createForm({
      schema: defineSchema({
        category: { type: 'text', default: 'a' },
        matrix: {
          type: 'matrix',
          cols: ['col_1'],
          rows: () => {
            resolveCount++
            return ['row_1']
          },
          rowsTrigger: ['category'],
          rowsDebounce: 0,
        },
      }),
    })

    expect(resolveCount).toBe(1)
    expect(matrix.resolvedRows).toHaveLength(1)

    category.update('b')
    await nextTick()
    await flushPromises()

    expect(resolveCount).toBe(2)
  })
})

// =============================================================================
// DEBOUNCE
// =============================================================================
describe('colsDebounce / rowsDebounce', () => {
  it('should debounce cols endpoint refetch with colsDebounce', async () => {
    const { adapter, calls } = mockAdapter({ data: ['col_1'] })

    const { country } = createForm(
      {
        schema: defineSchema({
          country: { type: 'text', default: 'us' },
          matrix: {
            type: 'matrix',
            cols: '/api/cols/{country}',
            colsDebounce: 100,
            rows: ['row_1'],
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
    expect(calls[1].url).toBe('/api/cols/fr')
  })

  it('should debounce rows endpoint refetch with rowsDebounce', async () => {
    const { adapter, calls } = mockAdapter({ data: ['row_1'] })

    const { country } = createForm(
      {
        schema: defineSchema({
          country: { type: 'text', default: 'us' },
          matrix: {
            type: 'matrix',
            cols: ['col_1'],
            rows: '/api/rows/{country}',
            rowsDebounce: 100,
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

    expect(calls).toHaveLength(1)

    await new Promise((r) => setTimeout(r, 150))
    await flushPromises()

    expect(calls).toHaveLength(2)
    expect(calls[1].url).toBe('/api/rows/de')
  })
})

// =============================================================================
// TRANSFORM
// =============================================================================
describe('transformCols / transformRows', () => {
  it('should apply transformCols to endpoint response', async () => {
    const { adapter } = mockAdapter({
      data: {
        results: [
          { id: 'q1', name: 'Question 1' },
          { id: 'q2', name: 'Question 2' },
        ],
      },
    })

    const { matrix } = createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            cols: '/api/cols',
            transformCols: (data) => data.results,
            colValue: 'id',
            colLabel: 'name',
            rows: ['row_1'],
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()
    await nextTick()

    expect(matrix.resolvedCols).toHaveLength(2)
    expect(matrix.resolvedCols[0].value).toBe('q1')
    expect(matrix.resolvedCols[0].label).toBe('Question 1')
  })

  it('should apply transformRows to a function result', async () => {
    const { matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: ['col_1'],
          rows: async () => ({
            items: [{ id: 'r1', title: 'Row 1' }],
          }),
          transformRows: (data) => data.items,
          rowValue: 'id',
          rowLabel: 'title',
        },
      }),
    })

    await flushPromises()
    await nextTick()

    expect(matrix.resolvedRows).toHaveLength(1)
    expect(matrix.resolvedRows[0].props.name).toBe('r1')
    expect(matrix.resolvedRows[0].props.label).toBe('Row 1')
  })
})

// =============================================================================
// HEADERS / METHOD
// =============================================================================
describe('headers / method', () => {
  it('should apply custom headers and method to cols and rows requests', async () => {
    const { adapter, calls } = mockAdapter({ data: ['item'] })

    createForm(
      {
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            cols: '/api/cols',
            rows: '/api/rows',
            headers: { Authorization: 'Bearer token' },
            method: 'POST',
          },
        }),
      },
      { $http: { adapter } }
    )

    await flushPromises()

    expect(calls).toHaveLength(2)
    calls.forEach((call) => {
      expect(call.method).toBe('POST')
      expect(call.headers).toEqual({ Authorization: 'Bearer token' })
    })
  })
})

// =============================================================================
// DYNAMIC ROWS (NUMBER)
// =============================================================================
describe('Dynamic rows with resolved cols', () => {
  it('should keep numeric rows dynamic while cols use custom keys', () => {
    const { form$, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [
            { id: 'q1', name: 'Question 1' },
            { id: 'q2', name: 'Question 2' },
          ],
          colValue: 'id',
          colLabel: 'name',
          rows: 2,
        },
      }),
    })

    expect(matrix.resolvedCols[0].value).toBe('q1')
    expect(matrix.resolvedRows).toHaveLength(2)

    expect(form$.model).toEqual({
      matrix: [
        { q1: null, q2: null },
        { q1: null, q2: null },
      ],
    })
  })
})

// =============================================================================
// COL CONDITIONS — MODEL CLEARING
// =============================================================================
describe('colConditions model clearing', () => {
  it('should clear unavailable col values in multiple mode', async () => {
    const { form$, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'checkbox', text: 'Enable' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
            {
              value: 'push',
              label: 'Push',
              conditions: [['trigger', '==', true]],
            },
          ],
          rows: [
            { value: 'news', label: 'News' },
            { value: 'updates', label: 'Updates' },
          ],
          mode: 'multiple',
        },
      }),
    })

    trigger.update(true)

    form$.find('matrix.news').update(['email', 'push'])
    form$.find('matrix.updates').update(['sms', 'push'])

    expect(form$.model.matrix.news).toEqual(['email', 'push'])
    expect(form$.model.matrix.updates).toEqual(['sms', 'push'])

    trigger.update(false)
    await nextTick()

    expect(form$.model.matrix.news).toEqual(['email'])
    expect(form$.model.matrix.updates).toEqual(['sms'])
  })

  it('should clear unavailable col values in single mode', async () => {
    const { form$, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'checkbox', text: 'Enable' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'email', label: 'Email' },
            {
              value: 'push',
              label: 'Push',
              conditions: [['trigger', '==', true]],
            },
          ],
          rows: [
            { value: 'news', label: 'News' },
            { value: 'updates', label: 'Updates' },
          ],
          mode: 'single',
        },
      }),
    })

    trigger.update(true)

    form$.find('matrix.news').update('push')
    form$.find('matrix.updates').update('email')

    expect(form$.model.matrix.news).toBe('push')
    expect(form$.model.matrix.updates).toBe('email')

    trigger.update(false)
    await nextTick()

    expect(form$.model.matrix.news).toBeNull()
    expect(form$.model.matrix.updates).toBe('email')
  })

  it('should not clear values when col was not selected', async () => {
    const { form$, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'checkbox', text: 'Enable' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'email', label: 'Email' },
            {
              value: 'push',
              label: 'Push',
              conditions: [['trigger', '==', true]],
            },
          ],
          rows: [{ value: 'news', label: 'News' }],
          mode: 'multiple',
        },
      }),
    })

    trigger.update(true)
    form$.find('matrix.news').update(['email'])

    trigger.update(false)
    await nextTick()

    expect(form$.model.matrix.news).toEqual(['email'])
  })
})

// =============================================================================
// ROW CONDITIONS — MODEL CLEARING
// =============================================================================
describe('rowConditions model clearing', () => {
  it('should exclude unavailable rows from model on initial load', async () => {
    const { form$ } = createForm({
      schema: defineSchema({
        trigger: { type: 'checkbox', text: 'Enable' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
          ],
          rows: [
            { value: 'news', label: 'News' },
            {
              value: 'offers',
              label: 'Offers',
              conditions: [['trigger', '==', true]],
            },
          ],
          mode: 'multiple',
        },
      }),
    })

    await nextTick()

    expect(form$.model.matrix).toHaveProperty('news')
    expect(form$.model.matrix).not.toHaveProperty('offers')
  })

  it('should clear unavailable row values in multiple mode', async () => {
    const { form$, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'checkbox', text: 'Enable' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
          ],
          rows: [
            { value: 'news', label: 'News' },
            {
              value: 'offers',
              label: 'Offers',
              conditions: [['trigger', '==', true]],
            },
          ],
          mode: 'multiple',
        },
      }),
    })

    trigger.update(true)

    form$.find('matrix.news').update(['email'])
    form$.find('matrix.offers').update(['email', 'sms'])

    expect(form$.model.matrix.offers).toEqual(['email', 'sms'])

    trigger.update(false)
    await nextTick()

    expect(form$.model.matrix).not.toHaveProperty('offers')
    expect(form$.model.matrix.news).toEqual(['email'])
  })

  it('should clear unavailable row values in single mode', async () => {
    const { form$, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'checkbox', text: 'Enable' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
          ],
          rows: [
            { value: 'news', label: 'News' },
            {
              value: 'offers',
              label: 'Offers',
              conditions: [['trigger', '==', true]],
            },
          ],
          mode: 'single',
        },
      }),
    })

    trigger.update(true)

    form$.find('matrix.news').update('email')
    form$.find('matrix.offers').update('sms')

    expect(form$.model.matrix.offers).toBe('sms')

    trigger.update(false)
    await nextTick()

    expect(form$.model.matrix).not.toHaveProperty('offers')
    expect(form$.model.matrix.news).toBe('email')
  })

  it('should clear both col and row values simultaneously', async () => {
    const { form$, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'checkbox', text: 'Premium' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
            {
              value: 'push',
              label: 'Push',
              conditions: [['trigger', '==', true]],
            },
          ],
          rows: [
            { value: 'news', label: 'News' },
            { value: 'updates', label: 'Updates' },
            {
              value: 'offers',
              label: 'Offers',
              conditions: [['trigger', '==', true]],
            },
          ],
          mode: 'multiple',
        },
      }),
    })

    trigger.update(true)

    form$.find('matrix.news').update(['email', 'push'])
    form$.find('matrix.updates').update(['sms'])
    form$.find('matrix.offers').update(['email', 'push'])

    trigger.update(false)
    await nextTick()

    expect(form$.model.matrix.news).toEqual(['email'])
    expect(form$.model.matrix.updates).toEqual(['sms'])
    expect(form$.model.matrix).not.toHaveProperty('offers')
  })

  it('should restore row model entry when row becomes available again', async () => {
    const { form$, trigger } = createForm({
      schema: defineSchema({
        trigger: { type: 'checkbox', text: 'Enable' },
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'email', label: 'Email' },
            { value: 'sms', label: 'SMS' },
          ],
          rows: [
            { value: 'news', label: 'News' },
            {
              value: 'offers',
              label: 'Offers',
              conditions: [['trigger', '==', true]],
            },
          ],
          mode: 'multiple',
        },
      }),
    })

    trigger.update(true)
    form$.find('matrix.offers').update(['email', 'sms'])
    expect(form$.model.matrix.offers).toEqual(['email', 'sms'])

    trigger.update(false)
    await nextTick()
    expect(form$.model.matrix).not.toHaveProperty('offers')

    trigger.update(true)
    await nextTick()
    expect(form$.model.matrix).toHaveProperty('offers')
    expect(form$.model.matrix.offers).toEqual([])
  })
})
