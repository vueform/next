import { defineSchema } from '@vueform/primevue'
import { nextTick } from 'vue'
import { createForm } from '../../helpers'

// =============================================================================
// Basic rendering
// =============================================================================
describe('Basic rendering', () => {
  test('renders PrimeVue FileUpload component', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload' },
      }),
    })

    expect(form.findComponent({ name: 'FileUpload' }).exists()).toBe(true)
  })
})

// =============================================================================
// Model binding
// =============================================================================
describe('Model binding', () => {
  test('has null default value', () => {
    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload' },
      }),
    })

    expect(el.value).toBeNull()
  })

  test('renders with custom default value', () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })

    const { el } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', defaultValue: file },
      }),
    })

    expect(el.value).toBeInstanceOf(File)
    expect(el.value.name).toBe('test.txt')
  })

  test('updates value on select event (single)', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload' },
      }),
    })

    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const fileUpload = form.findComponent({ name: 'FileUpload' })
    fileUpload.vm.$emit('select', {
      originalEvent: new Event('select'),
      files: [file],
    })
    await nextTick()

    expect(el.value).toBeInstanceOf(File)
    expect(el.value.name).toBe('test.txt')
  })

  test('updates value on select event (multiple)', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', multiple: true },
      }),
    })

    const file1 = new File(['a'], 'a.txt', { type: 'text/plain' })
    const file2 = new File(['b'], 'b.txt', { type: 'text/plain' })
    const fileUpload = form.findComponent({ name: 'FileUpload' })
    fileUpload.vm.$emit('select', {
      originalEvent: new Event('select'),
      files: [file1, file2],
    })
    await nextTick()

    expect(el.value).toHaveLength(2)
    expect(el.value[0].name).toBe('a.txt')
    expect(el.value[1].name).toBe('b.txt')
  })

  test('updates value on remove event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', multiple: true },
      }),
    })

    const file1 = new File(['a'], 'a.txt', { type: 'text/plain' })
    const file2 = new File(['b'], 'b.txt', { type: 'text/plain' })
    const fileUpload = form.findComponent({ name: 'FileUpload' })

    fileUpload.vm.$emit('select', {
      originalEvent: new Event('select'),
      files: [file1, file2],
    })
    await nextTick()
    expect(el.value).toHaveLength(2)

    fileUpload.vm.$emit('remove', { file: file1, files: [file2] })
    await nextTick()
    expect(el.value).toHaveLength(1)
    expect(el.value[0].name).toBe('b.txt')
  })

  test('clears value on clear event', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', multiple: true },
      }),
    })

    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const fileUpload = form.findComponent({ name: 'FileUpload' })

    fileUpload.vm.$emit('select', {
      originalEvent: new Event('select'),
      files: [file],
    })
    await nextTick()
    expect(el.value).toHaveLength(1)

    fileUpload.vm.$emit('clear')
    await nextTick()
    expect(el.value).toEqual([])
  })

  test('clears value to null on clear event (single mode)', async () => {
    const { form, el } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload' },
      }),
    })

    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const fileUpload = form.findComponent({ name: 'FileUpload' })

    fileUpload.vm.$emit('select', {
      originalEvent: new Event('select'),
      files: [file],
    })
    await nextTick()
    expect(el.value).toBeInstanceOf(File)

    fileUpload.vm.$emit('clear')
    await nextTick()
    expect(el.value).toBeNull()
  })
})

// =============================================================================
// Props
// =============================================================================
describe('Props', () => {
  test('passes name prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload' },
      }),
    })

    const fileUpload = form.findComponent({ name: 'FileUpload' })
    expect(fileUpload.props('name')).toBe('el')
  })

  test('passes disabled prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', disabled: true },
      }),
    })

    const fileUpload = form.findComponent({ name: 'FileUpload' })
    expect(fileUpload.props('disabled')).toBe(true)
  })

  test('passes multiple prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', multiple: true },
      }),
    })

    const fileUpload = form.findComponent({ name: 'FileUpload' })
    expect(fileUpload.props('multiple')).toBe(true)
  })

  test('passes accept prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', accept: 'image/*' },
      }),
    })

    const fileUpload = form.findComponent({ name: 'FileUpload' })
    expect(fileUpload.props('accept')).toBe('image/*')
  })

  test('passes maxFileSize prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', maxFileSize: 1000000 },
      }),
    })

    const fileUpload = form.findComponent({ name: 'FileUpload' })
    expect(fileUpload.props('maxFileSize')).toBe(1000000)
  })

  test('passes url prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', url: '/api/upload' },
      }),
    })

    const fileUpload = form.findComponent({ name: 'FileUpload' })
    expect(fileUpload.props('url')).toBe('/api/upload')
  })

  test('passes mode prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', mode: 'basic' },
      }),
    })

    const fileUpload = form.findComponent({ name: 'FileUpload' })
    expect(fileUpload.props('mode')).toBe('basic')
  })

  test('passes auto prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', auto: true },
      }),
    })

    const fileUpload = form.findComponent({ name: 'FileUpload' })
    expect(fileUpload.props('auto')).toBe(true)
  })

  test('passes customUpload prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', customUpload: true },
      }),
    })

    const fileUpload = form.findComponent({ name: 'FileUpload' })
    expect(fileUpload.props('customUpload')).toBe(true)
  })
})

// =============================================================================
// Forwarded events
// =============================================================================
describe('Forwarded events', () => {
  test('forwards select event', async () => {
    const onSelect = vi.fn()

    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', onSelect },
      }),
    })

    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const fileUpload = form.findComponent({ name: 'FileUpload' })
    fileUpload.vm.$emit('select', {
      originalEvent: new Event('select'),
      files: [file],
    })
    await nextTick()

    expect(onSelect).toHaveBeenCalled()
  })

  test('forwards clear event', async () => {
    const onClear = vi.fn()

    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', onClear },
      }),
    })

    const fileUpload = form.findComponent({ name: 'FileUpload' })
    fileUpload.vm.$emit('clear')
    await nextTick()

    expect(onClear).toHaveBeenCalled()
  })

  test('forwards upload event', async () => {
    const onUpload = vi.fn()

    const { form } = createForm({
      schema: defineSchema({
        el: { type: 'file-upload', onUpload },
      }),
    })

    const fileUpload = form.findComponent({ name: 'FileUpload' })
    fileUpload.vm.$emit('upload', { xhr: new XMLHttpRequest(), files: [] })
    await nextTick()

    expect(onUpload).toHaveBeenCalled()
  })
})
