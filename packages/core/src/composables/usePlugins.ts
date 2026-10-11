import type { VueformPlugin } from '#src/helpers'
import type { VueformComponent, ComponentOptions } from '#src/types'
import { toArray, getComponentDef, getGenericInstance } from '#src/utils'

import { useConfig } from './useConfig'

/**
 * Determines whether a plugin should be applied to the given component based on
 * the plugin's `apply` criteria.
 *
 * @param apply The plugin's apply filter (string, array, regex, function, or
 *   undefined).
 * @param component The Vueform component definition to test against.
 */
export function shouldApplyPlugin(
  apply: VueformPlugin['apply'],
  component: VueformComponent
) {
  if (!apply) return false

  if (typeof apply === 'function') {
    return apply(component)
  }

  const { name } = component
  if (!name) {
    throw Error('Vueform components must have a `name` defined.')
  }
  const isElement = component.element ?? false

  return toArray(apply).some(
    (a) =>
      a === '*' ||
      a === name ||
      (a === '*element' && isElement) ||
      (a instanceof RegExp && a.test(name))
  )
}

/**
 * Applies registered Vueform plugins to the current component and returns the
 * component's API object.
 *
 * @private
 * @param createApi A factory function that produces the component's public API.
 * @param events The component's event system created by `defineEvents`.
 */
export function usePlugins<T extends Record<string, any>>(
  createApi: () => T,
  events?: Record<string, any>
) {
  const config = useConfig()
  const instance = getGenericInstance()

  if (!instance) {
    throw new Error('`usePlugins()` must be called within setup() context')
  }

  const component = getComponentDef(instance) as ComponentOptions
  const props = instance.props
  const api = createApi()
  // What a plugin's `extend` receives as its `api` argument: the component's
  // API plus its event helpers.
  const pluginApi = events ? { ...api, ...events } : api

  const resolvePluginExtensions = ({
    apply,
    extend,
    plugins,
  }: VueformPlugin) => {
    if (!shouldApplyPlugin(apply, component)) return
    Object.assign(api, extend?.(props, pluginApi))
    plugins?.forEach(resolvePluginExtensions)
  }

  config.plugins.forEach(resolvePluginExtensions)

  return api
}
