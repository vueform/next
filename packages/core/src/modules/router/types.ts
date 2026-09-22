import type { MaybeRef, Ref } from 'vue'

/**
 * Minimal router interface that vue-router's `Router` satisfies. Allows
 * integration without depending on the `vue-router` package at compile time.
 */
export interface VueformRouter {
  currentRoute: Ref<{
    path: string
    query: Record<string, string | string[] | undefined>
    [key: string]: any
  }>
  push: (to: any) => any
  back: () => void
}

/**
 * A per-instance history handler returned by the router module's `make` method.
 */
export interface RouterHistory {
  /**
   * Pushes a new navigation entry with the given state data.
   *
   * @param data The state data to record.
   */
  push: (data: Record<string, any>) => void

  /**
   * Navigates back one step in the history.
   */
  back: () => void | Promise<void>
}

/**
 * The router module instance providing browser history integration for
 * multi-step forms.
 */
export interface RouterModule {
  /**
   * Creates a per-instance history handler that manages push/back navigation
   * and listens for external navigation events.
   *
   * @param active Whether history tracking is enabled.
   * @param onNavigate Callback invoked when an external navigation occurs (e.g.
   *   browser back button or route change).
   */
  make: (
    active: MaybeRef<boolean | undefined>,
    onNavigate: (state: any) => void
  ) => RouterHistory
}

/**
 * A factory that produces a `RouterModule` instance.
 */
export type RouterAdapter = (options: RouterModuleOptions) => RouterModule

/**
 * Configuration options for the router module (`config.$router`).
 */
export interface RouterModuleOptions {
  /**
   * Query parameter name used for step navigation when a vue-router instance is
   * provided.
   */
  queryParam?: string

  /**
   * Vue-router instance (or `false` to disable auto-detection).
   */
  router?: VueformRouter | false

  /**
   * Custom router integration replacing the built-in vue-router / pushState
   * implementation.
   */
  adapter?: RouterAdapter
}
