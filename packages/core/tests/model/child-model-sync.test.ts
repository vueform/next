import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'
import { createForm, makeApp, mountApp, vModelAndChange } from '../helpers'

/**
 * These tests cover the change-detection paths that depend on the child model's
 * path subscription (`container.subscribe`) and its reference-change fallback
 * (`watch(model)`):
 *
 * - Remapped containers (checkboxes/radios) whose option children drive the
 *   parent through a synthetic model rather than a real root slice.
 * - Nested containers where an in-place leaf mutation does not change any
 *   ancestor reference, so ancestors learn about it only via path dispatch.
 * - List mutations (sort/add/remove) where children stay index-keyed while the
 *   data moves underneath them.
 */

// =============================================================================
// CHECKBOXES (remapped container, synthetic child model)
// =============================================================================
describe('checkboxes child model sync', () => {
  it('should emit change and update the model when toggling options', async () => {
    const onChange = vi.fn()

    const { form$, form } = createForm({
      schema: defineSchema({
        el: {
          type: 'checkboxes',
          items: { a: 'A', b: 'B', c: 'C' },
          onChange,
        },
      }),
    })

    expect(form$.model).toEqual({ el: [] })

    const inputs = form.findAll('input[type="checkbox"]')
    expect(inputs.length).toBe(3)

    await inputs[0].setValue(true)
    await nextTick()

    expect(form$.model).toEqual({ el: ['a'] })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toEqual(['a'])
    expect(onChange.mock.calls[0][1]).toEqual([])

    await inputs[2].setValue(true)
    await nextTick()

    expect(form$.model).toEqual({ el: ['a', 'c'] })
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange.mock.calls[1][0]).toEqual(['a', 'c'])

    await inputs[0].setValue(false)
    await nextTick()

    expect(form$.model).toEqual({ el: ['c'] })
    expect(onChange).toHaveBeenCalledTimes(3)
    expect(onChange.mock.calls[2][0]).toEqual(['c'])
  })

  it('should sync v-model outbound when toggling options', async () => {
    const App = makeApp(
      `<VfForm ref="form$">
        <VfCheckboxes name="el" :items="{ a: 'A', b: 'B', c: 'C' }" ${vModelAndChange('el')} />
      </VfForm>`,
      ['el']
    )

    const app = mountApp(App, {
      props: {
        el: [],
        'onUpdate:el': (v: any) => app.setProps({ el: v }),
      },
    })
    await nextTick()

    const inputs = app.findAll('input[type="checkbox"]')

    await inputs[1].setValue(true)
    await nextTick()

    expect(app.props('el')).toEqual(['b'])
  })
})

// =============================================================================
// RADIOS (remapped container, synthetic child model)
// =============================================================================
describe('radios child model sync', () => {
  it('should emit change and update the model when selecting an option', async () => {
    const onChange = vi.fn()

    const { form$, form } = createForm({
      schema: defineSchema({
        el: {
          type: 'radios',
          items: { a: 'A', b: 'B', c: 'C' },
          onChange,
        },
      }),
    })

    expect(form$.model).toEqual({ el: null })

    const inputs = form.findAll('input[type="radio"]')
    expect(inputs.length).toBe(3)

    await inputs[1].setValue(true)
    await nextTick()

    expect(form$.model).toEqual({ el: 'b' })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBe('b')
    expect(onChange.mock.calls[0][1]).toBeNull()

    await inputs[2].setValue(true)
    await nextTick()

    expect(form$.model).toEqual({ el: 'c' })
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange.mock.calls[1][0]).toBe('c')
    expect(onChange.mock.calls[1][1]).toBe('b')
  })

  it('should sync v-model outbound when selecting an option', async () => {
    const App = makeApp(
      `<VfForm ref="form$">
        <VfRadios name="el" :items="{ a: 'A', b: 'B', c: 'C' }" ${vModelAndChange('el')} />
      </VfForm>`,
      ['el']
    )

    const app = mountApp(App, {
      props: {
        el: null,
        'onUpdate:el': (v: any) => app.setProps({ el: v }),
      },
    })
    await nextTick()

    const inputs = app.findAll('input[type="radio"]')

    await inputs[2].setValue(true)
    await nextTick()

    expect(app.props('el')).toBe('c')
  })
})

