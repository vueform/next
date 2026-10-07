import { defineSchema } from '@vueform/primevue'
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue DatePicker component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'date-picker' },
      }),
    })

    expect(form.findComponent({ name: 'DatePicker' }).exists()).toBe(true)
  })

  test('renders with fluid prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'date-picker' },
      }),
    })

    const picker = form.findComponent({ name: 'DatePicker' })
    expect(picker.props('fluid')).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'date-picker' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with custom default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'date-picker', defaultValue: '2024-01-15' },
      }),
    })

    expect(el.value).toBe('2024-01-15')
  })

  test('updates value on model-value update', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'date-picker' },
      }),
    })

    const date = new Date(2024, 5, 20)
    const picker = form.findComponent({ name: 'DatePicker' })
    picker.vm.$emit('update:modelValue', date)
    await nextTick()

    expect(el.value).toEqual(date)
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes placeholder prop to DatePicker', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'date-picker', placeholder: 'Select a date' },
      }),
    })

    const picker = form.findComponent({ name: 'DatePicker' })
    expect(picker.props('placeholder')).toBe('Select a date')
  })

  test('passes disabled prop to DatePicker', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'date-picker', disabled: true },
      }),
    })

    const picker = form.findComponent({ name: 'DatePicker' })
    expect(picker.props('disabled')).toBe(true)
  })

  test('passes readonly prop to DatePicker', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'date-picker', readonly: true },
      }),
    })

    const picker = form.findComponent({ name: 'DatePicker' })
    expect(picker.props('readonly')).toBe(true)
  })

  test('passes showTime prop to DatePicker', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'date-picker', showTime: true },
      }),
    })

    const picker = form.findComponent({ name: 'DatePicker' })
    expect(picker.props('showTime')).toBe(true)
  })

  test('passes selectionMode prop to DatePicker', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'date-picker', selectionMode: 'range' },
      }),
    })

    const picker = form.findComponent({ name: 'DatePicker' })
    expect(picker.props('selectionMode')).toBe('range')
  })
})

// =============================================================================
// selectionMode expressions
// =============================================================================
describe('selectionMode expressions', () => {
  test('resolves selectionMode from expression', async () => {
    const { form } = createForm({
      schema: defineSchema({
        mode: { type: 'select', defaultValue: 'range' },
        el: { type: 'date-picker', selectionMode: '{mode}' },
      }),
    })

    await nextTick()
    const picker = form.findComponent({ name: 'DatePicker' })
    expect(picker.props('selectionMode')).toBe('range')
  })

  test('updates selectionMode when expression source changes', async () => {
    const { form, mode } = createForm({
      schema: defineSchema({
        mode: { type: 'select', defaultValue: 'single' },
        el: { type: 'date-picker', selectionMode: '{mode}' },
      }),
    })

    await nextTick()
    mode.update('multiple')
    await nextTick()

    const picker = form.findComponent({ name: 'DatePicker' })
    expect(picker.props('selectionMode')).toBe('multiple')
  })

  test('wraps single value in array when switching to multiple', async () => {
    const { el, mode } = createForm({
      schema: defineSchema({
        mode: {
          type: 'select',
          defaultValue: 'single',
        },
        el: {
          type: 'date-picker',
          selectionMode: '{mode}',
          defaultValue: '2024-06-15',
        },
      }),
    })

    await nextTick()
    expect(el.value).toBe('2024-06-15')

    mode.update('multiple')
    await nextTick()

    expect(el.value).toEqual(['2024-06-15'])
  })

  test('wraps single value in array when switching to range', async () => {
    const { el, mode } = createForm({
      schema: defineSchema({
        mode: { type: 'select', defaultValue: 'single' },
        el: {
          type: 'date-picker',
          selectionMode: '{mode}',
          defaultValue: '2024-06-15',
        },
      }),
    })

    await nextTick()
    mode.update('range')
    await nextTick()

    expect(el.value).toEqual(['2024-06-15'])
  })

  test('unwraps first array element when switching to single', async () => {
    const { el, mode } = createForm({
      schema: defineSchema({
        mode: { type: 'select', defaultValue: 'multiple' },
        el: {
          type: 'date-picker',
          selectionMode: '{mode}',
          dateFormat: 'yy-mm-dd',
          defaultValue: ['2024-06-15', '2024-06-20'],
        },
      }),
    })

    await nextTick()
    expect(el.value).toEqual(['2024-06-15', '2024-06-20'])

    mode.update('single')
    await nextTick()

    expect(el.value).toBe('2024-06-15')
  })

  test('sets null when switching to single with empty array', async () => {
    const { el, mode } = createForm({
      schema: defineSchema({
        mode: { type: 'select', defaultValue: 'multiple' },
        el: { type: 'date-picker', selectionMode: '{mode}' },
      }),
    })

    await nextTick()
    mode.update('single')
    await nextTick()

    expect(el.value).toBeNull()
  })

  test('picks lowest and highest dates when switching multiple to range', async () => {
    const { el, mode } = createForm({
      schema: defineSchema({
        mode: { type: 'select', defaultValue: 'multiple' },
        el: {
          type: 'date-picker',
          selectionMode: '{mode}',
          dateFormat: 'yy-mm-dd',
          defaultValue: ['2024-06-10', '2024-06-25', '2024-06-05'],
        },
      }),
    })

    await nextTick()
    mode.update('range')
    await nextTick()

    expect(el.value).toEqual(['2024-06-05', '2024-06-25'])
  })

  test('does not change model when switching range to multiple', async () => {
    const { el, mode } = createForm({
      schema: defineSchema({
        mode: { type: 'select', defaultValue: 'range' },
        el: {
          type: 'date-picker',
          selectionMode: '{mode}',
          dateFormat: 'yy-mm-dd',
          defaultValue: ['2024-06-10', '2024-06-20'],
        },
      }),
    })

    await nextTick()
    expect(el.value).toEqual(['2024-06-10', '2024-06-20'])

    mode.update('multiple')
    await nextTick()

    expect(el.value).toEqual(['2024-06-10', '2024-06-20'])
  })
})

