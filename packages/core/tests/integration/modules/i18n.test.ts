import { defineSchema } from '@vueform/core'
import * as modules from '@vueform/core/modules'
import { nextTick } from 'vue'

import { createForm, flushPromises } from '../../helpers'

// The i18n module's doorway is inject-based (per app), so unlike globals-based modules
// this is testable per form — but a fresh file keeps it symmetric with the
// other module-absence suites.
const { i18n: _i18n, ...modulesWithoutI18n } = modules as any

describe('Forms without the i18n module', () => {
  it('should render with raw tags and first-entry locale maps', async () => {
    const { form$, name } = createForm(
      {
        schema: defineSchema({
          name: {
            type: 'text',
            label: { de_DE: 'Name (DE)', en_US: 'Name (EN)' },
            rules: 'required',
          },
        }),
      },
      { modules: modulesWithoutI18n }
    )

    await nextTick()

    // locale maps fall back to their first entry
    expect(name.label).toBe('Name (DE)')

    // validation messages resolve to a raw tag instead of translated text
    await form$.validate()
    await flushPromises()
    expect(form$.invalid).toBe(true)
    expect(name.errors[0]).toMatch(/^rule_\w+_error$/)
  })

  it('should warn when switching the locale', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { form$ } = createForm(
      {
        schema: defineSchema({
          name: { type: 'text' },
        }),
      },
      { modules: modulesWithoutI18n }
    )

    await nextTick()

    form$.find('name')?.$i18n.set('de_DE')

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('requires the `i18n` module')
    )

    warnSpy.mockRestore()
  })
})
