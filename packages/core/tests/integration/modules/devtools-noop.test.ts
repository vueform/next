import {
  defineSchema,
  getDevtoolsModule,
  hasDevtoolsModule,
} from '@vueform/core'

import { createForm, flushPromises } from '../../helpers'

// Core ships no devtools implementation (it lives in `@vueform/devtools`), so
// a plain form exercises exactly what every consumer without the plugin gets:
// the inert noop surface behind every doorway call.
describe('Devtools without the devtools module', () => {
  it('should serve the inert noop surface and register nothing', async () => {
    const { form, form$, vueform } = createForm({
      name: 'plain_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
    })

    await flushPromises()

    // the form works, but no DevTools form tracker was registered
    expect(form$.model).toEqual({ name: 'John' })
    expect(
      vueform.config.plugins.filter((p: any) => p.name === 'devtools:tracker')
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
