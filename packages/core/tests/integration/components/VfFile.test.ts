import { nextTick } from 'vue'

import { defineSchema, defineSlot } from '#core'

import { createForm, makeApp, mountApp, vModelAndChange } from '../../helpers'

function createMockFile(name = 'test.pdf', type = 'application/pdf') {
  return new File(['content'], name, { type })
}

// =============================================================================
// PROPS
// =============================================================================
describe('VfFile props', () => {
  describe('modelValue / default', () => {
    it('should render with null value (no files)', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file' },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      expect(comp.find('.vf-file-list').exists()).toBe(false)
    })

    it('should render a single string value as file name', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', default: 'document.pdf' },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      expect(comp.find('.vf-file-list').exists()).toBe(true)
      expect(comp.find('.vf-file-name').text()).toBe('document.pdf')
    })

    it('should render a FileObject with name and url as a link', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            default: {
              name: 'report.pdf',
              url: 'https://example.com/report.pdf',
            },
          },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const link = comp.find('.vf-file-name')
      expect(link.element.tagName).toBe('A')
      expect(link.attributes('href')).toBe('https://example.com/report.pdf')
      expect(link.text()).toBe('report.pdf')
    })

    it('should render a FileObject without url as a span', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            default: { name: 'report.pdf' },
          },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const name = comp.find('.vf-file-name')
      expect(name.element.tagName).toBe('SPAN')
      expect(name.text()).toBe('report.pdf')
    })

    it('should render multiple files as a list in multiple mode', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            multiple: true,
            default: ['file1.pdf', 'file2.pdf', 'file3.pdf'],
          },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const items = comp.findAll('.vf-file-item')
      expect(items).toHaveLength(3)
      expect(items[0].find('.vf-file-name').text()).toBe('file1.pdf')
      expect(items[1].find('.vf-file-name').text()).toBe('file2.pdf')
      expect(items[2].find('.vf-file-name').text()).toBe('file3.pdf')
    })

    it('should render a File instance using its name', async () => {
      const mockFile = createMockFile('uploaded.pdf')

      const { file } = createForm({
        schema: defineSchema({
          file: { type: 'file' },
        }),
      })

      file.update(mockFile)
      await nextTick()

      expect(file.fileList[0].name).toBe('uploaded.pdf')
      expect(file.fileList[0].type).toBe('file')
    })
  })

  describe('multiple', () => {
    it('should replace the value in single mode', async () => {
      const { file } = createForm({
        schema: defineSchema({
          file: { type: 'file', default: 'old.pdf' },
        }),
      })

      const newFile = createMockFile('new.pdf')
      file.update(newFile)
      await nextTick()

      expect(file.fileList).toHaveLength(1)
      expect(file.fileList[0].name).toBe('new.pdf')
    })

    it('should append files in multiple mode via handleChange', async () => {
      const { form, file } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            multiple: true,
            default: ['existing.pdf'],
          },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')

      const newFile = createMockFile('added.pdf')
      const dt = new DataTransfer()
      dt.items.add(newFile)

      Object.defineProperty(input.element, 'files', { value: dt.files })
      await input.trigger('input')
      await nextTick()

      expect(file.fileList).toHaveLength(2)
      expect(file.fileList[0].name).toBe('existing.pdf')
      expect(file.fileList[1].name).toBe('added.pdf')
    })

    it('should set multiple attribute on the native input', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', multiple: true },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')
      expect(input.attributes('multiple')).toBeDefined()
    })

    it('should not set multiple attribute when false', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', multiple: false },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')
      expect(input.attributes('multiple')).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('should show remove button by default for pre-existing items', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            multiple: true,
            default: ['file1.pdf', 'file2.pdf'],
          },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const removeButtons = comp.findAll('.vf-file-remove')
      expect(removeButtons).toHaveLength(2)
    })

    it('should hide remove button when remove is false', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            multiple: true,
            remove: false,
            default: ['file1.pdf', 'file2.pdf'],
          },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const removeButtons = comp.findAll('.vf-file-remove')
      expect(removeButtons).toHaveLength(0)
    })

    it('should respect per-item remove:false in FileObject', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            multiple: true,
            default: [
              { name: 'removable.pdf', remove: true },
              { name: 'protected.pdf', remove: false },
            ],
          },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const items = comp.findAll('.vf-file-item')

      expect(items[0].find('.vf-file-remove').exists()).toBe(true)
      expect(items[1].find('.vf-file-remove').exists()).toBe(false)
    })

    it('should always show remove for newly added File instances even when remove is false', async () => {
      const { form, file } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            multiple: true,
            remove: false,
            default: ['existing.pdf'],
          },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')

      const newFile = createMockFile('new.pdf')
      const dt = new DataTransfer()
      dt.items.add(newFile)
      Object.defineProperty(input.element, 'files', { value: dt.files })
      await input.trigger('input')
      await nextTick()

      expect(file.fileList[0].removable).toBe(false)
      expect(file.fileList[1].removable).toBe(true)
    })
  })

  describe('add', () => {
    it('should show file select button by default', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file' },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      expect(comp.findComponent({ name: 'VfButton' }).exists()).toBe(true)
      expect(comp.find('input[type="file"]').exists()).toBe(true)
    })

    it('should hide file select button and input when add is false', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', add: false },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      expect(comp.findComponent({ name: 'VfButton' }).exists()).toBe(false)
      expect(comp.find('input[type="file"]').exists()).toBe(false)
    })
  })

  describe('accept', () => {
    it('should pass accept attribute to the native file input', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', accept: 'image/*,.pdf' },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')
      expect(input.attributes('accept')).toBe('image/*,.pdf')
    })

    it('should not have accept attribute when not provided', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file' },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')
      expect(input.attributes('accept')).toBeUndefined()
    })
  })

  describe('capture', () => {
    it('should pass capture="user" to the native input', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', capture: 'user' },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')
      expect(input.attributes('capture')).toBe('user')
    })

    it('should pass capture="environment" to the native input', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', capture: 'environment' },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')
      expect(input.attributes('capture')).toBe('environment')
    })
  })

  describe('disabled', () => {
    it('should disable the add button when disabled is true', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', disabled: true },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const button = comp.findComponent({ name: 'VfButton' })
      expect(button.props('disabled')).toBe(true)
    })

    it('should disable the remove button when disabled is true', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            disabled: true,
            default: 'file.pdf',
          },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const removeBtn = comp.find('.vf-file-remove')
      expect(removeBtn.attributes('disabled')).toBeDefined()
    })
  })

  describe('text', () => {
    it('should display custom text on the add button', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', text: 'Upload Document' },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const button = comp.findComponent({ name: 'VfButton' })
      expect(button.text()).toContain('Upload Document')
    })

    it('should display default locale text when not provided', () => {
      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file' },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const button = comp.findComponent({ name: 'VfButton' })
      expect(button.text()).toBeTruthy()
    })
  })
})

// =============================================================================
// EVENTS
// =============================================================================
describe('VfFile events', () => {
  describe('focus', () => {
    it('should emit focus event when input receives focus', async () => {
      const onFocus = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', onFocus },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')
      await input.trigger('focus')

      expect(onFocus).toHaveBeenCalledTimes(1)
    })
  })

  describe('blur', () => {
    it('should emit blur event when input loses focus', async () => {
      const onBlur = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', onBlur },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')
      await input.trigger('blur')

      expect(onBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe('add', () => {
    it('should emit add event when a file is selected in single mode', async () => {
      const onAdd = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', onAdd },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')

      const file = createMockFile('test.pdf')
      const dt = new DataTransfer()
      dt.items.add(file)
      Object.defineProperty(input.element, 'files', { value: dt.files })
      await input.trigger('input')

      expect(onAdd).toHaveBeenCalledTimes(1)
      expect(onAdd.mock.calls[0][0]).toBeInstanceOf(File)
      expect(onAdd.mock.calls[0][0].name).toBe('test.pdf')
    })

    it('should emit add event once per file in multiple mode', async () => {
      const onAdd = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', multiple: true, onAdd },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')

      const file1 = createMockFile('a.pdf')
      const file2 = createMockFile('b.pdf')
      const dt = new DataTransfer()
      dt.items.add(file1)
      dt.items.add(file2)
      Object.defineProperty(input.element, 'files', { value: dt.files })
      await input.trigger('input')

      expect(onAdd).toHaveBeenCalledTimes(2)
      expect(onAdd.mock.calls[0][0].name).toBe('a.pdf')
      expect(onAdd.mock.calls[1][0].name).toBe('b.pdf')
    })
  })

  describe('change', () => {
    it('should emit change event when a file is added', async () => {
      const onChange = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', onChange },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')

      const file = createMockFile('test.pdf')
      const dt = new DataTransfer()
      dt.items.add(file)
      Object.defineProperty(input.element, 'files', { value: dt.files })
      await input.trigger('input')

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange.mock.calls[0][0]).toBeInstanceOf(File)
      expect(onChange.mock.calls[0][1]).toBeNull()
    })

    it('should emit change event when a file is removed', async () => {
      const onChange = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', default: 'existing.pdf', onChange },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const removeBtn = comp.find('.vf-file-remove')
      await removeBtn.trigger('click')

      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange.mock.calls[0][0]).toBeNull()
      expect(onChange.mock.calls[0][1]).toBe('existing.pdf')
    })
  })

  describe('remove', () => {
    it('should emit remove event with the raw value when a file is removed', async () => {
      const onRemove = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', default: 'report.pdf', onRemove },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const removeBtn = comp.find('.vf-file-remove')
      await removeBtn.trigger('click')

      expect(onRemove).toHaveBeenCalledTimes(1)
      expect(onRemove.mock.calls[0][0]).toBe('report.pdf')
    })

    it('should emit remove event with FileObject value', async () => {
      const fileObj = { name: 'doc.pdf', url: 'https://example.com/doc.pdf' }
      const onRemove = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          file: { type: 'file', default: fileObj, onRemove },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const removeBtn = comp.find('.vf-file-remove')
      await removeBtn.trigger('click')

      expect(onRemove).toHaveBeenCalledTimes(1)
      expect(onRemove.mock.calls[0][0]).toEqual(fileObj)
    })

    it('should emit remove event in multiple mode with correct item', async () => {
      const onRemove = vi.fn()

      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            multiple: true,
            default: ['a.pdf', 'b.pdf', 'c.pdf'],
            onRemove,
          },
        }),
      })

      const comp = form.findComponent({ name: 'VfFile' })
      const removeButtons = comp.findAll('.vf-file-remove')
      await removeButtons[1].trigger('click')

      expect(onRemove).toHaveBeenCalledTimes(1)
      expect(onRemove.mock.calls[0][0]).toBe('b.pdf')
    })
  })

  describe('update:modelValue', () => {
    it('should sync v-model when a file is added', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfFile name="file" ${vModelAndChange('form')} />
        </VfForm>`
      )

      const app = mountApp(App, {
        props: {
          form: null,
          'onUpdate:form': (v: any) => app.setProps({ form: v }),
        },
      })

      const comp = app.findComponent({ name: 'VfFile' })
      const input = comp.find('input[type="file"]')

      const file = createMockFile('new.pdf')
      const dt = new DataTransfer()
      dt.items.add(file)
      Object.defineProperty(input.element, 'files', { value: dt.files })
      await input.trigger('input')
      await nextTick()

      expect(app.props('form')).toBeInstanceOf(File)
      expect((app.props('form') as File).name).toBe('new.pdf')
    })

    it('should sync v-model to null when file is removed in single mode', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfFile name="file" ${vModelAndChange('form')} />
        </VfForm>`
      )

      const app = mountApp(App, {
        props: {
          form: 'existing.pdf',
          'onUpdate:form': (v: any) => app.setProps({ form: v }),
        },
      })
      await nextTick()

      const comp = app.findComponent({ name: 'VfFile' })
      const removeBtn = comp.find('.vf-file-remove')
      await removeBtn.trigger('click')
      await nextTick()

      expect(app.props('form')).toBeNull()
    })

    it('should sync v-model to updated array when file is removed in multiple mode', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfFile name="file" :multiple="true" ${vModelAndChange('form')} />
        </VfForm>`
      )

      const app = mountApp(App, {
        props: {
          form: ['a.pdf', 'b.pdf', 'c.pdf'],
          'onUpdate:form': (v: any) => app.setProps({ form: v }),
        },
      })
      await nextTick()

      const comp = app.findComponent({ name: 'VfFile' })
      const removeButtons = comp.findAll('.vf-file-remove')
      await removeButtons[1].trigger('click')
      await nextTick()

      expect(app.props('form')).toEqual(['a.pdf', 'c.pdf'])
    })

    it('should accept external v-model value updates', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfFile name="file" :multiple="true" ${vModelAndChange('form')} />
        </VfForm>`
      )

      const app = mountApp(App, {
        props: {
          form: ['initial.pdf'],
          'onUpdate:form': (v: any) => app.setProps({ form: v }),
        },
      })
      await nextTick()

      const comp = app.findComponent({ name: 'VfFile' })
      expect(comp.findAll('.vf-file-item')).toHaveLength(1)

      await app.setProps({ form: ['a.pdf', 'b.pdf'] })
      await nextTick()

      expect(comp.findAll('.vf-file-item')).toHaveLength(2)
    })
  })
})

// =============================================================================
// SLOTS (inline template)
// =============================================================================
describe('VfFile slots (inline)', () => {
  describe('file slot', () => {
    it('should replace file item rendering with slot content', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfFile name="file" :multiple="true" :default="['a.pdf', 'b.pdf']">
            <template #file="{ fileName, index, type, removable }">
              <div class="custom-file">{{ index }}-{{ fileName }}-{{ type }}-{{ removable }}</div>
            </template>
          </VfFile>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      const customFiles = app.findAll('.custom-file')
      expect(customFiles).toHaveLength(2)
      expect(customFiles[0].text()).toBe('0-a.pdf-string-true')
      expect(customFiles[1].text()).toBe('1-b.pdf-string-true')
    })

    it('should expose remove callback and disabled state', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfFile name="file" :default="'test.pdf'">
            <template #file="{ fileName, disabled, remove }">
              <div class="custom-file">
                <span class="name">{{ fileName }}</span>
                <span class="disabled">{{ disabled }}</span>
                <button class="custom-remove" @click="remove(0)">x</button>
              </div>
            </template>
          </VfFile>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      expect(app.find('.name').text()).toBe('test.pdf')
      expect(app.find('.disabled').text()).toBe('false')

      await app.find('.custom-remove').trigger('click')
      await nextTick()

      expect(app.findAll('.custom-file')).toHaveLength(0)
    })
  })

  describe('remove slot', () => {
    it('should replace the remove button', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfFile name="file" :default="'file.pdf'">
            <template #remove="{ index, disabled, remove }">
              <button class="custom-remove-btn" :disabled="disabled" @click="remove(index)">Remove #{{ index }}</button>
            </template>
          </VfFile>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      const btn = app.find('.custom-remove-btn')
      expect(btn.exists()).toBe(true)
      expect(btn.text()).toBe('Remove #0')
      expect(btn.attributes('disabled')).toBeUndefined()

      await btn.trigger('click')
      await nextTick()

      expect(app.find('.custom-remove-btn').exists()).toBe(false)
    })
  })

  describe('name slot', () => {
    it('should replace the file name display', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfFile name="file" :default="{ name: 'doc.pdf', url: 'https://example.com/doc.pdf' }">
            <template #name="{ fileName, url, type }">
              <span class="custom-name">{{ type }}: {{ fileName }} ({{ url }})</span>
            </template>
          </VfFile>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      const name = app.find('.custom-name')
      expect(name.exists()).toBe(true)
      expect(name.text()).toBe('object: doc.pdf (https://example.com/doc.pdf)')
    })
  })

  describe('add slot', () => {
    it('should replace the add button', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfFile name="file" text="Upload">
            <template #add="{ triggerFileInput, disabled, text }">
              <button class="custom-add-btn" :disabled="disabled" @click="triggerFileInput">{{ text }}</button>
            </template>
          </VfFile>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      const btn = app.find('.custom-add-btn')
      expect(btn.exists()).toBe(true)
      expect(btn.text()).toBe('Upload')
      expect(btn.attributes('disabled')).toBeUndefined()
    })

    it('should pass disabled state to add slot', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfFile name="file" :disabled="true">
            <template #add="{ disabled }">
              <span class="add-disabled">{{ disabled }}</span>
            </template>
          </VfFile>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      expect(app.find('.add-disabled').text()).toBe('true')
    })
  })
})

// =============================================================================
// SLOTS (prop-based via defineSlot)
// =============================================================================
describe('VfFile slots (prop)', () => {
  describe('file slot via slots prop', () => {
    it('should replace file item rendering via slots prop', async () => {
      const fileSlot = defineSlot('VfFile.file', {
        props: ['fileName', 'index', 'type'],
        template:
          '<div class="slot-file">{{ index }}-{{ fileName }}-{{ type }}</div>',
      })

      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            multiple: true,
            default: ['x.pdf', 'y.pdf'],
            slots: { file: fileSlot },
          },
        }),
      })

      await nextTick()
      const items = form.findAll('.slot-file')
      expect(items).toHaveLength(2)
      expect(items[0].text()).toBe('0-x.pdf-string')
      expect(items[1].text()).toBe('1-y.pdf-string')
    })
  })

  describe('remove slot via slots prop', () => {
    it('should replace remove button via slots prop', async () => {
      const removeSlot = defineSlot('VfFile.remove', {
        props: ['index', 'remove'],
        template:
          '<button class="slot-remove" @click="remove(index)">Del {{ index }}</button>',
      })

      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            default: 'item.pdf',
            slots: { remove: removeSlot },
          },
        }),
      })

      await nextTick()
      const btn = form.find('.slot-remove')
      expect(btn.exists()).toBe(true)
      expect(btn.text()).toBe('Del 0')
    })
  })

  describe('name slot via slots prop', () => {
    it('should replace file name rendering via slots prop', async () => {
      const nameSlot = defineSlot('VfFile.name', {
        props: ['fileName', 'url', 'type'],
        template: '<span class="slot-name">{{ type }}:{{ fileName }}</span>',
      })

      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            default: { name: 'report.pdf', url: 'https://example.com' },
            slots: { name: nameSlot },
          },
        }),
      })

      await nextTick()
      const name = form.find('.slot-name')
      expect(name.exists()).toBe(true)
      expect(name.text()).toBe('object:report.pdf')
    })
  })

  describe('add slot via slots prop', () => {
    it('should replace add button via slots prop', async () => {
      const addSlot = defineSlot('VfFile.add', {
        props: ['text', 'disabled', 'triggerFileInput'],
        template:
          '<button class="slot-add" :disabled="disabled" @click="triggerFileInput">{{ text }}</button>',
      })

      const { form } = createForm({
        schema: defineSchema({
          file: {
            type: 'file',
            text: 'Choose',
            slots: { add: addSlot },
          },
        }),
      })

      await nextTick()
      const btn = form.find('.slot-add')
      expect(btn.exists()).toBe(true)
      expect(btn.text()).toBe('Choose')
    })
  })
})

// =============================================================================
// PARTS
// =============================================================================
describe('VfFile parts', () => {
  it('should apply attributes to the list part', () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          default: 'file.pdf',
          parts: { list: { 'data-testid': 'file-list' } },
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfFile' })
    const list = comp.find('.vf-file-list')
    expect(list.attributes('data-testid')).toBe('file-list')
  })

  it('should apply attributes to the item part', () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          default: 'file.pdf',
          parts: { item: () => ({ 'data-testid': 'file-item' }) },
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfFile' })
    const item = comp.find('.vf-file-item')
    expect(item.attributes('data-testid')).toBe('file-item')
  })

  it('should apply attributes to the name part (span)', () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          default: 'file.pdf',
          parts: { name: { 'data-testid': 'file-name' } },
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfFile' })
    const name = comp.find('.vf-file-name')
    expect(name.attributes('data-testid')).toBe('file-name')
  })

  it('should apply attributes to the name part (link)', () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          default: { name: 'file.pdf', url: 'https://example.com/file.pdf' },
          parts: { name: () => ({ 'data-testid': 'file-link' }) },
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfFile' })
    const link = comp.find('.vf-file-name')
    expect(link.element.tagName).toBe('A')
    expect(link.attributes('data-testid')).toBe('file-link')
  })

  it('should apply attributes to the remove part', () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          default: 'file.pdf',
          parts: { remove: () => ({ 'data-testid': 'file-remove' }) },
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfFile' })
    const btn = comp.find('.vf-file-remove')
    expect(btn.attributes('data-testid')).toBe('file-remove')
  })

  it('should apply attributes to the input part', () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          parts: { input: { 'data-testid': 'file-input' } },
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfFile' })
    const input = comp.find('input[type="file"]')
    expect(input.attributes('data-testid')).toBe('file-input')
  })
})

// =============================================================================
// CLASSES
// =============================================================================
describe('VfFile classes', () => {
  it('should apply list class to the file list container', () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          default: 'file.pdf',
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfFile' })
    const list = comp.find('.vf-file-list')
    expect(list.exists()).toBe(true)
  })

  it('should apply item class to each file item', () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          multiple: true,
          default: ['a.pdf', 'b.pdf'],
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfFile' })
    const items = comp.findAll('.vf-file-item')
    expect(items).toHaveLength(2)
  })

  it('should apply name class to the file name element', () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          default: 'file.pdf',
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfFile' })
    const name = comp.find('.vf-file-name')
    expect(name.exists()).toBe(true)
  })

  it('should apply remove class to the remove button', () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          default: 'file.pdf',
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfFile' })
    const remove = comp.find('.vf-file-remove')
    expect(remove.exists()).toBe(true)
  })

  it('should extend classes via reclass prop', () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          default: 'file.pdf',
          reclass: {
            list: 'custom-list',
            item: 'custom-item',
            name: 'custom-name',
            remove: 'custom-remove',
          },
        },
      }),
    })

    const comp = form.findComponent({ name: 'VfFile' })
    expect(comp.find('.custom-list').exists()).toBe(true)
    expect(comp.find('.custom-item').exists()).toBe(true)
    expect(comp.find('.custom-name').exists()).toBe(true)
    expect(comp.find('.custom-remove').exists()).toBe(true)
  })
})
