import { setupDevtoolsPlugin } from '@vue/devtools-api'
import { nextTick } from 'vue'

import { defineSchema } from '#core'
import { createDevtools } from '#core/modules/devtools/createDevtools'

import { createForm, flushPromises } from '../../helpers'

vi.mock('@vue/devtools-api', () => ({
  setupDevtoolsPlugin: vi.fn(),
}))

const setupMock = vi.mocked(setupDevtoolsPlugin)

/**
 * A fake DevTools plugin API capturing the inspector handlers, so tests can
 * query the tree/state the way the DevTools frontend would.
 */
const makeInspectorApi = () => {
  const handlers: Record<string, (payload: any) => void> = {}

  const api = {
    addInspector: vi.fn(),
    sendInspectorTree: vi.fn(),
    sendInspectorState: vi.fn(),
    on: {
      getInspectorTree: (cb: (payload: any) => void) => {
        handlers.tree = cb
      },
      getInspectorState: (cb: (payload: any) => void) => {
        handlers.state = cb
      },
    },
  }

  return { api, handlers }
}

describe('Devtools module', () => {
  beforeEach(() => {
    setupMock.mockClear()
  })

  it('should set up the inspector on install and track mounted forms', async () => {
    const { form } = createForm({
      name: 'my_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
    })

    await flushPromises()

    expect(setupMock).toHaveBeenCalledTimes(1)

    const [descriptor, setup] = setupMock.mock.calls[0] as any

    expect(descriptor.id).toBe('dev.vueform.devtools')
    expect(descriptor.packageName).toBe('@vueform/core')

    const { api, handlers } = makeInspectorApi()
    setup(api)

    expect(api.addInspector).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'vueform' })
    )

    const tree: any = { inspectorId: 'vueform', filter: '', rootNodes: [] }
    handlers.tree(tree)

    expect(tree.rootNodes).toHaveLength(1)
    expect(tree.rootNodes[0].label).toBe('my_form')
    expect(tree.rootNodes[0].children.map((c: any) => c.label)).toContain(
      'name'
    )

    // form state panel
    const uid = tree.rootNodes[0].id.slice('form:'.length)
    const formState: any = { inspectorId: 'vueform', nodeId: `form:${uid}` }
    handlers.state(formState)

    expect(formState.state.Data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'model', value: { name: 'John' } }),
      ])
    )

    // element state panel
    const elState: any = { inspectorId: 'vueform', nodeId: `${uid}:name` }
    handlers.state(elState)

    expect(elState.state.Path).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'path', value: 'name' }),
      ])
    )

    form.unmount()
    await nextTick()

    const emptyTree: any = { inspectorId: 'vueform', filter: '', rootNodes: [] }
    handlers.tree(emptyTree)

    expect(emptyTree.rootNodes).toHaveLength(0)
  })

  it('should refresh the inspector when form state changes', async () => {
    const { form, name } = createForm({
      name: 'refresh_form',
      schema: defineSchema({
        name: { type: 'text', default: 'John' },
      }),
    })

    await flushPromises()

    const [, setup] = setupMock.mock.calls[
      setupMock.mock.calls.length - 1
    ] as any
    const { api } = makeInspectorApi()
    setup(api)

    api.sendInspectorTree.mockClear()
    api.sendInspectorState.mockClear()

    name.update('Jane')
    await nextTick()
    await flushPromises()

    expect(api.sendInspectorTree).toHaveBeenCalledWith('vueform')
    expect(api.sendInspectorState).toHaveBeenCalledWith('vueform')

    form.unmount()
  })

  it('should be inert with `devtools: false` in the config', async () => {
    const { form, vueform } = createForm(
      {
        name: 'disabled_form',
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
      },
      { devtools: false }
    )

    await flushPromises()

    expect(setupMock).not.toHaveBeenCalled()
    expect(
      vueform.config.plugins.filter((p: any) => p.name === 'devtools')
    ).toHaveLength(0)

    form.unmount()
  })

  it('should be inert in production', () => {
    vi.stubEnv('NODE_ENV', 'production')

    try {
      const config = { devtools: true, plugins: [] as any[] }
      const module = createDevtools({ config } as any)

      expect(config.plugins).toHaveLength(0)

      module.registerForm('1', {})
      module.setupInspector({} as any)
      expect(module.refreshInspector()).toBeUndefined()
      expect(setupMock).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
