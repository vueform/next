import { flushPromises } from '@vue/test-utils'

import { defineSchema } from '#core'

import { createForm } from '../../helpers'

describe('required', () => {
  describe('text', () => {
    it('should pass for non-empty string', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required', default: 'hello' },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail for empty string', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required' },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after updating from empty to filled', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required' },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      field.update('filled')
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail after updating from filled to empty', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required', default: 'content' },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)

      field.update('')
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should fail for null', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'text', rules: 'required', default: null },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })
  })

  describe('text (translate: true)', () => {
    it('should pass when all languages are filled', async () => {
      const { field } = createForm(
        {
          schema: defineSchema({
            field: {
              type: 'text',
              rules: 'required',
              translate: true,
              default: { en: 'hello', de: 'hallo' },
            },
          }),
        },
        { languages: { en: 'English', de: 'German' } }
      )
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when all languages are empty', async () => {
      const { field } = createForm(
        {
          schema: defineSchema({
            field: { type: 'text', rules: 'required', translate: true },
          }),
        },
        { languages: { en: 'English', de: 'German' } }
      )
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should fail when some languages are empty', async () => {
      const { field } = createForm(
        {
          schema: defineSchema({
            field: {
              type: 'text',
              rules: 'required',
              translate: true,
              default: { en: 'hello' },
            },
          }),
        },
        { languages: { en: 'English', de: 'German' } }
      )
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after filling all languages', async () => {
      const { field } = createForm(
        {
          schema: defineSchema({
            field: { type: 'text', rules: 'required', translate: true },
          }),
        },
        { languages: { en: 'English', de: 'German' } }
      )
      await field.validate()
      expect(field.invalid).toBe(true)

      field.update({ en: 'hello', de: 'hallo' })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail after clearing a language', async () => {
      const { field } = createForm(
        {
          schema: defineSchema({
            field: {
              type: 'text',
              rules: 'required',
              translate: true,
              default: { en: 'hello', de: 'hallo' },
            },
          }),
        },
        { languages: { en: 'English', de: 'German' } }
      )
      await field.validate()
      expect(field.invalid).toBe(false)

      field.update({ en: 'hello', de: '' })
      await field.validate()
      expect(field.invalid).toBe(true)
    })
  })

  describe('checkbox', () => {
    it('should pass when checked (true)', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'checkbox', rules: 'required', default: true },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when unchecked (false)', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'checkbox', rules: 'required' },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after checking', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'checkbox', rules: 'required' },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      field.update(true)
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail after unchecking', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'checkbox', rules: 'required', default: true },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)

      field.update(false)
      await field.validate()
      expect(field.invalid).toBe(true)
    })
  })

  describe('checkboxes', () => {
    it('should pass when at least one option is selected', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'checkboxes',
            rules: 'required',
            items: ['a', 'b', 'c'],
            default: ['a'],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when no options are selected', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'checkboxes',
            rules: 'required',
            items: ['a', 'b', 'c'],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after selecting an option', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'checkboxes',
            rules: 'required',
            items: ['a', 'b', 'c'],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      field.update(['b'])
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail after deselecting all options', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'checkboxes',
            rules: 'required',
            items: ['a', 'b', 'c'],
            default: ['a', 'b'],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)

      field.update([])
      await field.validate()
      expect(field.invalid).toBe(true)
    })
  })

  describe('radios', () => {
    it('should pass when an option is selected', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'radios',
            rules: 'required',
            items: ['a', 'b', 'c'],
            default: 'a',
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when no option is selected', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'radios',
            rules: 'required',
            items: ['a', 'b', 'c'],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after selecting an option', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'radios',
            rules: 'required',
            items: ['a', 'b', 'c'],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      field.update('b')
      await field.validate()
      expect(field.invalid).toBe(false)
    })
  })

  describe('file (single)', () => {
    it('should pass when a file is set', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'file',
            rules: 'required',
            default: new File(['content'], 'test.txt'),
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when no file is set', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'file', rules: 'required' },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after setting a file', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'file', rules: 'required' },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      field.update(new File(['content'], 'test.txt'))
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail after removing the file', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'file',
            rules: 'required',
            default: new File(['content'], 'test.txt'),
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)

      field.update(null)
      await field.validate()
      expect(field.invalid).toBe(true)
    })
  })

  describe('file (multi)', () => {
    it('should pass when files are set', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'file',
            rules: 'required',
            multiple: true,
            default: [new File(['a'], 'a.txt')],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when file array is empty', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'file', rules: 'required', multiple: true },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after adding a file', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: { type: 'file', rules: 'required', multiple: true },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      field.update([new File(['a'], 'a.txt')])
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail after removing all files', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'file',
            rules: 'required',
            multiple: true,
            default: [new File(['a'], 'a.txt')],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)

      field.update([])
      await field.validate()
      expect(field.invalid).toBe(true)
    })
  })

  describe('select (single)', () => {
    it('should pass when an option is selected', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'select',
            rules: 'required',
            items: ['a', 'b', 'c'],
            default: 'a',
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when no option is selected', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'select',
            rules: 'required',
            items: ['a', 'b', 'c'],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after selecting an option', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'select',
            rules: 'required',
            items: ['a', 'b', 'c'],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      field.update('b')
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail after clearing selection', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'select',
            rules: 'required',
            items: ['a', 'b', 'c'],
            default: 'a',
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)

      field.update('')
      await field.validate()
      expect(field.invalid).toBe(true)
    })
  })

  describe('select (multi)', () => {
    it('should pass when at least one option is selected', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'select',
            rules: 'required',
            items: ['a', 'b', 'c'],
            multiple: true,
            default: ['a'],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when no options are selected', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'select',
            rules: 'required',
            items: ['a', 'b', 'c'],
            multiple: true,
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after selecting options', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'select',
            rules: 'required',
            items: ['a', 'b', 'c'],
            multiple: true,
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      field.update(['a', 'c'])
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail after deselecting all options', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'select',
            rules: 'required',
            items: ['a', 'b', 'c'],
            multiple: true,
            default: ['a'],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)

      field.update([])
      await field.validate()
      expect(field.invalid).toBe(true)
    })
  })

  describe('list (flat + single child)', () => {
    it('should pass when list has items', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'list',
            rules: 'required',
            flat: true,
            schema: {
              child: { type: 'text' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when list is empty', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'list',
            rules: 'required',
            flat: true,
            initial: 0,
            schema: {
              child: { type: 'text' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after adding an item', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'list',
            rules: 'required',
            flat: true,
            initial: 0,
            schema: {
              child: { type: 'text' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      field.update(['new'])
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail after removing all items', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'list',
            rules: 'required',
            flat: true,
            schema: {
              child: { type: 'text' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)

      field.remove(0)
      await field.validate()
      expect(field.invalid).toBe(true)
    })
  })

  describe('list (non-flat + multiple children)', () => {
    it('should pass when list has items', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'list',
            rules: 'required',
            schema: {
              name: { type: 'text' },
              email: { type: 'text' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when list is empty', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'list',
            rules: 'required',
            initial: 0,
            schema: {
              name: { type: 'text' },
              email: { type: 'text' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after adding an item', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'list',
            rules: 'required',
            initial: 0,
            schema: {
              name: { type: 'text' },
              email: { type: 'text' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      field.update([{ name: '', email: '' }])
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail after removing all items', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'list',
            rules: 'required',
            initial: 1,
            schema: {
              name: { type: 'text' },
              email: { type: 'text' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)

      field.remove(0)
      await field.validate()
      expect(field.invalid).toBe(true)
    })
  })

  describe('group', () => {
    it('should pass when all children are filled', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'group',
            rules: 'required',
            schema: {
              first: { type: 'text', default: 'John' },
              last: { type: 'text', default: 'Doe' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when all children are empty', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'group',
            rules: 'required',
            schema: {
              first: { type: 'text' },
              last: { type: 'text' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should fail when any child is empty', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'group',
            rules: 'required',
            schema: {
              first: { type: 'text', default: 'John' },
              last: { type: 'text' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after filling all children', async () => {
      const { form$, field } = createForm({
        schema: defineSchema({
          field: {
            type: 'group',
            rules: 'required',
            schema: {
              first: { type: 'text' },
              last: { type: 'text' },
            },
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      form$.find('field.first').update('John')
      form$.find('field.last').update('Doe')
      await field.validate()
      expect(field.invalid).toBe(false)
    })
  })

  describe('grid', () => {
    it('should pass when all grid children are filled', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'grid',
            rules: 'required',
            grid: [
              [
                { type: 'text', name: 'a', default: 'hello' },
                { type: 'text', name: 'b', default: 'world' },
              ],
            ],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(false)
    })

    it('should fail when all grid children are empty', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'grid',
            rules: 'required',
            grid: [
              [
                { type: 'text', name: 'a' },
                { type: 'text', name: 'b' },
              ],
            ],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should fail when any grid child is empty', async () => {
      const { field } = createForm({
        schema: defineSchema({
          field: {
            type: 'grid',
            rules: 'required',
            grid: [
              [
                { type: 'text', name: 'a', default: 'hello' },
                { type: 'text', name: 'b' },
              ],
            ],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)
    })

    it('should pass after filling all grid children', async () => {
      const { form$, field } = createForm({
        schema: defineSchema({
          field: {
            type: 'grid',
            rules: 'required',
            grid: [
              [
                { type: 'text', name: 'a' },
                { type: 'text', name: 'b' },
              ],
            ],
          },
        }),
      })
      await field.validate()
      expect(field.invalid).toBe(true)

      form$.find('field.a').update('hello')
      form$.find('field.b').update('world')
      await field.validate()
      expect(field.invalid).toBe(false)
    })
  })

  describe('matrix (auto mode, non-dynamic rows)', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]
    const rows = [
      { value: 'row_1', label: 'Row 1' },
      { value: 'row_2', label: 'Row 2' },
    ]

    it('should pass when all cells are filled', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      matrix.update({
        row_1: { col_1: 'a', col_2: 'b' },
        row_2: { col_1: 'c', col_2: 'd' },
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })

    it('should fail when all cells are empty', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should fail when some cells are empty', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      matrix.update({
        row_1: { col_1: 'a', col_2: 'b' },
        row_2: { col_1: null, col_2: null },
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should pass after filling all cells', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)

      matrix.update({
        row_1: { col_1: 'a', col_2: 'b' },
        row_2: { col_1: 'c', col_2: 'd' },
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })
  })

  describe('matrix (auto mode, dynamic rows)', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]

    it('should pass when all cells are filled', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      matrix.update([
        { col_1: 'a', col_2: 'b' },
        { col_1: 'c', col_2: 'd' },
      ])
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })

    it('should fail when all cells are empty', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should fail when some cells are empty', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      matrix.update([
        { col_1: 'a', col_2: 'b' },
        { col_1: null, col_2: null },
      ])
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should pass after filling all cells', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)

      matrix.update([
        { col_1: 'a', col_2: 'b' },
        { col_1: 'c', col_2: 'd' },
      ])
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })

    it('should fail after removing all rows', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rules: 'required',
            cols,
            rows: 1,
          },
        }),
      })
      matrix.update([{ col_1: 'a', col_2: 'b' }])
      await matrix.validate()
      expect(matrix.invalid).toBe(false)

      matrix.remove(0)
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })
  })

  describe('matrix (single mode, non-dynamic rows)', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]
    const rows = [
      { value: 'row_1', label: 'Row 1' },
      { value: 'row_2', label: 'Row 2' },
    ]

    it('should pass when all rows have a selection', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'single',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      matrix.update({
        row_1: 'col_1',
        row_2: 'col_2',
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })

    it('should fail when no rows have a selection', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'single',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should fail when some rows have no selection', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'single',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      matrix.update({
        row_1: 'col_1',
        row_2: null,
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should pass after selecting all rows', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'single',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)

      matrix.update({
        row_1: 'col_1',
        row_2: 'col_2',
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })
  })

  describe('matrix (single mode, dynamic rows)', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]

    it('should pass when all rows have a selection', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'single',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      matrix.update(['col_1', 'col_2'])
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })

    it('should fail when no rows have a selection', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'single',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should fail when some rows have no selection', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'single',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      matrix.update(['col_1', null])
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should pass after selecting all rows', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'single',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)

      matrix.update(['col_1', 'col_2'])
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })

    it('should fail after removing all rows', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'single',
            rules: 'required',
            cols,
            rows: 1,
          },
        }),
      })
      matrix.update(['col_1'])
      await matrix.validate()
      expect(matrix.invalid).toBe(false)

      matrix.remove(0)
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })
  })

  describe('matrix (multiple mode, non-dynamic rows)', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]
    const rows = [
      { value: 'row_1', label: 'Row 1' },
      { value: 'row_2', label: 'Row 2' },
    ]

    it('should pass when all rows have selections', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'multiple',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      matrix.update({
        row_1: ['col_1'],
        row_2: ['col_1', 'col_2'],
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })

    it('should fail when no rows have selections', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'multiple',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should fail when some rows have no selections', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'multiple',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      matrix.update({
        row_1: ['col_1'],
        row_2: [],
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should pass after selecting in all rows', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'multiple',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)

      matrix.update({
        row_1: ['col_1'],
        row_2: ['col_2'],
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })
  })

  describe('matrix (multiple mode, dynamic rows)', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]

    it('should pass when all rows have selections', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'multiple',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      matrix.update([['col_1'], ['col_1', 'col_2']])
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })

    it('should fail when no rows have selections', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'multiple',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should fail when some rows have no selections', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'multiple',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      matrix.update([['col_1'], []])
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })

    it('should pass after selecting in all rows', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'multiple',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })
      await matrix.validate()
      expect(matrix.invalid).toBe(true)

      matrix.update([['col_1'], ['col_2']])
      await matrix.validate()
      expect(matrix.invalid).toBe(false)
    })

    it('should fail after removing all rows', async () => {
      const { matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'multiple',
            rules: 'required',
            cols,
            rows: 1,
          },
        }),
      })
      matrix.update([['col_1']])
      await matrix.validate()
      expect(matrix.invalid).toBe(false)

      matrix.remove(0)
      await matrix.validate()
      expect(matrix.invalid).toBe(true)
    })
  })

  describe('matrix (auto mode, non-dynamic rows) — revalidation', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]
    const rows = [
      { value: 'row_1', label: 'Row 1' },
      { value: 'row_2', label: 'Row 2' },
    ]

    it('should clear row and matrix errors after filling all text inputs', async () => {
      const { form$, matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })

      await matrix.validate()
      expect(matrix.invalid).toBe(true)
      expect(form$.find('matrix.row_1').invalid).toBe(true)
      expect(form$.find('matrix.row_2').invalid).toBe(true)

      form$.find('matrix.row_1.col_1').update('a')
      form$.find('matrix.row_1.col_2').update('b')
      form$.find('matrix.row_2.col_1').update('c')
      form$.find('matrix.row_2.col_2').update('d')
      await flushPromises()

      expect(form$.find('matrix.row_1').invalid).toBe(false)
      expect(form$.find('matrix.row_2').invalid).toBe(false)
      expect(matrix.invalid).toBe(false)
    })
  })

  describe('matrix (auto mode, dynamic rows) — revalidation', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]

    it('should clear row and matrix errors after filling all text inputs', async () => {
      const { form$, matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })

      await matrix.validate()
      expect(matrix.invalid).toBe(true)
      expect(form$.find('matrix.0').invalid).toBe(true)
      expect(form$.find('matrix.1').invalid).toBe(true)

      form$.find('matrix.0.col_1').update('a')
      form$.find('matrix.0.col_2').update('b')
      form$.find('matrix.1.col_1').update('c')
      form$.find('matrix.1.col_2').update('d')
      await flushPromises()

      expect(form$.find('matrix.0').invalid).toBe(false)
      expect(form$.find('matrix.1').invalid).toBe(false)
      expect(matrix.invalid).toBe(false)
    })
  })

  describe('matrix (single mode, non-dynamic rows) — revalidation', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]
    const rows = [
      { value: 'row_1', label: 'Row 1' },
      { value: 'row_2', label: 'Row 2' },
    ]

    it('should clear row and matrix errors after selecting one item per row', async () => {
      const { form$, matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'single',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })

      await matrix.validate()
      expect(matrix.invalid).toBe(true)
      expect(form$.find('matrix.row_1').invalid).toBe(true)
      expect(form$.find('matrix.row_2').invalid).toBe(true)

      form$.find('matrix.row_1').update('col_1')
      form$.find('matrix.row_2').update('col_2')
      await matrix.validate()
      await flushPromises()

      expect(form$.find('matrix.row_1').invalid).toBe(false)
      expect(form$.find('matrix.row_2').invalid).toBe(false)
      expect(matrix.invalid).toBe(false)
    })
  })

  describe('matrix (single mode, dynamic rows) — revalidation', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]

    it('should clear row and matrix errors after selecting one item per row', async () => {
      const { form$, matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'single',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })

      await matrix.validate()
      expect(matrix.invalid).toBe(true)
      expect(form$.find('matrix.0').invalid).toBe(true)
      expect(form$.find('matrix.1').invalid).toBe(true)

      form$.find('matrix.0').update('col_1')
      form$.find('matrix.1').update('col_2')
      await matrix.validate()
      await flushPromises()

      expect(form$.find('matrix.0').invalid).toBe(false)
      expect(form$.find('matrix.1').invalid).toBe(false)
      expect(matrix.invalid).toBe(false)
    })
  })

  describe('matrix (multiple mode, non-dynamic rows) — revalidation', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]
    const rows = [
      { value: 'row_1', label: 'Row 1' },
      { value: 'row_2', label: 'Row 2' },
    ]

    it('should clear row and matrix errors after selecting one item per row', async () => {
      const { form$, matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'multiple',
            rules: 'required',
            cols,
            rows,
          },
        }),
      })

      await matrix.validate()
      expect(matrix.invalid).toBe(true)
      expect(form$.find('matrix.row_1').invalid).toBe(true)
      expect(form$.find('matrix.row_2').invalid).toBe(true)

      form$.find('matrix.row_1').update(['col_1'])
      form$.find('matrix.row_2').update(['col_2'])
      await matrix.validate()
      await flushPromises()

      expect(form$.find('matrix.row_1').invalid).toBe(false)
      expect(form$.find('matrix.row_2').invalid).toBe(false)
      expect(matrix.invalid).toBe(false)
    })
  })

  describe('matrix (multiple mode, dynamic rows) — revalidation', () => {
    const cols = [
      { value: 'col_1', label: 'Col 1' },
      { value: 'col_2', label: 'Col 2' },
    ]

    it('should clear row and matrix errors after selecting one item per row', async () => {
      const { form$, matrix } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            mode: 'multiple',
            rules: 'required',
            cols,
            rows: 2,
          },
        }),
      })

      await matrix.validate()
      expect(matrix.invalid).toBe(true)
      expect(form$.find('matrix.0').invalid).toBe(true)
      expect(form$.find('matrix.1').invalid).toBe(true)

      form$.find('matrix.0').update(['col_1'])
      form$.find('matrix.1').update(['col_2'])
      await matrix.validate()
      await flushPromises()

      expect(form$.find('matrix.0').invalid).toBe(false)
      expect(form$.find('matrix.1').invalid).toBe(false)
      expect(matrix.invalid).toBe(false)
    })
  })
})