// =============================================================================
// min/max expressions
// =============================================================================
describe('min/max expressions', () => {
  test('resolves min from expression', async () => {
    const { form } = createForm({
      schema: defineSchema({
        start: { type: 'date-picker', defaultValue: '2024-01-10' },
        el: { type: 'date-picker', minDate: '{start}' },
      }),
    })

    await nextTick()
    const picker = form.findAllComponents({ name: 'DatePicker' })[1]
    expect(picker.props('minDate')).toEqual(new Date('2024-01-10'))
  })

  test('resolves max from expression', async () => {
    const { form } = createForm({
      schema: defineSchema({
        end: { type: 'date-picker', defaultValue: '2024-12-31' },
        el: { type: 'date-picker', maxDate: '{end}' },
      }),
    })

    await nextTick()
    const picker = form.findAllComponents({ name: 'DatePicker' })[1]
    expect(picker.props('maxDate')).toEqual(new Date('2024-12-31'))
  })

  test('updates minDate when expression source changes', async () => {
    const { form, start } = createForm({
      schema: defineSchema({
        start: { type: 'date-picker', defaultValue: '2024-01-01' },
        el: { type: 'date-picker', minDate: '{start}' },
      }),
    })

    await nextTick()
    start.update('2024-04-15')
    await nextTick()

    const picker = form.findAllComponents({ name: 'DatePicker' })[1]
    expect(picker.props('minDate')).toEqual(new Date('2024-04-15'))
  })

  test('clears single value when it falls below new min', async () => {
    const { el, start } = createForm({
      schema: defineSchema({
        start: { type: 'date-picker' },
        el: {
          type: 'date-picker',
          minDate: '{start}',
          defaultValue: '2024-03-10',
        },
      }),
    })

    await nextTick()
    expect(el.value).toBe('2024-03-10')

    start.update('2024-06-01')
    await nextTick()

    expect(el.value).toBeNull()
  })

  test('clears single value when it exceeds new max', async () => {
    const { el, end } = createForm({
      schema: defineSchema({
        end: { type: 'date-picker' },
        el: {
          type: 'date-picker',
          maxDate: '{end}',
          defaultValue: '2024-09-15',
        },
      }),
    })

    await nextTick()
    expect(el.value).toBe('2024-09-15')

    end.update('2024-06-01')
    await nextTick()

    expect(el.value).toBeNull()
  })

  test('keeps single value when it remains within bounds', async () => {
    const { el, start } = createForm({
      schema: defineSchema({
        start: { type: 'date-picker' },
        el: {
          type: 'date-picker',
          minDate: '{start}',
          defaultValue: '2024-06-15',
        },
      }),
    })

    await nextTick()
    start.update('2024-03-01')
    await nextTick()

    expect(el.value).toBe('2024-06-15')
  })

  test('clears range when start date falls below new min', async () => {
    const { el, start } = createForm({
      schema: defineSchema({
        start: { type: 'date-picker' },
        el: {
          type: 'date-picker',
          selectionMode: 'range',
          minDate: '{start}',
          dateFormat: 'yy-mm-dd',
          defaultValue: ['2024-03-05', '2024-03-20'],
        },
      }),
    })

    await nextTick()
    expect(el.value).toEqual(['2024-03-05', '2024-03-20'])

    start.update('2024-03-10')
    await nextTick()

    expect(el.value).toEqual([])
  })

  test('clears range when end date exceeds new max', async () => {
    const { el, end } = createForm({
      schema: defineSchema({
        end: { type: 'date-picker' },
        el: {
          type: 'date-picker',
          selectionMode: 'range',
          maxDate: '{end}',
          dateFormat: 'yy-mm-dd',
          defaultValue: ['2024-03-05', '2024-03-20'],
        },
      }),
    })

    await nextTick()
    expect(el.value).toEqual(['2024-03-05', '2024-03-20'])

    end.update('2024-03-15')
    await nextTick()

    expect(el.value).toEqual([])
  })

  test('filters out-of-bounds dates in multiple mode for min', async () => {
    const { el, start } = createForm({
      schema: defineSchema({
        start: { type: 'date-picker' },
        el: {
          type: 'date-picker',
          selectionMode: 'multiple',
          minDate: '{start}',
          dateFormat: 'yy-mm-dd',
          defaultValue: ['2024-03-05', '2024-03-15', '2024-03-25'],
        },
      }),
    })

    await nextTick()
    expect(el.value).toEqual(['2024-03-05', '2024-03-15', '2024-03-25'])

    start.update('2024-03-10')
    await nextTick()

    expect(el.value).toEqual(['2024-03-15', '2024-03-25'])
  })

  test('filters out-of-bounds dates in multiple mode for max', async () => {
    const { el, end } = createForm({
      schema: defineSchema({
        end: { type: 'date-picker' },
        el: {
          type: 'date-picker',
          selectionMode: 'multiple',
          maxDate: '{end}',
          dateFormat: 'yy-mm-dd',
          defaultValue: ['2024-03-05', '2024-03-15', '2024-03-25'],
        },
      }),
    })

    await nextTick()
    expect(el.value).toEqual(['2024-03-05', '2024-03-15', '2024-03-25'])

    end.update('2024-03-20')
    await nextTick()

    expect(el.value).toEqual(['2024-03-05', '2024-03-15'])
  })

  test('clears to empty array when all dates are out of bounds', async () => {
    const { el, start } = createForm({
      schema: defineSchema({
        start: { type: 'date-picker' },
        el: {
          type: 'date-picker',
          selectionMode: 'multiple',
          minDate: '{start}',
          dateFormat: 'yy-mm-dd',
          defaultValue: ['2024-03-05', '2024-03-10'],
        },
      }),
    })

    await nextTick()
    start.update('2024-06-01')
    await nextTick()

    expect(el.value).toEqual([])
  })

  test('mutual min/max expressions constrain each other', async () => {
    const { form } = createForm({
      schema: defineSchema({
        start_date: {
          type: 'date-picker',
          maxDate: '{end_date}',
          defaultValue: '2024-03-10',
        },
        end_date: {
          type: 'date-picker',
          minDate: '{start_date}',
          defaultValue: '2024-03-20',
        },
      }),
    })

    await nextTick()
    const pickers = form.findAllComponents({ name: 'DatePicker' })
    expect(pickers[0].props('maxDate')).toEqual(new Date('2024-03-20'))
    expect(pickers[1].props('minDate')).toEqual(new Date('2024-03-10'))
  })
})
