import {
  computed,
  isRef,
  unref,
  type ComputedRef,
  type MaybeRef,
  type Ref,
} from 'vue'
import { useExpression } from './useExpression'
import { useLocale } from './useLocale'
import { useSecurity } from './useSecurity'
import { useConfig } from '.'
import type { DProp } from '#core/types'
import { useComponentContext } from '#core/contexts'
import { containsHtml, normalize, resolveIcon, toKebabCase } from '#core/utils'

/**
 * Extracts the underlying value type from a `DProp` by unwrapping its `Ref`
 * member — the only union member where the value type appears alone. Falls back
 * to the type itself for non-dynamic values.
 */
type UnwrapDynamicProp<D> = [Extract<D, Ref<any>>] extends [never]
  ? Exclude<D, undefined>
  : [Extract<D, Ref<any>>] extends [Ref<infer T>]
    ? T
    : Exclude<D, undefined>

/**
 * The computed's value type: the return override `V` when provided, otherwise
 * the value type unwrapped from the prop's declared type.
 */
type ResolvedValue<V, D> = [V] extends [void] ? UnwrapDynamicProp<D> : V

/**
 * Pre-resolved module helpers passed into the shared dynamic-prop computed
 * factory.
 */
type DynamicPropHelpers = {
  /**
   * Expression module instance used to resolve string expressions.
   */
  expression: ReturnType<typeof useExpression>

  /**
   * App config, when icon resolution is enabled.
   */
  config?: ReturnType<typeof useConfig>

  /**
   * Locale `localize` function, when localization is enabled.
   */
  localize?: (value: string | Record<string, string>) => string

  /**
   * The security module's `sanitizeHtml`, when sanitization is enabled.
   */
  sanitize?: (value?: string) => string

  /**
   * The security module's `sanitizeUrl`, when URL validation is enabled.
   */
  sanitizeUrl?: (url: unknown, schemes: string[]) => string | undefined
}

/**
 * Factory function signature for resolving raw dynamic prop values into
 * computeds. Helpers are pre-bound so the maker can be called after setup —
 * including inside other computeds.
 */
type MakeDynamicPropFn = {
  /**
   * Resolves a raw dynamic prop value into an expression-aware computed.
   *
   * @param key The expression allow-list key.
   * @param prop The dynamic prop value or ref to resolve.
   * @param options Resolution options.
   */
  <V = any, T = any>(
    key: string,
    prop: MaybeRef<DProp<T> | undefined>,
    options?: UseDynamicPropOptions<V, T>
  ): ComputedRef<any>

  /**
   * Resolves an unknown prop value into an expression-aware computed.
   *
   * @param key The expression allow-list key.
   * @param prop The unknown prop value or ref to attempt to resolve.
   * @param options Resolution options.
   */
  (
    key: string,
    prop: MaybeRef<unknown>,
    options?: UseDynamicPropOptions
  ): ComputedRef<any>
}

/**
 * Options for resolving a dynamic prop.
 */
type UseDynamicPropOptions<V = any, T = any> = {
  /**
   * The component context passed to contextual functions. Falls back to the
   * nearest component context when not provided.
   */
  context$?: any

  /**
   * Overrides the key used when checking whether expressions are allowed. When
   * omitted, defaults to the kebab-case form of the first argument.
   */
  key?: string

  /**
   * Fallback value returned when the prop is `undefined` or resolves to an
   * empty string.
   */
  default?: any

  /**
   * Whether to localize the resolved value. When enabled, strings and locale
   * record objects are passed through the locale module before further
   * processing.
   */
  localize?: boolean

  /**
   * Whether to run the resolved string through the security module's
   * `sanitizeHtml` — only when it actually contains markup (`containsHtml`), so
   * plain text never touches the engine (no mangling of comparisons like `score
   * < 10`, and no interaction with the engineless production fallback). Runs
   * after localization and expression resolution, so the sanitizer sees the
   * final bytes.
   */
  sanitize?: boolean

  /**
   * URL schemes the resolved value may carry, without the trailing colon (e.g.
   * `['http', 'https']`). Relative URLs always pass; a value with any other
   * scheme — `javascript:` above all — resolves to `undefined` with a dev
   * warning (the security module's `sanitizeUrl`; without the module, URLs pass
   * through unchecked). Validation runs on the final string, after localization
   * and expression resolution.
   */
  safeUrl?: string[]

  /**
   * Whether to coerce the resolved value to a string. When enabled and no
   * `transform` is provided, `undefined` and empty values become `''` and all
   * other values are passed through `String()`. The computed is typed as
   * `string` (never `undefined`).
   */
  string?: boolean

  /**
   * Whether to convert the resolved value to a number. When enabled and no
   * `transform` is provided, empty or undefined values resolve to `undefined`
   * and all other values are passed through `Number()`.
   */
  number?: boolean

  /**
   * Whether to convert the resolved value to a `Date`. When enabled and no
   * `transform` is provided, string values are passed through `new Date()` and
   * non-string values are returned as-is.
   */
  date?: boolean

  /**
   * Whether to resolve the value as an icon CSS class string via the config
   * icon resolver. When enabled and no `transform` is provided, string values
   * are resolved through the config icon helper (`$`-prefixed names are mapped
   * through the semantic `config.icons` map first) and non-string values
   * resolve to `undefined`.
   */
  icon?: boolean

  /**
   * When truthy, appends a required marker (`*`) to the resolved string. The
   * caller decides whether the marker should appear — pass a ref or computed
   * that encodes that decision.
   */
  required?: MaybeRef<boolean>

  /**
   * Transforms the resolved value before returning. When provided, replaces the
   * default `normalize` step and its return type becomes the computed's value
   * type.
   *
   * @param value The resolved value after expression evaluation.
   */
  transform?: (value: T | (string & {}) | undefined) => V | undefined
}

