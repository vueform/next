import { defineSchema, model } from '@vueform/core'
import * as modules from '@vueform/core/modules'

import { createForm } from '../../helpers'

const { model: _model, ...modulesWithoutModel } = modules as any

describe('Forms without the model module', () => {
  it('should throw when the model module is not registered', () => {
    expect(() =>
      createForm(
        {
          schema: defineSchema({
            name: { type: 'text' },
          }),
        },
        { modules: modulesWithoutModel }
      )
    ).toThrow('The `model` module is required')
  })

  it('should mount when only the model module is registered', () => {
    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text', default: 'Ada' },
        }),
      },
      { modules: { model } }
    )

    expect(form$.find('name')?.model).toBe('Ada')
  })
})