// =============================================================================
// NESTED CONTAINERS (in-place mutation reaches ancestors via path dispatch)
// =============================================================================
describe('nested container change propagation', () => {
  it('should fire change on the group and the form when a leaf is edited in place', async () => {
    const onFormChange = vi.fn()
    const onGroupChange = vi.fn()

    const { form$, form } = createForm({
      onChange: onFormChange,
      schema: defineSchema({
        address: {
          type: 'group',
          nested: true,
          onChange: onGroupChange,
          schema: {
            street: { type: 'text' },
            city: { type: 'text' },
          },
        },
      }),
    })

    expect(form$.model).toEqual({ address: { street: null, city: null } })

    const street = form
      .findAllComponents({ name: 'VfText' })
      .find(({ vm }: any) => vm.path === 'address.street')!.vm

    street.update('Main St')
    await nextTick()
    await nextTick()

    expect(form$.model).toEqual({
      address: { street: 'Main St', city: null },
    })

    expect(onGroupChange).toHaveBeenCalledTimes(1)
    expect(onGroupChange.mock.calls[0][0]).toEqual({
      street: 'Main St',
      city: null,
    })
    expect(onGroupChange.mock.calls[0][1]).toEqual({
      street: null,
      city: null,
    })

    expect(onFormChange).toHaveBeenCalledTimes(1)
    expect(onFormChange.mock.calls[0][0]).toEqual({
      address: { street: 'Main St', city: null },
    })
  })

  it('should fire change on deeply nested groups when a leaf is edited', async () => {
    const onOuterChange = vi.fn()
    const onInnerChange = vi.fn()

    const { form$, form } = createForm({
      schema: defineSchema({
        outer: {
          type: 'group',
          nested: true,
          onChange: onOuterChange,
          schema: {
            inner: {
              type: 'group',
              nested: true,
              onChange: onInnerChange,
              schema: {
                value: { type: 'text' },
              },
            },
          },
        },
      }),
    })

    expect(form$.model).toEqual({ outer: { inner: { value: null } } })

    const leaf = form
      .findAllComponents({ name: 'VfText' })
      .find(({ vm }: any) => vm.path === 'outer.inner.value')!.vm

    leaf.update('deep')
    await nextTick()
    await nextTick()

    expect(form$.model).toEqual({ outer: { inner: { value: 'deep' } } })
    expect(onInnerChange).toHaveBeenCalledTimes(1)
    expect(onInnerChange.mock.calls[0][0]).toEqual({ value: 'deep' })
    expect(onOuterChange).toHaveBeenCalledTimes(1)
    expect(onOuterChange.mock.calls[0][0]).toEqual({ inner: { value: 'deep' } })
  })
})

// =============================================================================
// LIST MUTATIONS (index-keyed children, data moves underneath)
// =============================================================================
describe('list child model sync', () => {
  it('should keep editing the correct slot and fire change after a sort', async () => {
    const onFormChange = vi.fn()
    const onListChange = vi.fn()

    const { form$, form, list } = createForm({
      onChange: onFormChange,
      schema: defineSchema({
        list: {
          type: 'list',
          modelValue: ['a', 'b', 'c'],
          flat: true,
          onChange: onListChange,
          schema: {
            text: { type: 'text' },
          },
        },
      }),
    })

    expect(form$.model).toEqual({ list: ['a', 'b', 'c'] })

    list.sort(0, 2)
    await nextTick()
    await nextTick()

    expect(form$.model).toEqual({ list: ['b', 'c', 'a'] })
    expect(onListChange).toHaveBeenCalled()
    expect(onFormChange).toHaveBeenCalled()

    onListChange.mockClear()
    onFormChange.mockClear()

    const item0 = form
      .findAllComponents({ name: 'VfText' })
      .find(({ vm }: any) => vm.path === 'list.0')!.vm

    item0.update('B')
    await nextTick()
    await nextTick()

    expect(form$.model).toEqual({ list: ['B', 'c', 'a'] })
    expect(onListChange).toHaveBeenCalledTimes(1)
    expect(onListChange.mock.calls[0][0]).toEqual(['B', 'c', 'a'])
    expect(onFormChange).toHaveBeenCalledTimes(1)
  })

  it('should fire change and keep slots correct after add and remove', async () => {
    const onListChange = vi.fn()

    const { form$, form, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          modelValue: ['a', 'b'],
          flat: true,
          onChange: onListChange,
          schema: {
            text: { type: 'text' },
          },
        },
      }),
    })

    expect(form$.model).toEqual({ list: ['a', 'b'] })

    await list.add()
    await nextTick()
    await nextTick()

    expect(form$.model).toEqual({ list: ['a', 'b', null] })

    onListChange.mockClear()

    const item2 = form
      .findAllComponents({ name: 'VfText' })
      .find(({ vm }: any) => vm.path === 'list.2')!.vm

    item2.update('c')
    await nextTick()
    await nextTick()

    expect(form$.model).toEqual({ list: ['a', 'b', 'c'] })
    expect(onListChange).toHaveBeenCalledTimes(1)
    expect(onListChange.mock.calls[0][0]).toEqual(['a', 'b', 'c'])

    onListChange.mockClear()

    list.remove(0)
    await nextTick()
    await nextTick()

    expect(form$.model).toEqual({ list: ['b', 'c'] })
    expect(onListChange).toHaveBeenCalled()
  })
})

