import { warn as vfWarn, isDev } from '@core/utils'
import type { ExpressionModule, ExpressionTracking } from './types'

let warnedMissingEngine = false

function resolve(exp: string, data?: Record<string, any>): string
function resolve(exp: undefined, data?: Record<string, any>): undefined
function resolve(
  exp: string | undefined,
  data?: Record<string, any>
): string | undefined
function resolve(exp: string | undefined): string | undefined {
  return exp
}

function warn() {
  if (warnedMissingEngine) return

  warnedMissingEngine = true
  if (isDev()) {
    vfWarn(
      'An expression engine is required for this feature. ' +
        'Install `@vueform/expr-eval` and register it via ' +
        '`createVueform({ plugins: [exprEval()] })`.'
    )
  }
}

// A single shared instance — no tracking is ever activated without an engine,
// so every method is a static no-op and `activate` reports `false`.
const noopTracking: ExpressionTracking = {
  trackable: () => false,
  activate: () => false,
  init: () => {},
  reinit: () => {},
  release: () => {},
  isTracking: () => false,
  track: () => {},
  untrack: () => {},
  notify: () => {},
  notifyInputData: () => {},
}

/**
 * The inert expression surface (`installed: false`) used when the `expression`
 * module is not registered or is disabled (`enabled: false`) — behaves as if
 * expressions weren't there: `resolve` passes input through untouched, no paths
 * are ever reported as used, and tracking never activates. `warn()` fires once
 * in dev when a feature actually requires an engine.
 */
export const noopExpression: ExpressionModule = {
  installed: false,
  resolve,
  usedPaths: () => [],
  warn,
  makeExpressionTracking: () => noopTracking,
}
