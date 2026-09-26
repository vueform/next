import { computed, nextTick, ref } from 'vue'
import { createForm } from '../../helpers'
import { defineSchema } from '#core'

describe('Translate', () => {
  it('should translate input model', async () => {
    const { form$ } = createForm({
      languages: {
        en: 'English',
        de: 'German',
      },
      schema: defineSchema({
        text: {
          type: 'text',
          translate: true,
        },
      }),
    })

    expect(form$.model).toEqual({
      text: {
        en: null,
        de: null,
      },
    })
  })

  it('should enabled translate dynamically', async () => {
    const translate = ref(false)

    const schema = computed(() =>
      defineSchema({
        text: {
          type: 'text',
          translate: translate.value,
        },
      })
    )

    const { form$ } = createForm({
      languages: {
        en: 'English',
        de: 'German',
      },
      schema,
    })

    expect(form$.model).toEqual({
      text: null,
    })

    translate.value = true
    await nextTick()

    expect(form$.model).toEqual({
      text: {
        en: null,
        de: null,
      },
    })

    translate.value = false
    await nextTick()

    expect(form$.model).toEqual({
      text: null,
    })
  })
})