/**
 * Binds helpers for a dynamic-prop resolution based on the given options.
 *
 * @param options Resolution options controlling which helpers to load.
 */
/**
 * Creates a computed that resolves a dynamic prop value using pre-bound
 * helpers. Shared by `useDynamicProp` and `useDynamicPropFactory`.
 *
 * @param getProp Reads the current raw prop value.
 * @param exprKey Key used for expression allow-list checks.
 * @param options Resolution options.
 * @param helpers Pre-bound helpers used during resolution.
 */
function createDynamicPropComputed(
  getProp: () => any,
  exprKey: string,
  options: UseDynamicPropOptions,
  helpers: DynamicPropHelpers
): ComputedRef<any> {
  const context$ = options.context$
  const transform = (value: any) => {
    return options.transform ? options.transform(value) : value
  }

  const finalize = (result: any) => {
    if (options.string && result === undefined) {
      result = ''
    }

    if (typeof result === 'string' && unref(options.required)) {
      result += '*'
    }

    return result
  }

  return computed(() => {
    let p = getProp()

    if (isRef(p)) {
      p = unref(p)
    }

    if (p === undefined) {
      return finalize(options.default ?? transform(undefined))
    }

    let value: unknown =
      typeof p === 'function' ? (p as (context$: any) => unknown)(context$) : p

    if (
      helpers.localize &&
      (typeof value === 'string' ||
        (typeof value === 'object' && value !== null))
    ) {
      value = helpers.localize(value as string | Record<string, string>)
    }

    if (typeof value === 'string' && helpers.expression.allowed(exprKey)) {
      value = helpers.expression.resolve(value)
    }

    if (typeof value === 'string' && helpers.sanitize && containsHtml(value)) {
      value = helpers.sanitize(value)
    }

    if (options.safeUrl && helpers.sanitizeUrl && typeof value === 'string') {
      value = helpers.sanitizeUrl(value, options.safeUrl)
    }

    if (value === '') {
      return finalize(options.default ?? transform(undefined))
    }

    let result: any

    if (options.transform) {
      result = transform(value)
    } else if (options.string) {
      result = value !== undefined ? String(value) : ''
    } else if (options.number) {
      result = value !== '' && value !== undefined ? Number(value) : undefined
    } else if (options.date) {
      result =
        typeof value === 'string'
          ? new Date(value)
          : (value as Date | undefined)
    } else if (options.icon && helpers.config) {
      result =
        typeof value === 'string'
          ? resolveIcon(helpers.config, value)
          : undefined
    } else {
      result = normalize(value)
    }

    return finalize(result)
  })
}

function resolveDynamicPropHelpers(
  options: UseDynamicPropOptions
): DynamicPropHelpers {
  return {
    expression: useExpression(),
    config: options.icon ? useConfig() : undefined,
    sanitize: options.sanitize ? useSecurity().sanitizeHtml : undefined,
    sanitizeUrl: options.safeUrl ? useSecurity().sanitizeUrl : undefined,
    localize: options.localize ? useLocale().localize : undefined,
  }
}

/**
 * Resolves a raw ref value into an expression-aware computed.
 *
 * @private
 * @param key The expression allow-list key.
 * @param prop The dynamic prop value ref to resolve.
 * @param options Resolution options.
 */
export function useDynamicProp(
  key: string,
  prop: Ref<any>,
  options: UseDynamicPropOptions<void, any> & { string: true }
): ComputedRef<string>

