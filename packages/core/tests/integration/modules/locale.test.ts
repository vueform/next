import { nextTick } from 'vue'

import { defineSchema } from '#core'
import * as modules from '#core/modules'

import { createForm, flushPromises } from '../../helpers'

// Locale's doorway is inject-based (per app), so unlike globals-based modules
// this is testable per form — but a fresh file keeps it symmetric with the
// other module-absence suites.
const { locale: _locale, ...modulesWithoutLocale } = modules as any

describe('Forms without the locale module', () => {
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
      { modules: modulesWithoutLocale }
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
      { modules: modulesWithoutLocale }
    )

    await nextTick()

    form$.find('name')?.$locale.set('de_DE')

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('requires the `locale` module')
    )

    warnSpy.mockRestore()
  })
})
