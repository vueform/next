import { computed } from 'vue'
import { useElementContext, useFormContext } from '~/contexts'
import { getExpressionModule } from '~/modules/expression'
import type { ExpressionableKeys } from '~/types'
import { useConfig } from './useConfig'

/**
 * Expression resolve result: `string` when the input is a string, otherwise
 * `undefined`.
 */
type Resolved<T extends string | undefined> = T extends string
  ? string
  : undefined

/**
 * Provides expression resolution utilities for evaluating dynamic string
 * expressions within form element props. Setup-only: throws when called outside
 * a component setup context. When the `expression` module is not registered,
 * uses the inert passthrough surface (`installed: false`).
 *
 * @private
 */
export function useExpression() {
  const expression = getExpressionModule()

  const { resolve: resolveExpression, warn } = expression

  /**
   * Whether an expression engine is installed and available.
   */
  const installed = expression.installed

  /**
   * The set of model paths referenced by resolved expressions.
   */
  const usedPaths = expression.usedPaths

  const el$ = useElementContext()
  const form$ = useFormContext()
  const config = useConfig()

  const allowList = computed(
    () =>
      (el$?.props as any)?.expressions ??
      (form$?.props as any)?.expressions ??
      config.$expression?.trigger ??
      true
  )

  /**
   * Checks whether expression resolution is allowed for the given prop key.
   *
   * @param key The expressionable prop key to check.
   */
  const allowed = (key: ExpressionableKeys) => {
    if (!installed) return false

    return (
      allowList.value === true ||
      (Array.isArray(allowList.value) && allowList.value.includes(key))
    )
  }

  /**
   * Resolves dynamic expressions in a string value using the form model as
   * context. Passes `undefined` through unchanged.
   *
   * @param value The string value potentially containing expressions, or
   *   `undefined`.
   */
  function resolve<T extends string | undefined>(value: T): Resolved<T> {
    if (
      !value ||
      !installed ||
      typeof value !== 'string' ||
      !value.includes('{')
    ) {
      return value as Resolved<T>
    }

    let data = form$?.model
    const consts = form$?.resolvedConsts
    if (consts && data) {
      data = { ...consts, ...data }
    }

    return resolveExpression(value, data, el$ ?? form$) as Resolved<T>
  }

  /**
   * Resolves expressions in a string value only if expression resolution is
   * allowed for the given prop key. Passes `undefined` through unchanged.
   *
   * @param key The expressionable prop key to check against the allow list.
   * @param value The string value potentially containing expressions, or
   *   `undefined`.
   */
  function resolveIfAllowed<T extends string | undefined>(
    key: ExpressionableKeys,
    value: T
  ): Resolved<T> {
    return (allowed(key) ? resolve(value) : value) as Resolved<T>
  }

  return {
    installed,
    resolve,
    allowed,
    usedPaths,
    resolveIfAllowed,
    warn,
  }
}