// =============================================================================
// LIST IDENTITY KEYING (per-instance state follows its data item across a sort)
// =============================================================================
describe('list identity-keyed state follows data after sort', () => {
  const itemAt = (form: any, path: string) =>
    form
      .findAllComponents({ name: 'VfText' })
      .find(({ vm }: any) => vm.path === path)!.vm

  it('keeps the message bag and dirty state with the data item, not the slot', async () => {
    const { form$, form, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          modelValue: ['a', 'b', 'c'],
          flat: true,
          schema: {
            text: { type: 'text' },
          },
        },
      }),
    })

    expect(form$.model).toEqual({ list: ['a', 'b', 'c'] })

    // Tag the item currently at list.0 (value 'a'): edit it (→ dirty) and pin a
    // custom error on its instance message bag.
    const tagged = itemAt(form, 'list.0')
    tagged.update('A')
    await nextTick()
    await nextTick()
    tagged.messageBag.append('boom', 'error')

    expect(itemAt(form, 'list.0').dirty).toBe(true)
    expect(itemAt(form, 'list.0').errors).toContain('boom')

    // Move the tagged item from data index 0 to data index 2.
    list.sort(0, 2)
    await nextTick()
    await nextTick()

    expect(form$.model).toEqual({ list: ['b', 'c', 'A'] })

    // The tagged item's per-instance state must have travelled to its new slot.
    const moved = itemAt(form, 'list.2')
    expect(moved.value).toBe('A')
    expect(moved.dirty).toBe(true)
    expect(moved.errors).toContain('boom')

    // The item now occupying the old slot is a clean, untagged neighbor.
    const slot0 = itemAt(form, 'list.0')
    expect(slot0.value).toBe('b')
    expect(slot0.dirty).toBe(false)
    expect(slot0.errors).not.toContain('boom')
  })

  it('does not fire spurious per-row change events on a pure reorder', async () => {
    const onItemChange = vi.fn()

    const { form$, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          modelValue: ['a', 'b', 'c'],
          flat: true,
          schema: {
            text: { type: 'text', onChange: onItemChange },
          },
        },
      }),
    })

    expect(form$.model).toEqual({ list: ['a', 'b', 'c'] })

    onItemChange.mockClear()

    // A pure reorder changes no row's value — only positions — so no row should
    // emit a `change` event.
    list.sort(0, 2)
    await nextTick()
    await nextTick()

    expect(form$.model).toEqual({ list: ['b', 'c', 'a'] })
    expect(onItemChange).not.toHaveBeenCalled()
  })
})

// =============================================================================
// MATRIX IDENTITY KEYING (per-row state follows its data row across a sort)
// =============================================================================
describe('matrix identity-keyed state follows data after sort', () => {
  const cellAt = (form: any, path: string) =>
    form
      .findAllComponents({ name: 'VfText' })
      .find(({ vm }: any) => vm.path === path)!.vm

  it('keeps a row cell message bag and dirty state with the data row, not the slot', async () => {
    const { form$, form, matrix } = createForm({
      schema: defineSchema({
        matrix: {
          type: 'matrix',
          cols: [
            { value: 'col_1', label: 'Col 1' },
            { value: 'col_2', label: 'Col 2' },
          ],
          rows: 3,
          modelValue: [
            { col_1: 'a', col_2: 'x' },
            { col_1: 'b', col_2: 'y' },
            { col_1: 'c', col_2: 'z' },
          ],
        },
      }),
    })

    expect(form$.model).toEqual({
      matrix: [
        { col_1: 'a', col_2: 'x' },
        { col_1: 'b', col_2: 'y' },
        { col_1: 'c', col_2: 'z' },
      ],
    })

    // Tag the col_1 cell of the row currently at matrix.0 (value 'a'): edit it
    // (→ dirty) and pin a custom error on its instance message bag.
    const tagged = cellAt(form, 'matrix.0.col_1')
    tagged.update('A')
    await nextTick()
    await nextTick()
    tagged.messageBag.append('boom', 'error')

    expect(cellAt(form, 'matrix.0.col_1').dirty).toBe(true)
    expect(cellAt(form, 'matrix.0.col_1').errors).toContain('boom')

    // Move the tagged row from data index 0 to data index 2.
    matrix.sort(0, 2)
    await nextTick()
    await nextTick()

    expect(form$.model).toEqual({
      matrix: [
        { col_1: 'b', col_2: 'y' },
        { col_1: 'c', col_2: 'z' },
        { col_1: 'A', col_2: 'x' },
      ],
    })

    // The tagged row's per-instance cell state must have travelled to its new
    // slot along with its data.
    const moved = cellAt(form, 'matrix.2.col_1')
    expect(moved.value).toBe('A')
    expect(moved.dirty).toBe(true)
    expect(moved.errors).toContain('boom')

    // The row now occupying the old slot is a clean, untagged neighbor.
    const slot0 = cellAt(form, 'matrix.0.col_1')
    expect(slot0.value).toBe('b')
    expect(slot0.dirty).toBe(false)
    expect(slot0.errors).not.toContain('boom')
  })
})
