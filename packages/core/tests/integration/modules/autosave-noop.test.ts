import { defineSchema, type HttpAdapter } from '@vueform/core'
import * as modules from '@vueform/core/modules'
import { nextTick } from 'vue'
import { createForm, flushPromises } from '../../helpers'

// This file must not install the autosave module anywhere — the module global
// is process-wide per test file, so the inert surface is only observable in a
// file where no form ever registered it.
const { autosave: _autosave, ...modulesWithoutAutosave } = modules as any

describe('Autosave without the autosave module', () => {
  it('should be inert and warn when the autosave prop is set', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const calls: any[] = []
    const adapter: HttpAdapter = async (config: any) => {
      calls.push(config)
      return {
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as any
    }

    const store: Record<string, string> = {}
    const storage = {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = value
      },
      removeItem: (key: string) => {
        delete store[key]
      },
    }

    const { form$, name } = createForm(
      {
        name: 'draft_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        autosave: {
          endpoint: '/api/autosave',
          local: { storage },
        },
      },
      {
        modules: modulesWithoutAutosave,
        $http: { adapter },
      }
    )

    await flushPromises()

    name.update('Jane')
    await nextTick()
    await flushPromises()

    // nothing saved anywhere, context methods are no-ops
    expect(Object.keys(store)).toHaveLength(0)
    expect(calls).toHaveLength(0)
    expect(await form$.loadAutosaved()).toBe(false)
    expect(form$.clearAutosaved()).toBeUndefined()
    await expect(form$.autosave()).resolves.toBeUndefined()

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('requires the `autosave` module')
    )

    warnSpy.mockRestore()
  })
})
