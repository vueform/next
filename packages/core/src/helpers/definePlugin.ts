import type { App, ComponentPropsOptions } from 'vue'

import type {
  RawContextOf,
  PropsOf,
  ComponentNames,
  ElementNames,
  ComponentOptions,
  VueformComponent,
} from '#src/types'

import type { VueformInstance } from './createVueform'
import type {
  GlobalsHookContext,
  VueformConfig,
  VueformGlobals,
} from './defineConfig'
import type { DefineEvents } from './defineEvents'

/**
 * Valid targets for a plugin's `apply` option, including component names,
 * wildcards, and pattern matchers.
 */
type PluginApplyName =
  | ComponentNames
  | '*element'
  | '*'
  | RegExp
  | (string & {})

/**
 * The context passed to a plugin's `install` hook when Vueform is installed
 * into a Vue app — the same shape a module's `install` hook receives.
 */
export type PluginInstallContext = {
  /**
   * The Vue application instance Vueform is being installed into.
   */
  app: App

  /**
   * The Vueform instance being installed — its resolved configuration is
   * `vueform.config`.
   */
  vueform: VueformInstance
}

/**
 * The normalized plugin shape used internally by Vueform after processing
 * plugin options.
 */
export type VueformPlugin = {
  name?: string
  apply?:
    | string
    | RegExp
    | ((component: VueformComponent) => boolean)
    | (string | RegExp)[]
  props?: ComponentPropsOptions
  emits?: string[]
  plugins?: VueformPlugin[]
  extend?: (props: any, api: any) => void | Record<string, any>
  config?: (config: any) => void
  globals?: (context: {
    config: any
    globals: Readonly<Partial<VueformGlobals>>
  }) => Partial<VueformGlobals> | void
  /**
   * App-side effects run once when the instance is installed into a Vue app
   * (after components are registered) — e.g. registering a directive.
   */
  install?: (context: PluginInstallContext) => void
}

/**
 * Typed options for defining a Vueform plugin, with component targeting via
 * `$apply`.
 */
export type VueformPluginOptions<T extends PluginApplyName> = {
  name?: string
  apply?: T | ReadonlyArray<T>
  props?: ComponentPropsOptions
  emits?: string[]
  plugins?: VueformPlugin[]
  extend?: (
    props: Readonly<
      T extends '*' | RegExp
        ? PropsOf<ComponentNames>
        : T extends '*element'
          ? PropsOf<ElementNames>
          : T extends ComponentNames
            ? PropsOf<T>
            : any
    >,
    api: (T extends '*' | RegExp
      ? RawContextOf<ComponentNames>
      : T extends '*element'
        ? RawContextOf<ElementNames>
        : T extends ComponentNames
          ? RawContextOf<T>
          : any) &
      DefineEvents<any>
  ) => void | Record<string, any>
  config?: (config: VueformConfig) => void
  globals?: (context: GlobalsHookContext) => Partial<VueformGlobals> | void
  install?: (context: PluginInstallContext) => void
}

/**
 * Plugin options variant where `apply` is a predicate function for custom
 * component matching.
 */
export type VueformPluginOptionsWithApplyFn = {
  name?: string
  props?: ComponentPropsOptions
  emits?: string[]
  plugins?: VueformPlugin[]
  apply: (component: ComponentOptions) => boolean
  extend?: (props: any, api: any) => void | Record<string, any>
  config?: (config: VueformConfig) => void
  globals?: (context: GlobalsHookContext) => Partial<VueformGlobals> | void
  install?: (context: PluginInstallContext) => void
}

/**
 * A plugin factory returned by `definePlugin()`. Every plugin is a function:
 * calling it — with options when the plugin takes any — produces the plugin
 * object passed to the `plugins` config option or `vueform.use()`.
 */
export type VueformPluginFactory<Args extends unknown[] = []> = (
  ...args: Args
) => VueformPlugin

/**
 * Defines a Vueform plugin that can extend components, config, and globals.
 *
 * Takes a factory producing the plugin's definition — its parameters become the
 * plugin's options — and returns the plugin as a callable factory, so
 * registration is uniform whether or not the plugin takes options: `plugins:
 * [myPlugin()]` or `plugins: [myPlugin({ ... })]`.
 *
 * @param definition A factory producing the plugin's definition — target
 *   components, props, emits, and lifecycle hooks — from the plugin's options.
 */
export function definePlugin<Args extends unknown[], T extends PluginApplyName>(
  definition: (...args: Args) => VueformPluginOptions<T>
): VueformPluginFactory<Args>
export function definePlugin<Args extends unknown[]>(
  definition: (...args: Args) => VueformPluginOptionsWithApplyFn
): VueformPluginFactory<Args>
export function definePlugin(
  definition: (
    ...args: unknown[]
  ) => VueformPluginOptions<any> | VueformPluginOptionsWithApplyFn
): VueformPluginFactory<unknown[]> {
  if (typeof definition !== 'function') {
    throw new Error(
      'definePlugin() expects a factory function returning the plugin ' +
        'definition, e.g. `definePlugin(() => ({ ... }))`.'
    )
  }

  return definition as VueformPluginFactory<unknown[]>
}
