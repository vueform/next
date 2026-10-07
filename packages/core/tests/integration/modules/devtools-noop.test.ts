import { setupDevtoolsPlugin } from '@vue/devtools-api'
import {
  defineSchema,
  getDevtoolsModule,
  hasDevtoolsModule,
} from '@vueform/core'
import * as modules from '@vueform/core/modules'

import { createForm, flushPromises } from '../../helpers'

vi.mock('@vue/devtools-api', () => ({
  setupDevtoolsPlugin: vi.fn(),
}))

// This file must not install the devtools module anywhere, so the inert
// surface is what every doorway call serves.
const { devtools: _devtools, ...modulesWithoutDevtools } = modules as any

describe('Devtools without the devtools module', () => {
  it('should serve the inert noop surface and register nothing', async () => {
    const { form, form$, vueform } = createForm(
      {
        name: 'plain_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
      },
      { modules: modulesWithoutDevtools }
    )

    await flushPromises()

    // the form works, but no DevTools plugin was registered
    expect(form$.model).toEqual({ name: 'John' })
    expect(setupDevtoolsPlugin).not.toHaveBeenCalled()
    expect(
      vueform.config.plugins.filter((p: any) => p.name === 'devtools')
    ).toHaveLength(0)

    // the doorway serves the inert surface, every method a no-op
    expect(hasDevtoolsModule(vueform)).toBe(false)

    const devtools = getDevtoolsModule(vueform)

    expect(devtools.registerForm('1', {})).toBeUndefined()
    expect(devtools.refreshInspector()).toBeUndefined()
    expect(devtools.unregisterForm('1')).toBeUndefined()
    expect(devtools.setupInspector({} as any)).toBeUndefined()

    form.unmount()
  })
})
