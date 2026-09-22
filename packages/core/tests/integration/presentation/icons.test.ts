import { defineSchema } from '@vueform/core'
import { createForm } from '../../helpers'

describe('Semantic icons', () => {
  it('renders mask icon classes on list controls', async () => {
    const { form } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          flat: true,
          sort: true,
          schema: {
            text: {
              type: 'text',
            },
          },
        },
      }),
    })

    const sort = form.find('.vf-list-sort')
    expect(sort.find('i.vf-btn-icon.vf-icon-sort').exists()).toBe(true)

    const remove = form.find('.vf-list-remove')
    expect(remove.find('i.vf-btn-icon.vf-icon-remove').exists()).toBe(true)

    const add = form.find('.vf-list-add')
    expect(add.find('i.vf-btn-icon.vf-icon-add').exists()).toBe(true)
    expect(add.find('.vf-btn-text').exists()).toBe(false)
  })

  it('renders text next of icon when addLabel is set', async () => {
    const { form } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          flat: true,
          addLabel: 'Add row',
          schema: {
            text: {
              type: 'text',
            },
          },
        },
      }),
    })

    const add = form.find('.vf-list-add')
    expect(add.find('i.vf-btn-icon').exists()).toBe(true)
    expect(add.find('.vf-btn-text').text()).toBe('Add row')
  })

  it('renders remove icon on file items', async () => {
    const { form } = createForm({
      schema: defineSchema({
        file: {
          type: 'file',
          modelValue: ['file.txt'],
        },
      }),
    })

    const remove = form.find('.vf-file-remove')
    expect(remove.exists()).toBe(true)
    expect(remove.find('i.vf-btn-icon.vf-icon-remove').exists()).toBe(true)
  })

  it('resolves $-prefixed names through the icons map on VfButton', async () => {
    const { form } = createForm({
      schema: defineSchema({
        btn: {
          type: 'button',
          text: 'Click',
          icon: '$add',
        },
      }),
    })

    expect(form.find('.vf-btn i.vf-icon-add').exists()).toBe(true)
  })
})
