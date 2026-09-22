import { defineSchema } from '@vueform/core'
import defaultConfig from '@/config'
import { createForm } from '../helpers'

describe('Semantic icons', () => {
  it('renders pi icons on list controls', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          list: {
            type: 'list',
            flat: true,
            sort: true,
            schema: {
              text: {
                type: 'input-text',
              },
            },
          },
        }),
      },
      {
        icon: defaultConfig.icon,
        icons: defaultConfig.icons,
      }
    )

    expect(form.find('.pi-bars').exists()).toBe(true)
    expect(form.find('.pi-times').exists()).toBe(true)
    expect(form.find('.pi-plus').exists()).toBe(true)
  })

  it('renders label instead of icon when addLabel is set', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          list: {
            type: 'list',
            flat: true,
            addLabel: 'Add row',
            addIcon: '',
            schema: {
              text: {
                type: 'input-text',
              },
            },
          },
        }),
      },
      {
        icon: defaultConfig.icon,
        icons: defaultConfig.icons,
      }
    )

    expect(form.find('.pi-plus').exists()).toBe(false)
    const buttons = form.findAll('[data-pc-name="button"]')
    const addButton = buttons[buttons.length - 1]
    expect(addButton.text()).toContain('Add row')
  })
})
