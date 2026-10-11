import { defineSchema } from '@vueform/core'
import { computed, nextTick, ref } from 'vue'

import { createForm } from '../../helpers'

describe('Nested', () => {
  it('should handle nested change in container', async () => {
    const nested = ref(false)

    const schema = computed(() =>
      defineSchema({
        container: {
          type: 'group',
          nested: nested.value,
          schema: {
            text: {
              type: 'text',
              default: 'foo',
            },
          },
        },
      })
    )

    const { form$ } = createForm({
      schema,
    })

    expect(form$.model).toEqual({ text: 'foo' })

    nested.value = true
    await nextTick()
    expect(form$.model).toEqual({ container: { text: 'foo' } })

    nested.value = false
    await nextTick()
    expect(form$.model).toEqual({ text: 'foo' })
  })

  it('should handle nested change in container > container', async () => {
    const nested = ref(false)
    const subnested = ref(false)

    const schema = computed(() =>
      defineSchema({
        container: {
          type: 'group',
          nested: nested.value,
          schema: {
            subcontainer: {
              type: 'group',
              nested: subnested.value,
              schema: {
                text: {
                  type: 'text',
                  default: 'foo',
                },
              },
            },
          },
        },
      })
    )

    const { form$ } = createForm({
      schema,
    })

    expect(form$.model).toEqual({ text: 'foo' })

    nested.value = true
    await nextTick()
    expect(form$.model).toEqual({ container: { text: 'foo' } })

    nested.value = false
    await nextTick()
    expect(form$.model).toEqual({ text: 'foo' })

    subnested.value = true
    await nextTick()
    expect(form$.model).toEqual({ subcontainer: { text: 'foo' } })

    subnested.value = false
    await nextTick()
    expect(form$.model).toEqual({ text: 'foo' })

    subnested.value = true
    nested.value = true
    await nextTick()
    expect(form$.model).toEqual({
      container: { subcontainer: { text: 'foo' } },
    })

    subnested.value = false
    await nextTick()
    expect(form$.model).toEqual({ container: { text: 'foo' } })

    subnested.value = true
    await nextTick()
    expect(form$.model).toEqual({
      container: { subcontainer: { text: 'foo' } },
    })

    nested.value = false
    await nextTick()
    expect(form$.model).toEqual({ subcontainer: { text: 'foo' } })

    nested.value = true
    await nextTick()
    expect(form$.model).toEqual({
      container: { subcontainer: { text: 'foo' } },
    })

    subnested.value = false
    nested.value = false
    await nextTick()
    expect(form$.model).toEqual({ text: 'foo' })
  })

  it('should handle nested change in container > list', async () => {
    const nested = ref(false)

    const schema = computed(() =>
      defineSchema({
        container: {
          type: 'group',
          nested: nested.value,
          schema: {
            list: {
              type: 'list',
              flat: true,
              schema: {
                text: {
                  type: 'text',
                  default: 'foo',
                },
              },
            },
          },
        },
      })
    )

    const { form$ } = createForm({
      schema,
    })

    expect(form$.model).toEqual({ list: ['foo'] })

    nested.value = true
    await nextTick()
    expect(form$.model).toEqual({ container: { list: ['foo'] } })

    nested.value = false
    await nextTick()
    expect(form$.model).toEqual({ list: ['foo'] })
  })

  it('should handle nested change in container > list > container', async () => {
    const nested = ref(false)

    const schema = computed(() =>
      defineSchema({
        container: {
          type: 'group',
          nested: nested.value,
          schema: {
            list: {
              type: 'list',
              flat: true,
              schema: {
                container: {
                  type: 'group',
                  schema: {
                    text: {
                      type: 'text',
                      default: 'foo',
                    },
                  },
                },
              },
            },
          },
        },
      })
    )

    const { form$ } = createForm({
      schema,
    })

    expect(form$.model).toEqual({ list: [{ text: 'foo' }] })

    nested.value = true
    await nextTick()
    expect(form$.model).toEqual({ container: { list: [{ text: 'foo' }] } })

    nested.value = false
    await nextTick()
    expect(form$.model).toEqual({ list: [{ text: 'foo' }] })
  })

  it('should handle nested change in container > list > list', async () => {
    const nested = ref(false)

    const schema = computed(() =>
      defineSchema({
        container: {
          type: 'group',
          nested: nested.value,
          schema: {
            list: {
              type: 'list',
              flat: true,
              schema: {
                list: {
                  type: 'list',
                  flat: true,
                  schema: {
                    text: {
                      type: 'text',
                      default: 'foo',
                    },
                  },
                },
              },
            },
          },
        },
      })
    )

    const { form$ } = createForm({
      schema,
    })

    expect(form$.model).toEqual({ list: [['foo']] })

    nested.value = true
    await nextTick()
    expect(form$.model).toEqual({ container: { list: [['foo']] } })

    nested.value = false
    await nextTick()
    expect(form$.model).toEqual({ list: [['foo']] })
  })

  it('should handle nested change in container > list > list > container', async () => {
    const nested = ref(false)

    const schema = computed(() =>
      defineSchema({
        container: {
          type: 'group',
          nested: nested.value,
          schema: {
            list: {
              type: 'list',
              flat: true,
              schema: {
                list: {
                  type: 'list',
                  flat: true,
                  schema: {
                    container: {
                      type: 'group',
                      schema: {
                        text: {
                          type: 'text',
                          default: 'foo',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })
    )

    const { form$ } = createForm({
      schema,
    })

    expect(form$.model).toEqual({ list: [[{ text: 'foo' }]] })

    nested.value = true
    await nextTick()
    expect(form$.model).toEqual({ container: { list: [[{ text: 'foo' }]] } })

    nested.value = false
    await nextTick()
    expect(form$.model).toEqual({ list: [[{ text: 'foo' }]] })
  })
})