export function useDynamicProp(
  key: string,
  prop: Ref<any>,
  options: UseDynamicPropOptions<void, any> & { number: true }
): ComputedRef<number | undefined>

export function useDynamicProp(
  key: string,
  prop: Ref<any>,
  options: UseDynamicPropOptions<void, any> & { date: true }
): ComputedRef<Date | undefined>

export function useDynamicProp(
  key: string,
  prop: Ref<any>,
  options: UseDynamicPropOptions<void, any> & { icon: true }
): ComputedRef<string | undefined>

export function useDynamicProp<V = void, T = any>(
  key: string,
  prop: Ref<T>,
  options?: UseDynamicPropOptions<V, UnwrapDynamicProp<T>>
): ComputedRef<ResolvedValue<V, T> | undefined>

/**
 * Resolves a `DProp` from a props object into an expression-aware computed. The
 * computed's value type is inferred from the prop's declared type, or the
 * `transform` option's return type when provided.
 *
 * @private
 * @param name The prop name (key in the props object).
 * @param props The component props object.
 * @param options Resolution options.
 */
export function useDynamicProp<
  P extends Record<string, any>,
  K extends keyof P & string,
>(
  name: K,
  props: P,
  options: UseDynamicPropOptions<void, UnwrapDynamicProp<P[K]>> & {
    string: true
  }
): ComputedRef<string>

export function useDynamicProp<
  P extends Record<string, any>,
  K extends keyof P & string,
>(
  name: K,
  props: P,
  options: UseDynamicPropOptions<void, UnwrapDynamicProp<P[K]>> & {
    number: true
  }
): ComputedRef<number | undefined>

export function useDynamicProp<
  P extends Record<string, any>,
  K extends keyof P & string,
>(
  name: K,
  props: P,
  options: UseDynamicPropOptions<void, UnwrapDynamicProp<P[K]>> & {
    date: true
  }
): ComputedRef<Date | undefined>

export function useDynamicProp<
  P extends Record<string, any>,
  K extends keyof P & string,
>(
  name: K,
  props: P,
  options: UseDynamicPropOptions<void, UnwrapDynamicProp<P[K]>> & {
    icon: true
  }
): ComputedRef<string | undefined>

export function useDynamicProp<
  V = void,
  P extends Record<string, any> = Record<string, any>,
  K extends keyof P & string = keyof P & string,
>(
  name: K,
  props: P,
  options?: UseDynamicPropOptions<V, UnwrapDynamicProp<P[K]>>
): ComputedRef<ResolvedValue<V, P[K]> | undefined>

export function useDynamicProp(
  nameOrKey: string,
  propsOrProp: Record<string, any> | Ref<any>,
  options: UseDynamicPropOptions = {}
): ComputedRef<any> {
  const context$ = options.context$ ?? useComponentContext()
  const helpers = resolveDynamicPropHelpers(options)

  if (isRef(propsOrProp)) {
    return createDynamicPropComputed(
      () => unref(propsOrProp),
      options.key ?? nameOrKey,
      { ...options, context$ },
      helpers
    )
  }

  const props = propsOrProp as Record<string, any>

  return createDynamicPropComputed(
    () => props[nameOrKey],
    options.key ?? toKebabCase(nameOrKey),
    { ...options, context$ },
    helpers
  )
}

/**
 * Creates a factory function for resolving raw dynamic prop values into
 * expression-aware computeds. Helpers are bound once so the returned maker can
 * be invoked outside of setup (e.g. inside `reactiveComputed`).
 *
 * @private
 */
export function useDynamicPropFactory(): MakeDynamicPropFn {
  const expression = useExpression()
  const config = useConfig()
  const { sanitizeHtml, sanitizeUrl } = useSecurity()
  const { localize } = useLocale()
  const defaultContext$ = useComponentContext()

  /**
   * Resolves a raw dynamic prop value into an expression-aware computed.
   *
   * @param key The expression allow-list key.
   * @param prop The dynamic prop value or ref to resolve.
   * @param options Resolution options.
   */
  function makeDynamicProp(
    key: string,
    prop: MaybeRef<unknown>,
    options: UseDynamicPropOptions = {}
  ): ComputedRef<any> {
    return createDynamicPropComputed(
      () => unref(prop),
      options.key ?? key,
      { ...options, context$: options.context$ ?? defaultContext$ },
      {
        expression,
        config: options.icon ? config : undefined,
        localize: options.localize ? localize : undefined,
        sanitize: options.sanitize ? sanitizeHtml : undefined,
        sanitizeUrl: options.safeUrl ? sanitizeUrl : undefined,
      }
    )
  }

  return makeDynamicProp
}
