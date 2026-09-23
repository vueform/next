import {
  computed,
  nextTick,
  onBeforeUnmount,
  unref,
  watch,
  type MaybeRef,
} from 'vue'
import type { VueformInstance } from '~/helpers'
import {
  isClient,
  isServer,
  resolveRouter,
  getGenericInstance,
  warn,
} from '~/utils'
import type {
  RouterHistory,
  RouterModule,
  RouterModuleOptions,
  VueformRouter,
} from './types'

function buildRoute(
  page: string,
  queryParam: string | undefined,
  router: VueformRouter
): any {
  if (queryParam) {
    return {
      query: { ...router.currentRoute.value.query, [queryParam]: page },
    }
  }

  const base = router.currentRoute.value.path.replace(/\/[^/]*$/, '')
  return `${base}/${page}`
}

function parseStep(
  route: { path: string; query: Record<string, any> },
  queryParam: string | undefined
): string | undefined {
  if (queryParam) {
    const val = route.query[queryParam]
    return typeof val === 'string' ? val : undefined
  }

  const segments = route.path.split('/').filter(Boolean)
  return segments[segments.length - 1] || undefined
}

let queryParamWarned = false

/**
 * Creates a router instance from the given app config (uses the top-level
 * `router` key with `$router` overrides applied on top, delegating to
 * `$router.adapter` when set).
 *
 * @param config The app config.
 */
export function createRouter(vueform: VueformInstance): RouterModule {
  const { config } = vueform

  const options: RouterModuleOptions = {
    router: config.router,
    ...config.$router,
  }

  if (options.adapter) {
    return options.adapter(options)
  }

  const make = (
    active: MaybeRef<boolean | undefined>,
    onNavigate: (state: any) => void
  ): RouterHistory => {
    const routerInstance = resolveRouter(options.router)

    // --- Vue-router mode ---
    if (routerInstance) {
      const formProps = (getGenericInstance()?.props ?? {}) as {
        routerQueryParam?: string
      }
      const queryParam = formProps.routerQueryParam ?? options.queryParam

      const currentStep = parseStep(
        routerInstance.currentRoute.value,
        queryParam
      )

      // Suppress pushes during the first tick so the pager's initial reset()
      // does not overwrite the URL the user navigated to.
      let initialized = false
      let navigating = false

      nextTick(() => {
        if (currentStep && unref(active)) {
          onNavigate({ page: currentStep })
        }
        initialized = true
      })

      const push = (data: Record<string, any>) => {
        if (!initialized || !unref(active) || navigating) return
        const page = data.page
        if (!page) return
        navigating = true
        routerInstance.push(buildRoute(page, queryParam, routerInstance))
        nextTick(() => {
          navigating = false
        })
      }

      const back = () => {
        if (!unref(active)) return
        navigating = true
        routerInstance.back()
        nextTick(() => {
          navigating = false
        })
      }

      watch(
        () => routerInstance.currentRoute.value,
        (newRoute) => {
          if (navigating || !unref(active)) return
          const step = parseStep(newRoute, queryParam)
          if (step) {
            onNavigate({ page: step })
          }
        },
        { deep: true }
      )

      return { push, back }
    }

    // --- Default pushState mode ---
    const formProps = (getGenericInstance()?.props ?? {}) as {
      routerQueryParam?: string
    }
    if (
      (options.queryParam || formProps.routerQueryParam) &&
      !queryParamWarned
    ) {
      queryParamWarned = true
      warn(
        '[vueform] "queryParam" option requires a vue-router instance. ' +
          'Install vue-router or pass your router to config.router to enable query-based step navigation.'
      )
    }

    const vm = getGenericInstance()
    const key = computed(() => `history-${vm?.uid}`)

    const push = (data: Record<string, any>) => {
      if (!unref(active) || isServer) return
      history.pushState({ [key.value]: data }, '', undefined)
    }

    const back = async () => {
      if (!unref(active) || !isClient) return
      history.back()
    }

    const onPop = (e: PopStateEvent) => {
      if (!unref(active)) return
      onNavigate(e.state?.[key.value])
    }

    onBeforeUnmount(
      () => !unref(active) || window.removeEventListener('popstate', onPop)
    )

    watch(
      () => unref(active),
      (n, o) => {
        if (isServer) return
        if (n) {
          window.addEventListener('popstate', onPop)
        } else if (o) {
          window.removeEventListener('popstate', onPop)
        }
      },
      { immediate: true }
    )

    return { push, back }
  }

  return { make }
}
