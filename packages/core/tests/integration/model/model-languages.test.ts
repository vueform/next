import { defineSchema } from '@vueform/core'
import { describe, expect, it } from 'vitest'

import { createForm } from '../../helpers'

const translatable = {
  title: { type: 'text', translate: true },
} as any

/**
 * A mounted host form provides the Vueform instance; config languages default
 * to en/de so the instance-level overrides are observable.
 */
const makeVueform = () =>
  createForm(
    { schema: defineSchema({ _install: { type: 'text' } }) },
    { languages: { en: 'English', de: 'German' } }
  ).vueform

describe('useModel languages option', () => {
  it('expands translatable values from the `languages` option over config languages', () => {
    const vueform = makeVueform()

    const model$ = vueform.useModel({
      schema: translatable,
      languages: { en: 'English', fr: 'French' },
    })

    expect(model$.model).toEqual({ title: { en: null, fr: null } })
  })

  it('keeps expanding from config languages without the option', () => {
    const vueform = makeVueform()

    const model$ = vueform.useModel({ schema: translatable })

    expect(model$.model).toEqual({ title: { en: null, de: null } })
  })

  it('element-level `languages` props still win over the option', () => {
    const vueform = makeVueform()

    const model$ = vueform.useModel({
      schema: {
        title: {
          type: 'text',
          translate: true,
          languages: { hu: 'Hungarian' },
        },
      } as any,
      languages: { en: 'English', fr: 'French' },
    })

    expect(model$.model).toEqual({ title: { hu: null } })
  })

  it('defaults the context language to the first key of the resolved languages', () => {
    const vueform = makeVueform()

    const model$ = vueform.useModel({
      schema: translatable,
      languages: { fr: 'French', en: 'English' },
    })

    ;(model$.find('title') as any).update('Bonjour')

    expect(model$.model).toEqual({ title: { fr: 'Bonjour', en: null } })
  })
})
