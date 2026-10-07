import { defineSchema } from '@vueform/core'

import { createForm } from '../../helpers'

// =============================================================================
// PROPS
// =============================================================================
describe('VfGrid props', () => {
  describe('grid', () => {
    it('should render null as an empty cell', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [[null, { type: 'text', name: 'a' }]],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })
      const cell = grid.find('[data-row="0"][data-col="0"]')
      expect(cell.exists()).toBe(true)
      expect(cell.findComponent({ name: 'VfText' }).exists()).toBe(false)
      expect(cell.text()).toBe('')
    })

    it('should render a string as text content', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [['Hello', { type: 'text', name: 'a' }]],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })
      const cell = grid.find('[data-row="0"][data-col="0"]')
      expect(cell.exists()).toBe(true)
      expect(cell.text()).toBe('Hello')
    })

    it('should render an element schema as a component', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [[{ type: 'text', name: 'email' }]],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })
      const cell = grid.find('[data-row="0"][data-col="0"]')
      expect(cell.exists()).toBe(true)
      expect(cell.findComponent({ name: 'VfText' }).exists()).toBe(true)
    })

    it('should span 2 columns when colspan is 2', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [
              [
                { type: 'text', name: 'a' },
                { type: 'text', name: 'b' },
              ],
              [{ type: 'textarea', name: 'c', colspan: 2 }],
            ],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })
      const cell = grid.find('[data-row="1"][data-col="0"]')
      expect(cell.attributes('data-col-start')).toBe('0')
      expect(cell.attributes('data-col-end')).toBe('1')
    })

    it('should span 2 rows when rowspan is 2', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [
              [
                { type: 'text', name: 'a', rowspan: 2 },
                { type: 'text', name: 'b' },
              ],
              [{ type: 'text', name: 'c' }],
            ],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })
      const cell = grid.find('[data-row="0"][data-col="0"]')
      expect(cell.attributes('data-row-start')).toBe('0')
      expect(cell.attributes('data-row-end')).toBe('1')
    })

    it('should apply center alignment class', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [[{ type: 'text', name: 'centered', align: 'center' }]],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })
      const cell = grid.find('[data-row="0"][data-col="0"]')
      expect(cell.classes()).toContain('vf-center')
    })

    it('should apply top vertical alignment class', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [[{ type: 'text', name: 'topped', valign: 'top' }]],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })
      const cell = grid.find('[data-row="0"][data-col="0"]')
      expect(cell.classes()).toContain('vf-top')
    })

    it('should render text content with colspan', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [
              [
                { type: 'text', name: 'a' },
                { type: 'text', name: 'b' },
              ],
              [{ content: 'Header', colspan: 2 }],
            ],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })
      const cell = grid.find('[data-row="1"][data-col="0"]')
      expect(cell.text()).toBe('Header')
      expect(cell.attributes('data-col-start')).toBe('0')
      expect(cell.attributes('data-col-end')).toBe('1')
    })

    it('should render text content with alignment', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [[{ content: 'Right', align: 'right' }]],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })
      const cell = grid.find('[data-row="0"][data-col="0"]')
      expect(cell.text()).toBe('Right')
      expect(cell.classes()).toContain('vf-right')
    })

    it('should render empty cell with colspan', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [
              [
                { type: 'text', name: 'a' },
                { type: 'text', name: 'b' },
              ],
              [{ colspan: 2 }],
            ],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })
      const cell = grid.find('[data-row="1"][data-col="0"]')
      expect(cell.text()).toBe('')
      expect(cell.attributes('data-col-start')).toBe('0')
      expect(cell.attributes('data-col-end')).toBe('1')
    })

    it('should handle a mixed grid with all cell types', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [
              [
                { content: 'Name', align: 'center' },
                { content: 'Email', align: 'center' },
              ],
              [
                { type: 'text', name: 'name' },
                { type: 'text', name: 'email' },
              ],
              [{ type: 'textarea', name: 'bio', colspan: 2, valign: 'top' }],
              [null, 'Footer text'],
            ],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })

      const header0 = grid.find('[data-row="0"][data-col="0"]')
      expect(header0.text()).toBe('Name')
      expect(header0.classes()).toContain('vf-center')

      const header1 = grid.find('[data-row="0"][data-col="1"]')
      expect(header1.text()).toBe('Email')

      const nameCell = grid.find('[data-row="1"][data-col="0"]')
      expect(nameCell.findComponent({ name: 'VfText' }).exists()).toBe(true)

      const bioCell = grid.find('[data-row="2"][data-col="0"]')
      expect(bioCell.attributes('data-col-end')).toBe('1')
      expect(bioCell.classes()).toContain('vf-top')

      const emptyCell = grid.find('[data-row="3"][data-col="0"]')
      expect(emptyCell.text()).toBe('')

      const footerCell = grid.find('[data-row="3"][data-col="1"]')
      expect(footerCell.text()).toBe('Footer text')
    })

    it('should apply default left alignment when no align is specified', () => {
      const { form } = createForm({
        schema: defineSchema({
          myGrid: {
            type: 'grid',
            grid: [[{ type: 'text', name: 'a' }]],
          },
        }),
      })

      const grid = form.findComponent({ name: 'VfGrid' })
      const cell = grid.find('[data-row="0"][data-col="0"]')
      expect(cell.classes()).toContain('vf-left')
      expect(cell.classes()).toContain('vf-baseline')
    })
  })
})
