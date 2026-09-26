import { nextTick } from 'vue'
import { createForm, makeApp, mountApp } from '../../helpers'
import { defineSchema, defineSlot } from '#core'

// =============================================================================
// SLOTS (inline)
// =============================================================================
describe('VfSelect slots (inline)', () => {
  describe('option slot', () => {
    it('should replace option labels with slot content', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfSelect name="el" :items="{ a: 'Alpha', b: 'Beta' }">
            <template #option="{ item }">
              Custom: {{ item.label }}
            </template>
          </VfSelect>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      const options = app.findAll('option')
      expect(options).toHaveLength(2)
      expect(options[0].text()).toBe('Custom: Alpha')
      expect(options[1].text()).toBe('Custom: Beta')
      expect(options[0].attributes('value')).toBe('a')
      expect(options[1].attributes('value')).toBe('b')
    })

    it('should expose the resolved item to the slot', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfSelect
            name="el"
            :items="[{ id: 1, name: 'One', extra: 'x' }]"
            item-value="id"
            item-label="name"
          >
            <template #option="{ item }">
              {{ item.value }}-{{ item.label }}-{{ item.$raw.extra }}
            </template>
          </VfSelect>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      expect(app.find('option').text()).toBe('1-One-x')
    })

    it('should customize options inside groups', async () => {
      const App = makeApp(
        `<VfForm ref="form$">
          <VfSelect
            name="el"
            group-label="label"
            group-children="items"
            :items="[
              { label: 'Fruits', items: { a: 'Apple', b: 'Banana' } },
              { label: 'Veggies', items: { c: 'Carrot' } },
            ]"
          >
            <template #option="{ item }">
              #{{ item.label }}
            </template>
          </VfSelect>
        </VfForm>`
      )

      const app = mountApp(App)
      await nextTick()

      const groups = app.findAll('optgroup')
      expect(groups).toHaveLength(2)
      expect(groups[0].attributes('label')).toBe('Fruits')
      expect(groups[1].attributes('label')).toBe('Veggies')

      const options = app.findAll('option')
      expect(options.map((o) => o.text())).toEqual([
        '#Apple',
        '#Banana',
        '#Carrot',
      ])
    })
  })
})

// =============================================================================
// SLOTS (prop-based via defineSlot)
// =============================================================================
describe('VfSelect slots (prop)', () => {
  describe('option slot via slots prop', () => {
    it('should replace option labels via slots prop', async () => {
      const option = defineSlot('VfSelect.option', {
        props: ['item'],
        template:
          '<span class="slot-option">{{ item.label }} ({{ item.value }})</span>',
      })

      const { form } = createForm({
        schema: defineSchema({
          el: {
            type: 'select',
            items: { a: 'Alpha', b: 'Beta' },
            slots: { option },
          },
        }),
      })

      await nextTick()
      const options = form.findAll('.slot-option')
      expect(options).toHaveLength(2)
      expect(options[0].text()).toBe('Alpha (a)')
      expect(options[1].text()).toBe('Beta (b)')
    })
  })
})
