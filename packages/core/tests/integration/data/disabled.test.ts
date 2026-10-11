import { defineSchema } from '@vueform/core'
import { nextTick, ref } from 'vue'

import { createForm } from '../../helpers'

describe('Disabled', () => {
  describe('element level', () => {
    it('should disable element via prop', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          text: { type: 'text', disabled: true },
        }),
      })

      expect(form$.find('text').disabled).toBe(true)
    })

    it('should not disable element when prop is false', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          text: { type: 'text', disabled: false },
        }),
      })

      expect(form$.find('text').disabled).toBe(false)
    })

    it('should react to disabled prop changes', async () => {
      const schema = ref(
        defineSchema({
          text: { type: 'text', disabled: false },
        })
      ) as any

      const { form$ } = createForm({ schema })

      expect(form$.find('text').disabled).toBe(false)

      schema.value.text.disabled = true
      await nextTick()
      expect(form$.find('text').disabled).toBe(true)

      schema.value.text.disabled = false
      await nextTick()
      expect(form$.find('text').disabled).toBe(false)
    })
  })

  describe('form level', () => {
    it('should disable all elements when form is disabled', () => {
      const { form$ } = createForm({
        disabled: true,
        schema: defineSchema({
          text: { type: 'text' },
          text2: { type: 'text' },
        }),
      })

      expect(form$.disabled).toBe(true)
      expect(form$.find('text').disabled).toBe(true)
      expect(form$.find('text2').disabled).toBe(true)
    })

    it('should not disable elements when form is not disabled', () => {
      const { form$ } = createForm({
        disabled: false,
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      expect(form$.disabled).toBe(false)
      expect(form$.find('text').disabled).toBe(false)
    })

    it('should disable elements inside a group when form is disabled', () => {
      const { form$ } = createForm({
        disabled: true,
        schema: defineSchema({
          group: {
            type: 'group',
            schema: {
              text: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.find('group').disabled).toBe(true)
      expect(form$.find('group.text').disabled).toBe(true)
    })

    it('should disable elements inside a list when form is disabled', () => {
      const { form$ } = createForm({
        disabled: true,
        schema: defineSchema({
          list: {
            type: 'list',
            initial: 1,
            schema: {
              text: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.find('list').disabled).toBe(true)
      expect(form$.find('list.0.text').disabled).toBe(true)
    })

    it('should disable elements inside a matrix when form is disabled', () => {
      const { form$ } = createForm({
        disabled: true,
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rows: [{ value: 'row_1', label: 'Row 1' }],
            cols: [{ value: 'col_1', label: 'Col 1' }],
          },
        }),
      })

      expect(form$.find('matrix').disabled).toBe(true)
      expect(form$.find('matrix.row_1').disabled).toBe(true)
      expect(form$.find('matrix.row_1.col_1').disabled).toBe(true)
    })

    it('should react to form disabled ref changes', async () => {
      const disabled = ref(false)

      const { form$ } = createForm({
        disabled,
        schema: defineSchema({
          group: {
            type: 'group',
            schema: {
              text: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.disabled).toBe(false)
      expect(form$.find('group').disabled).toBe(false)
      expect(form$.find('group.text').disabled).toBe(false)

      disabled.value = true
      await nextTick()
      expect(form$.disabled).toBe(true)
      expect(form$.find('group').disabled).toBe(true)
      expect(form$.find('group.text').disabled).toBe(true)

      disabled.value = false
      await nextTick()
      expect(form$.disabled).toBe(false)
      expect(form$.find('group').disabled).toBe(false)
      expect(form$.find('group.text').disabled).toBe(false)
    })
  })

  describe('cascading through group', () => {
    it('should disable children when group is disabled', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          group: {
            type: 'group',
            disabled: true,
            schema: {
              text: { type: 'text' },
              text2: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.find('group').disabled).toBe(true)
      expect(form$.find('group.text').disabled).toBe(true)
      expect(form$.find('group.text2').disabled).toBe(true)
    })

    it('should not disable children when group is not disabled', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          group: {
            type: 'group',
            schema: {
              text: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.find('group').disabled).toBe(false)
      expect(form$.find('group.text').disabled).toBe(false)
    })

    it('should disable children in nested groups', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          outer: {
            type: 'group',
            disabled: true,
            schema: {
              inner: {
                type: 'group',
                schema: {
                  text: { type: 'text' },
                },
              },
            },
          },
        }),
      })

      expect(form$.find('outer').disabled).toBe(true)
      expect(form$.find('outer.inner').disabled).toBe(true)
      expect(form$.find('outer.inner.text').disabled).toBe(true)
    })

    it('should disable children when inner group is disabled but outer is not', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          outer: {
            type: 'group',
            schema: {
              inner: {
                type: 'group',
                disabled: true,
                schema: {
                  text: { type: 'text' },
                },
              },
              sibling: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.find('outer').disabled).toBe(false)
      expect(form$.find('outer.inner').disabled).toBe(true)
      expect(form$.find('outer.inner.text').disabled).toBe(true)
      expect(form$.find('outer.sibling').disabled).toBe(false)
    })

    it('should react to group disabled prop changes', async () => {
      const schema = ref(
        defineSchema({
          group: {
            type: 'group',
            disabled: false,
            schema: {
              text: { type: 'text' },
            },
          },
        })
      ) as any

      const { form$ } = createForm({ schema })

      expect(form$.find('group').disabled).toBe(false)
      expect(form$.find('group.text').disabled).toBe(false)

      schema.value.group.disabled = true
      await nextTick()
      expect(form$.find('group').disabled).toBe(true)
      expect(form$.find('group.text').disabled).toBe(true)

      schema.value.group.disabled = false
      await nextTick()
      expect(form$.find('group').disabled).toBe(false)
      expect(form$.find('group.text').disabled).toBe(false)
    })
  })

  describe('cascading through list', () => {
    it('should disable children when list is disabled', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            disabled: true,
            initial: 1,
            schema: {
              text: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.find('list').disabled).toBe(true)
      expect(form$.find('list.0.text').disabled).toBe(true)
    })

    it('should not disable children when list is not disabled', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            initial: 1,
            schema: {
              text: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.find('list').disabled).toBe(false)
      expect(form$.find('list.0.text').disabled).toBe(false)
    })

    it('should disable all items in a multi-item list', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            disabled: true,
            initial: 3,
            schema: {
              text: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.find('list').disabled).toBe(true)
      expect(form$.find('list.0.text').disabled).toBe(true)
      expect(form$.find('list.1.text').disabled).toBe(true)
      expect(form$.find('list.2.text').disabled).toBe(true)
    })

    it('should react to list disabled prop changes', async () => {
      const schema = ref(
        defineSchema({
          list: {
            type: 'list',
            disabled: false,
            initial: 1,
            schema: {
              text: { type: 'text' },
            },
          },
        })
      ) as any

      const { form$ } = createForm({ schema })

      expect(form$.find('list').disabled).toBe(false)
      expect(form$.find('list.0.text').disabled).toBe(false)

      schema.value.list.disabled = true
      await nextTick()
      expect(form$.find('list').disabled).toBe(true)
      expect(form$.find('list.0.text').disabled).toBe(true)

      schema.value.list.disabled = false
      await nextTick()
      expect(form$.find('list').disabled).toBe(false)
      expect(form$.find('list.0.text').disabled).toBe(false)
    })
  })

  describe('cascading through matrix', () => {
    it('should disable row elements when matrix is disabled', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            disabled: true,
            rows: [{ value: 'row_1', label: 'Row 1' }],
            cols: [
              { value: 'col_1', label: 'Col 1' },
              { value: 'col_2', label: 'Col 2' },
            ],
          },
        }),
      })

      expect(form$.find('matrix').disabled).toBe(true)
      expect(form$.find('matrix.row_1').disabled).toBe(true)
      expect(form$.find('matrix.row_1.col_1').disabled).toBe(true)
      expect(form$.find('matrix.row_1.col_2').disabled).toBe(true)
    })

    it('should not disable row elements when matrix is not disabled', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          matrix: {
            type: 'matrix',
            rows: [{ value: 'row_1', label: 'Row 1' }],
            cols: [{ value: 'col_1', label: 'Col 1' }],
          },
        }),
      })

      expect(form$.find('matrix').disabled).toBe(false)
      expect(form$.find('matrix.row_1').disabled).toBe(false)
      expect(form$.find('matrix.row_1.col_1').disabled).toBe(false)
    })
  })

  describe('cascading through grid', () => {
    it('should disable children when grid is disabled', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          grid: {
            type: 'grid',
            disabled: true,
            grid: [[{ type: 'text', name: 'cell' }]],
          },
        }),
      })

      expect(form$.find('grid').disabled).toBe(true)
      expect(form$.find('grid.cell').disabled).toBe(true)
    })

    it('should not disable children when grid is not disabled', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          grid: {
            type: 'grid',
            grid: [[{ type: 'text', name: 'cell' }]],
          },
        }),
      })

      expect(form$.find('grid').disabled).toBe(false)
      expect(form$.find('grid.cell').disabled).toBe(false)
    })
  })

  describe('multi-level nesting', () => {
    it('should cascade disabled through group > group > element', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          level1: {
            type: 'group',
            disabled: true,
            schema: {
              level2: {
                type: 'group',
                schema: {
                  text: { type: 'text' },
                },
              },
            },
          },
        }),
      })

      expect(form$.find('level1').disabled).toBe(true)
      expect(form$.find('level1.level2').disabled).toBe(true)
      expect(form$.find('level1.level2.text').disabled).toBe(true)
    })

    it('should cascade disabled through group > list > element', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          group: {
            type: 'group',
            disabled: true,
            schema: {
              list: {
                type: 'list',
                initial: 1,
                schema: {
                  text: { type: 'text' },
                },
              },
            },
          },
        }),
      })

      expect(form$.find('group').disabled).toBe(true)
      expect(form$.find('group.list').disabled).toBe(true)
      expect(form$.find('group.list.0.text').disabled).toBe(true)
    })

    it('should cascade disabled through list > group > element', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            disabled: true,
            initial: 1,
            schema: {
              group: {
                type: 'group',
                schema: {
                  text: { type: 'text' },
                },
              },
            },
          },
        }),
      })

      expect(form$.find('list').disabled).toBe(true)
      expect(form$.find('list.0.group').disabled).toBe(true)
      expect(form$.find('list.0.group.text').disabled).toBe(true)
    })

    it('should cascade disabled through group > matrix > row > cell', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          group: {
            type: 'group',
            disabled: true,
            schema: {
              matrix: {
                type: 'matrix',
                rows: [{ value: 'r1', label: 'R1' }],
                cols: [{ value: 'c1', label: 'C1' }],
              },
            },
          },
        }),
      })

      expect(form$.find('group').disabled).toBe(true)
      expect(form$.find('group.matrix').disabled).toBe(true)
      expect(form$.find('group.matrix.r1').disabled).toBe(true)
      expect(form$.find('group.matrix.r1.c1').disabled).toBe(true)
    })

    it('should cascade disabled through group > grid > element', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          group: {
            type: 'group',
            disabled: true,
            schema: {
              grid: {
                type: 'grid',
                grid: [[{ type: 'text', name: 'cell' }]],
              },
            },
          },
        }),
      })

      expect(form$.find('group').disabled).toBe(true)
      expect(form$.find('group.grid').disabled).toBe(true)
      expect(form$.find('group.grid.cell').disabled).toBe(true)
    })

    it('should cascade disabled through list > list > element', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          list: {
            type: 'list',
            disabled: true,
            initial: 1,
            flat: true,
            schema: {
              inner: {
                type: 'list',
                initial: 1,
                flat: true,
                schema: {
                  text: {
                    type: 'text',
                  },
                },
              },
            },
          },
        }),
      })

      expect(form$.find('list').disabled).toBe(true)
      expect(form$.find('list.0').disabled).toBe(true)
      expect(form$.find('list.0.0').disabled).toBe(true)
    })

    it('should cascade disabled through group > group > group > element', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          l1: {
            type: 'group',
            disabled: true,
            schema: {
              l2: {
                type: 'group',
                schema: {
                  l3: {
                    type: 'group',
                    schema: {
                      text: { type: 'text' },
                    },
                  },
                },
              },
            },
          },
        }),
      })

      expect(form$.find('l1').disabled).toBe(true)
      expect(form$.find('l1.l2').disabled).toBe(true)
      expect(form$.find('l1.l2.l3').disabled).toBe(true)
      expect(form$.find('l1.l2.l3.text').disabled).toBe(true)
    })

    it('should only disable subtree when mid-level container is disabled', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          outer: {
            type: 'group',
            schema: {
              inner: {
                type: 'group',
                disabled: true,
                schema: {
                  text: { type: 'text' },
                },
              },
              sibling: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.find('outer').disabled).toBe(false)
      expect(form$.find('outer.inner').disabled).toBe(true)
      expect(form$.find('outer.inner.text').disabled).toBe(true)
      expect(form$.find('outer.sibling').disabled).toBe(false)
    })

    it('should cascade form disabled through all container types', () => {
      const { form$ } = createForm({
        disabled: true,
        schema: defineSchema({
          group: {
            type: 'group',
            schema: {
              list: {
                type: 'list',
                initial: 1,
                schema: {
                  text: { type: 'text' },
                },
              },
              matrix: {
                type: 'matrix',
                rows: [{ value: 'r1', label: 'R1' }],
                cols: [{ value: 'c1', label: 'C1' }],
              },
              grid: {
                type: 'grid',
                grid: [[{ type: 'text', name: 'cell' }]],
              },
            },
          },
        }),
      })

      expect(form$.disabled).toBe(true)
      expect(form$.find('group').disabled).toBe(true)
      expect(form$.find('group.list').disabled).toBe(true)
      expect(form$.find('group.list.0.text').disabled).toBe(true)
      expect(form$.find('group.matrix').disabled).toBe(true)
      expect(form$.find('group.matrix.r1').disabled).toBe(true)
      expect(form$.find('group.matrix.r1.c1').disabled).toBe(true)
      expect(form$.find('group.grid').disabled).toBe(true)
      expect(form$.find('group.grid.cell').disabled).toBe(true)
    })
  })

  describe('programmatic enable / disable', () => {
    it('should disable element via disable()', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      expect(form$.find('text').disabled).toBe(false)

      form$.find('text').disable()
      expect(form$.find('text').disabled).toBe(true)
    })

    it('should enable element after disable()', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      form$.find('text').disable()
      expect(form$.find('text').disabled).toBe(true)

      form$.find('text').enable()
      expect(form$.find('text').disabled).toBe(false)
    })

    it('should not override form-level disabled via enable()', () => {
      const { form$ } = createForm({
        disabled: true,
        schema: defineSchema({
          text: { type: 'text' },
        }),
      })

      expect(form$.find('text').disabled).toBe(true)

      form$.find('text').enable()
      expect(form$.find('text').disabled).toBe(true)
    })

    it('should not override container-level disabled via enable()', () => {
      const { form$ } = createForm({
        schema: defineSchema({
          group: {
            type: 'group',
            disabled: true,
            schema: {
              text: { type: 'text' },
            },
          },
        }),
      })

      expect(form$.find('group.text').disabled).toBe(true)

      form$.find('group.text').enable()
      expect(form$.find('group.text').disabled).toBe(true)
    })
  })
})
