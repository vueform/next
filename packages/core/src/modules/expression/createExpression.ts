import { computed, ref, watch, type WatchHandle } from 'vue'

import type { VueformInstance } from '#core/helpers'
import type { ModelNode, SchemaIndex } from '#core/modules/model'
import {
  get as getByPath,
  getComponentDef,
  isPlainObject,
  normalize,
  warn as vfWarn,
  isDev,
} from '#core/utils'

import { noopExpression } from './noop'
import type {
  ExpressionInitOptions,
  ExpressionModule,
  ExpressionNodeState,
  ExpressionTracker,
  ExpressionTracking,
  ExpressionTrackingOptions,
} from './types'

// Matches `{expression}` templates and `\{escaped}` sequences. The `s`
// (dotAll) flag lets `{…}` templates span multiple lines, so longer
// expressions can be written as multi-line strings.
const CHAIN_RE = /{(.+?)}|\\({.+?})/gs
const HAS_UNESCAPED_BRACE_RE = /(?:^|[^\\])\{/

// ========== EXPRESSION TRACKING ==========

// Per-node state lives on the node (`node.expression`) and the per-index
// tracker on the index (`index.expressionTracker`), so mounted facades resolve
// them without knowing which host created the tracker.

// Created effects are owned by the caller's active scope (instance vs
// component).
function makeTracking(
  index: SchemaIndex,
  options: ExpressionTrackingOptions,
  expression: Pick<ExpressionModule, 'resolve' | 'usedPaths'>
): ExpressionTracker {
  const { store, config } = options

  // Node `expressions` > host allow-list > config trigger > allowed.
  const expressionsAllowed = (node: ModelNode): boolean => {
    const allowList =
      node.props.expressions ??
      options.expressions?.() ??
      config.$expression?.trigger ??
      true

    return (
      allowList === true ||
      (Array.isArray(allowList) && allowList.includes('default'))
    )
  }

  const isTemplate = (value: any): value is string =>
    typeof value === 'string' &&
    value.includes('{') &&
    HAS_UNESCAPED_BRACE_RE.test(value)

  const init = (
    node: ModelNode,
    el$: () => any,
    initOptions: ExpressionInitOptions = {}
  ) => {
    if (node.children || !node.dataPath) return
    if (node.expressionable !== true) return
    if (node.expression) return
    if (!expressionsAllowed(node)) return

    const langs = node.translatable
      ? Object.keys(options.languages?.() ?? {})
      : undefined
    const def = node.props.default
    const initial = store.get(node.dataPath)

    const sourceFor = (value: any, fallback: any): string | undefined =>
      isTemplate(value) ? value : isTemplate(fallback) ? fallback : undefined

    // Language key → template (single-language nodes use one 'default' key).
    let sources: [string, string][] = []

    for (const lang of langs?.length ? langs : ['default']) {
      const source = langs?.length
        ? sourceFor(initial?.[lang], isPlainObject(def) ? def[lang] : def)
        : sourceFor(initial, def)
      if (source !== undefined) sources.push([lang, source])
    }

    // Re-init after a rebuild: the store value may already hold the resolved
    // value (not a template) with no `default` template either — carry the
    // previous tracker's sources so e.g. model-argument templates survive.
    if (!sources.length && initOptions.prevSources?.length) {
      sources = initOptions.prevSources
    }

    if (!sources.length) return

    const context$ = el$()

    // Host consts merge under the model, mirroring the mounted
    // `{ ...resolvedConsts, ...model }` resolution data.
    const resolveData = () => {
      const consts = options.consts?.()
      return consts && Object.keys(consts).length
        ? { ...consts, ...store.model.value }
        : store.model.value
    }

    const resolveSource = (source: string) =>
      normalize(expression.resolve(source, resolveData(), context$) ?? '')

    const pathOf = (lang: string) =>
      langs?.length ? `${node.dataPath}.${lang}` : node.dataPath

    // Dependency-free templates (e.g. `{1 + 1}`) resolve once — no tracker.
    const tracked = sources.filter(
      ([, source]) => expression.usedPaths(source, node.path).length > 0
    )

    for (const [lang, source] of sources) {
      if (!tracked.some(([l]) => l === lang)) {
        store.set(pathOf(lang), resolveSource(source))
      }
    }

    if (!tracked.length) return

    const results = computed(() =>
      Object.fromEntries(
        tracked.map(([lang, source]) => [lang, resolveSource(source)])
      )
    )

    const write = () => {
      // The node's slice may be gone mid-flush (its list row was just removed
      // and the sync watcher fires before the row's elements unmount) —
      // writing would resurrect the removed path.
      if (store.get(node.dataPath) === undefined) return

      for (const [lang] of tracked) {
        store.set(pathOf(lang), results.value[lang])
      }
    }

    const tracking = ref(false)

    let stopResults: WatchHandle | undefined

    const track = () => {
      if (tracking.value) return
      tracking.value = true
      stopResults = watch(results, write, { flush: 'sync', immediate: true })
    }

    const untrack = () => {
      if (!tracking.value) return
      tracking.value = false
      stopResults?.()
    }

    const untrackOn: string[] = node.props.untrackOn ?? ['input', 'load']

    const state: ExpressionNodeState = {
      tracking,
      untrackOn,
      sources: tracked,
      track,
      untrack,
    }

    node.expression = state

    if (untrackOn.includes('load')) {
      state.stopLoad = store.on('load', untrack)
    }

    if (initOptions.resume !== false) track()
  }

  const release = (node: ModelNode) => {
    const state = node.expression
    if (!state) return
    state.untrack()
    state.stopLoad?.()
    node.expression = undefined
  }

  const active: ExpressionTracker = { init, release }

  index.expressionTracker = active

  return active
}

// Binds a tracking surface to the owning instance's `resolve` / `usedPaths`,
// so trackers always evaluate through the engine that created them.
function makeTrackingFactory(
  expression: Pick<ExpressionModule, 'resolve' | 'usedPaths'>
): ExpressionModule['makeExpressionTracking'] {
  return (index?: SchemaIndex): ExpressionTracking => {
    const trackable = (
      instance: Parameters<typeof getComponentDef>[0]
    ): boolean =>
      !!index?.expressionTracker &&
      (getComponentDef(instance) as any)?.expressionable === true

    const activate = (options: ExpressionTrackingOptions): boolean =>
      !!(
        index &&
        (index.expressionTracker ?? makeTracking(index, options, expression))
      )

    const init = (
      node: ModelNode,
      el$: () => any,
      initOptions?: ExpressionInitOptions
    ): void => {
      index?.expressionTracker?.init(node, el$, initOptions)
    }

    const reinit = (node: ModelNode, el$: () => any): void => {
      const active = index?.expressionTracker
      if (!active) return

      const state = node.expression
      const wasTracking = state ? state.tracking.value : true
      const prevSources = state?.sources

      if (state) active.release(node)

      active.init(node, el$, { resume: wasTracking, prevSources })
    }

    const release = (node: ModelNode): void => {
      index?.expressionTracker?.release(node)
    }

    const isTracking = (node: ModelNode | undefined): boolean =>
      node?.expression?.tracking.value ?? false

    const track = (node: ModelNode | undefined): void => {
      node?.expression?.track()
    }

    const untrack = (node: ModelNode | undefined): void => {
      node?.expression?.untrack()
    }

    const notify = (node: ModelNode | undefined, event: 'input' | 'load') => {
      const state = node?.expression
      if (state?.untrackOn.includes(event)) state.untrack()
    }

    const notifyInputData = (data: Record<string, any>) => {
      if (!index) return
      for (const node of index.nodes.values()) {
        if (node.dataPath && getByPath(data, node.dataPath) !== undefined) {
          notify(node, 'input')
        }
      }
    }

    return {
      trackable,
      activate,
      init,
      reinit,
      release,
      isTracking,
      track,
      untrack,
      notify,
      notifyInputData,
    }
  }
}

/**
 * Creates an expression instance from the given app config (uses the
 * `$expression` enabled flag and adapter). Falls back to the inert passthrough
 * surface (`installed: false`) when disabled or when no adapter is registered —
 * register one via `$expression: { adapter }` (`pathExpressionAdapter` for
 * plain `{path}` interpolation, or `@vueform/expr-eval`). Owns everything
 * engine-independent: the `{…}` template-chain format and escapes, `undefined`
 * passthrough, result normalization, and the transient-warning queue — the
 * adapter's engine only evaluates single expressions and reports their paths.
 *
 * @param vueform The owning instance (only `config.$expression` is used).
 */
export function createExpression(vueform: VueformInstance): ExpressionModule {
  const config = vueform.config
  const options = config.$expression ?? {}

  if (options.enabled === false) {
    return noopExpression
  }

  if (!options.adapter) {
    if (isDev()) {
      vfWarn(
        'The `expression` module is registered without an ' +
          'adapter, so expressions are inert. Register one via ' +
          '`createVueform({ $expression: { adapter: pathExpressionAdapter } })` ' +
          'or install `@vueform/expr-eval`.'
      )
    }

    return noopExpression
  }

  // The engine receives the owning instance so adapter functions can resolve
  // module doorways (date, locale) against this instance.
  const engine = options.adapter(options, vueform)

  // Expressions may reference element paths that only register later in the
  // same mount cycle (forward references), which makes evaluation fail
  // transiently with "undefined variable" errors. Instead of warning
  // synchronously, warnings are queued and flushed on the next macrotask; a
  // successful resolution of the same expression before the flush cancels the
  // queued warning, so only persistent errors are reported. Keyed by the
  // element context (stable across resolutions, unlike the element path) and
  // the raw expression; entries live only while a timer is pending.
  const pendingWarnings = new Map<
    object,
    Map<string, ReturnType<typeof setTimeout>>
  >()

  // Fallback owner for resolutions without an element context.
  const defaultWarningOwner = {}

  const cancelWarning = (owner: object, expression: string) => {
    const warnings = pendingWarnings.get(owner)
    const pending = warnings?.get(expression)

    if (pending !== undefined) {
      clearTimeout(pending)
      warnings!.delete(expression)
      if (!warnings!.size) pendingWarnings.delete(owner)
    }
  }

  const queueWarning = (owner: object, expression: string, e: unknown) => {
    cancelWarning(owner, expression)

    let warnings = pendingWarnings.get(owner)

    if (!warnings) {
      warnings = new Map()
      pendingWarnings.set(owner, warnings)
    }

    warnings.set(
      expression,
      setTimeout(() => {
        warnings.delete(expression)
        if (!warnings.size) pendingWarnings.delete(owner)
        vfWarn(`Expression error in "${expression}":`, e)
      }, 0)
    )
  }

  function resolve(
    value: string,
    data?: Record<string, any>,
    context$?: any
  ): string
  function resolve(
    value: undefined,
    data?: Record<string, any>,
    context$?: any
  ): undefined
  function resolve(
    value: string | undefined,
    data?: Record<string, any>,
    context$?: any
  ): string | undefined
  function resolve(
    value: string | undefined,
    data?: Record<string, any>,
    context$?: any
  ): string | undefined {
    if (typeof value !== 'string' || !value.includes('{')) {
      return value
    }

    if (!HAS_UNESCAPED_BRACE_RE.test(value)) {
      return value
    }

    return value.replace(CHAIN_RE, (match, expression, escaped) => {
      if (expression !== undefined) {
        const warningOwner = context$ ?? defaultWarningOwner
        let resolved: string | undefined

        try {
          resolved = engine.evaluate(expression, data, context$)

          if (resolved === undefined) return ''

          cancelWarning(warningOwner, expression)
        } catch (e) {
          if (options.debug !== false && isDev()) {
            queueWarning(warningOwner, expression, e)
          }
        }

        if (resolved === 'NaN') {
          resolved = '0'
        }

        if (
          resolved === undefined ||
          ['null', 'undefined', '[object Object]'].includes(resolved)
        ) {
          resolved = ''
        }

        return resolved
      }

      if (escaped !== undefined) {
        return escaped.replace(/\\}$/, '}')
      }

      return match
    })
  }

  const usedPaths = (expressionChain: string, path?: string): string[] => {
    if (typeof expressionChain !== 'string' || !expressionChain.includes('{')) {
      return []
    }

    const matches = [...(expressionChain?.matchAll(CHAIN_RE) || [])]
      .map((m) => m[1])
      .filter((m) => !!m)

    const result: string[] = []

    for (const e of matches) {
      result.push(...engine.variables(e, path))
    }

    return result
  }

  const warn = () => {}

  return {
    installed: true,
    resolve,
    usedPaths,
    warn,
    makeExpressionTracking: makeTrackingFactory({ resolve, usedPaths }),
  }
}
