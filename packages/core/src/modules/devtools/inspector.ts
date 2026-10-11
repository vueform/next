import { setupDevtoolsPlugin } from '@vue/devtools-api'
import { unref, type App } from 'vue'

import { getForms, onRegistryChange } from './registry'

const INSPECTOR_ID = 'vueform'
const PLUGIN_ID = 'dev.vueform.devtools'

const FORM_SECTIONS: readonly [string, readonly string[]][] = [
  ['Data', ['model', 'payload', 'initialModel']],
  [
    'State',
    [
      'empty',
      'dirty',
      'validated',
      'invalid',
      'debouncing',
      'pending',
      'busy',
      'completed',
      'submitting',
    ],
  ],
  ['Validation', ['errors', 'messages']],
  ['Localization', ['language', 'languages']],
  ['Submit', ['submits', 'result', 'response']],
  ['UID', ['uid']],
]

const ELEMENT_SECTIONS: readonly [string, readonly string[]][] = [
  ['Data', ['model', 'payload', 'initialModel', 'tracking']],
  [
    'State',
    [
      'available',
      'empty',
      'visited',
      'touched',
      'dirty',
      'validated',
      'invalid',
      'debouncing',
      'pending',
      'busy',
      'completed',
      'success',
      'hoisted',
    ],
  ],
  ['Validation', ['errors', 'messages', 'required']],
  ['Path', ['path', 'dataPath']],
  ['UID', ['uid']],
]

let inspectorApi: any

/**
 * Tree node for the inspector, with mutable children array for tree building.
 */
interface TreeNode {
  id: string
  label: string
  tags: { label: string; textColor: number; backgroundColor: number }[]
  children: TreeNode[]
}

/**
 * Builds the inspector tree node for a single element.
 *
 * @param path The element's dot-notation path.
 * @param el$ The element's context.
 * @param formUid The parent form's UID.
 */
function buildElementNode(path: string, el$: any, formUid: string): TreeNode {
  const tags: TreeNode['tags'] = []
  const type = unref(el$.type)
  const invalid = unref(el$.invalid)

  if (type) {
    tags.push({
      label: type,
      textColor: 0xffffff,
      backgroundColor: 0x42b883,
    })
  }

  if (unref(el$.props.nested)) {
    tags.push({
      label: 'nested',
      textColor: 0xffffff,
      backgroundColor: 0x666666,
    })
  }

  if (el$.props?.flatten) {
    tags.push({
      label: 'flattened',
      textColor: 0x555555,
      backgroundColor: 0xf0f0f0,
    })
  }

  if (invalid) {
    tags.push({
      label: 'invalid',
      textColor: 0xffffff,
      backgroundColor: 0xf56c6c,
    })
  }

  const segments = path.split('.')

  return {
    id: `${formUid}:${path}`,
    label: segments[segments.length - 1],
    tags,
    children: [],
  }
}

/**
 * Builds a nested tree from a flat elements map by matching dot-notation paths
 * to their nearest registered parent.
 *
 * @param elements$ The flat map of all registered elements.
 * @param formUid The parent form's UID.
 * @param filter Optional lowercase filter string.
 */
function buildElementTree(
  elements$: Map<string, any>,
  formUid: string,
  filter: string
): TreeNode[] {
  const nodes = new Map<string, TreeNode>()
  const roots: TreeNode[] = []

  for (const [path, el$] of elements$) {
    if (filter && !path.toLowerCase().includes(filter)) continue
    nodes.set(path, buildElementNode(path, el$, formUid))
  }

  for (const [path, node] of nodes) {
    const segments = path.split('.')
    let parent: TreeNode | undefined

    for (let i = segments.length - 1; i > 0; i--) {
      const candidate = segments.slice(0, i).join('.')
      if (nodes.has(candidate)) {
        parent = nodes.get(candidate)
        break
      }
    }

    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}

/**
 * Signals DevTools to re-query the inspector tree and state panel.
 */
export function refreshInspector() {
  if (!inspectorApi) return
  inspectorApi.sendInspectorTree(INSPECTOR_ID)
  inspectorApi.sendInspectorState(INSPECTOR_ID)
}

/**
 * Initializes the Vue DevTools plugin with a Vueform custom inspector.
 *
 * @param app The Vue application instance.
 */
export function setupInspector(app: App) {
  setupDevtoolsPlugin(
    {
      id: PLUGIN_ID,
      label: 'Vueform',
      packageName: '@vueform/core',
      app,
      logo: 'https://vueform.com/images/logo.svg',
    },
    (api) => {
      inspectorApi = api

      api.addInspector({
        id: INSPECTOR_ID,
        label: 'Vueform',
        icon: 'assignment',
      })

      onRegistryChange(() => {
        api.sendInspectorTree(INSPECTOR_ID)
        api.sendInspectorState(INSPECTOR_ID)
      })

      api.on.getInspectorTree((payload) => {
        if (payload.inspectorId !== INSPECTOR_ID) return

        const forms = getForms()
        const filter = payload.filter?.toLowerCase() ?? ''

        payload.rootNodes = [...forms.entries()]
          .map(([uid, form$]) => {
            const formName = unref(form$.name) || 'VfForm'
            const elements =
              form$.elements$ instanceof Map
                ? buildElementTree(form$.elements$, uid, filter)
                : []

            if (
              filter &&
              !formName.toLowerCase().includes(filter) &&
              elements.length === 0
            ) {
              return null
            }

            return {
              id: `form:${uid}`,
              label: formName,
              tags: [
                {
                  label: 'Form',
                  textColor: 0xffffff,
                  backgroundColor: 0x3ba2f5,
                },
                {
                  label: `${form$.elements$?.size ?? 0} elements`,
                  textColor: 0x3ba2f5,
                  backgroundColor: 0xe8f4fd,
                },
              ],
              children: elements,
            }
          })
          .filter(Boolean) as any[]
      })

      api.on.getInspectorState((payload) => {
        if (payload.inspectorId !== INSPECTOR_ID) return

        const nodeId = payload.nodeId

        if (nodeId.startsWith('form:')) {
          const uid = nodeId.slice(5)
          const form$ = getForms().get(uid)
          if (!form$) return

          payload.state = Object.fromEntries(
            FORM_SECTIONS.map(([section, keys]) => [
              section,
              keys.map((key) => ({ key, value: unref(form$[key]) })),
            ])
          )
          return
        }

        const colonIdx = nodeId.indexOf(':')
        if (colonIdx === -1) return

        const formUid = nodeId.slice(0, colonIdx)
        const elementPath = nodeId.slice(colonIdx + 1)

        const form$ = getForms().get(formUid)
        if (!form$ || !(form$.elements$ instanceof Map)) return

        const el$ = form$.elements$.get(elementPath)
        if (!el$) return

        payload.state = Object.fromEntries(
          ELEMENT_SECTIONS.map(([section, keys]) => [
            section,
            keys.map((key) => ({ key, value: unref(el$[key]) })),
          ])
        )
      })
    }
  )
}
