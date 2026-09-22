import { defineSchema } from '@vueform/core'
import { nextTick } from 'vue'
import { createForm } from '../helpers'

describe('VfList', () => {
  it('should add', async () => {
    const { form$, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          flat: true,
          schema: {
            text: {
              type: 'text',
            },
          },
        },
      }),
    })

    expect(form$.model).toEqual({ list: [null] })

    await list.add()
    expect(form$.model).toEqual({ list: [null, null] })
  })

  it('should add multiple', async () => {
    const { form$, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          flat: true,
          schema: {
            text: {
              type: 'text',
            },
          },
        },
      }),
    })

    expect(form$.model).toEqual({ list: [null] })

    await list.add(3)
    expect(form$.model).toEqual({ list: [null, null, null, null] })
  })

  it('should remove', async () => {
    const { form$, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          flat: true,
          schema: {
            text: {
              type: 'text',
            },
          },
        },
      }),
    })

    expect(form$.model).toEqual({ list: [null] })
    list.remove()
    await nextTick()
    await nextTick()
    expect(form$.model).toEqual({ list: [] })
  })

  it('should remove by index', async () => {
    const { form$, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          modelValue: [1, 2, 3],
          flat: true,
          schema: {
            text: {
              type: 'text',
            },
          },
        },
      }),
    })

    expect(form$.model).toEqual({ list: [1, 2, 3] })
    list.remove(1)
    expect(form$.model).toEqual({ list: [1, 3] })
  })

  it('should sort list', async () => {
    const { form$, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          modelValue: [1, 2, 3, 4, 5],
          flat: true,
          schema: {
            text: {
              type: 'text',
            },
          },
        },
      }),
    })

    expect(form$.model).toEqual({ list: [1, 2, 3, 4, 5] })
    list.sort(3, 1)
    expect(form$.model).toEqual({ list: [1, 4, 2, 3, 5] })
    list.sort(1, 3)
    expect(form$.model).toEqual({ list: [1, 2, 3, 4, 5] })
  })

  it('should sort list > list', async () => {
    const { form$, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          modelValue: [
            [1, 2, 3],
            [4, 5],
          ],
          flat: true,
          schema: {
            list: {
              type: 'list',
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

    expect(form$.model).toEqual({
      list: [
        [1, 2, 3],
        [4, 5],
      ],
    })
    list.sort(1, 0)
    expect(form$.model).toEqual({
      list: [
        [4, 5],
        [1, 2, 3],
      ],
    })
    list.sort(0, 1)
    expect(form$.model).toEqual({
      list: [
        [1, 2, 3],
        [4, 5],
      ],
    })
  })

  it('should sort list > list > container', async () => {
    const { form$, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          modelValue: [
            [{ text: 1 }, { text: 2 }, { text: 3 }],
            [{ text: 4 }, { text: 5 }],
          ],
          flat: true,
          schema: {
            list: {
              type: 'list',
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

    expect(form$.model).toEqual({
      list: [
        [{ text: 1 }, { text: 2 }, { text: 3 }],
        [{ text: 4 }, { text: 5 }],
      ],
    })

    list.sort(1, 0)
    expect(form$.model).toEqual({
      list: [
        [{ text: 4 }, { text: 5 }],
        [{ text: 1 }, { text: 2 }, { text: 3 }],
      ],
    })

    list.sort(0, 1)
    expect(form$.model).toEqual({
      list: [
        [{ text: 1 }, { text: 2 }, { text: 3 }],
        [{ text: 4 }, { text: 5 }],
      ],
    })
  })

  it('should sort list > container > list', async () => {
    const { form$, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          modelValue: [{ list: [1, 2, 3] }, { list: [4, 5] }],
          schema: {
            list: {
              type: 'list',
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

    expect(form$.model).toEqual({
      list: [{ list: [1, 2, 3] }, { list: [4, 5] }],
    })

    list.sort(1, 0)
    expect(form$.model).toEqual({
      list: [{ list: [4, 5] }, { list: [1, 2, 3] }],
    })

    list.sort(0, 1)
    expect(form$.model).toEqual({
      list: [{ list: [1, 2, 3] }, { list: [4, 5] }],
    })
  })

  it('should sort list > container > list > container', async () => {
    const { form$, list } = createForm({
      schema: defineSchema({
        list: {
          type: 'list',
          modelValue: [
            { list: [{ text: 1 }, { text: 2 }, { text: 3 }] },
            { list: [{ text: 4 }, { text: 5 }] },
          ],
          schema: {
            list: {
              type: 'list',
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

    expect(form$.model).toEqual({
      list: [
        { list: [{ text: 1 }, { text: 2 }, { text: 3 }] },
        { list: [{ text: 4 }, { text: 5 }] },
      ],
    })

    list.sort(1, 0)
    expect(form$.model).toEqual({
      list: [
        { list: [{ text: 4 }, { text: 5 }] },
        { list: [{ text: 1 }, { text: 2 }, { text: 3 }] },
      ],
    })

    list.sort(0, 1)
    expect(form$.model).toEqual({
      list: [
        { list: [{ text: 1 }, { text: 2 }, { text: 3 }] },
        { list: [{ text: 4 }, { text: 5 }] },
      ],
    })
  })
})
