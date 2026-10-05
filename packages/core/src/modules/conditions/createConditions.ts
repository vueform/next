import {
  computed,
  effectScope,
  isRef,
  onScopeDispose,
  ref,
  shallowRef,
  unref,
  watch,
  type EffectScope,
  type MaybeRef,
  type Ref,
  type WatchSource,
} from 'vue'
import type { VueformInstance } from '#core/helpers'
import type { FormContext } from '#core/types'
import type {
  ConditionalProp,
  ConditionsModule,
  ConditionsResult,
  ConditionsTriggerProp,
} from './types'
import { useDate } from '#core/composables'
import { getExpressionModule } from '#core/modules/expression'
import {
  alwaysTrue as alwaysAvailable,
  debounce,
  get as getByPath,
  isThenable,
  normalize,
  replaceWildcards,
  warn as vfWarn,
  isDev,
} from '#core/utils'

interface ConditionRelativeOperands {
  '>': string | number
  '>=': string | number
  '<': string | number
  '<=': string | number
  '==':
    | string
    | number
    | boolean
    | null
    | undefined
    | Array<string | number | boolean | undefined | null>
  '!=':
    | string
    | number
    | boolean
    | null
    | undefined
    | Array<string | number | boolean | undefined | null>
  between: [string | number, string | number]
  in: Array<string | number>
  not_in: Array<string | number>
  before: 'today' | string
  after: 'today' | string
  '^': string | number
  $: string | number
  '*': string | number
}

// Tuples and arrays are readonly so const-narrowed schema literals (what
// `defineSchema`'s `const S` produces) are accepted; mutable spellings remain
// assignable to them.
type StructuredCondition =
  | readonly [string, 'empty' | 'not_empty' | 'today']
  | {
      [K in keyof ConditionRelativeOperands]: readonly [
        string,
        K,
        ConditionRelativeOperands[K],
      ]
    }[keyof ConditionRelativeOperands]

type EvaluationScope = {
  model: MaybeRef<Record<string, any> | undefined>
  context$: any
  form$?: FormContext
  path?: string
  valueFormat?: string
  warnMissingForm: () => void
}

export type RawConditionsProp<TContext = any> =
  | string // expression
  | boolean // static boolean
  | Ref<boolean> // reactive boolean
  | ((context$: TContext) => boolean | Promise<boolean>)
  | readonly StructuredCondition[] // AND types
  | readonly (readonly StructuredCondition[])[] // OR types

export type NegatedConditionsProp<TContext = any> = {
  not: RawConditionsProp<TContext>
}

export interface MakeConditionalOptions {
  path?: MaybeRef<string>
  debounce?: MaybeRef<number | undefined>
  trigger?: MaybeRef<ConditionsTriggerProp | undefined>
  valueFormat?: MaybeRef<string | undefined>
  form$?: FormContext
}

function isNegated(
  conditions: ConditionalProp
): conditions is NegatedConditionsProp {
  return (
    typeof conditions === 'object' &&
    !Array.isArray(conditions) &&
    !isRef(conditions) &&
    'not' in conditions
  )
}

function hasConditions(conditions: ConditionalProp | undefined): boolean {
  if (conditions == null) return false
  if (isNegated(conditions)) {
    return hasConditions(conditions.not)
  }
  if (isRef(conditions)) return true
  if (Array.isArray(conditions)) return conditions.length > 0
  return true
}

/**
 * Creates a conditions instance. Date comparisons resolve their adapter via the
 * config's date module and expression conditions resolve through the config's
 * expression module.
 *
 * @param vueform The owning instance (uses `$conditions.strict` /
 *   `$conditions.debounce`).
 */
export function createConditions(vueform: VueformInstance): ConditionsModule {
  const config = vueform.config
  const { strict, debounce: debounceDefault } = config.$conditions ?? {}

  const check = (
    conditions: ConditionalProp,
    scope: EvaluationScope
  ): boolean => {
    if (isNegated(conditions)) {
      return !check(conditions.not, scope)
    }

    if (isRef(conditions)) {
      return !!unref(conditions)
    }

    if (typeof conditions === 'function') {
      return (conditions as (context$: any) => boolean)(scope.context$)
    }

    if (typeof conditions === 'string') {
      return checkExpr(conditions, scope)
    }

    if (typeof conditions === 'boolean') {
      return conditions
    }

    if (!Array.isArray(conditions)) {
      throw new Error(
        'Conditions must be a Ref<boolean>, string, function, or array'
      )
    }

    if (conditions.length === 0) {
      return true
    }

    // Single structured condition: ['field', '==', 'value']
    if (typeof conditions[0] === 'string') {
      return checkStructured(
        conditions as unknown as StructuredCondition,
        scope
      )
    }

    // Multiple structured conditions (AND + OR groups)
    return conditions.every((condition) => {
      if (!Array.isArray(condition)) {
        throw new Error('Structured condition members must be arrays')
      }

      // Structured condition in AND group: ['field', '==', 'value']
      if (typeof condition[0] === 'string') {
        return checkStructured(
          condition as unknown as StructuredCondition,
          scope
        )
      }

      // OR group: at least one must be fulfilled
      return condition.some((orCondition) => {
        if (!Array.isArray(orCondition)) {
          throw new Error(
            'OR group members must be structured conditions (arrays)'
          )
        }

        return checkStructured(
          orCondition as unknown as StructuredCondition,
          scope
        )
      })
    })
  }

  const checkStructured = (
    [targetPath, operator, expected]: StructuredCondition,
    scope: EvaluationScope
  ) => {
    const { model, context$, form$, path } = scope
    const atIdx = targetPath.indexOf('@')
    const propPath = atIdx !== -1 ? targetPath.slice(atIdx + 1) : null
    let elPath = atIdx !== -1 ? targetPath.slice(0, atIdx) : targetPath

    if (path) {
      elPath = replaceWildcards(elPath, path)
    }

    if (
      expected === undefined &&
      !['empty', 'not_empty', 'today'].includes(operator)
    ) {
      expected = operator
      operator = '=='
      vfWarn(
        'Using conditions without an operator is deprecated, use `==` instead'
      )
    }

    // Structured condition paths are element paths — resolving them requires
    // the form's element registry.
    if (!form$) {
      scope.warnMissingForm()
      return false
    }

    let actual: any

    const other$ = form$.find(elPath)

    if (
      !other$ ||
      (!other$.available &&
        context$ &&
        !hasCircularReference(context$, other$, path))
    )
      return false

    if (propPath) {
      actual = getByPath(other$, propPath)
    } else {
      if (!unref(other$.dataPath)) {
        throw new Error('Conditions can only target elements with a data model')
      }

      actual = unref(model)

      for (const key of unref(other$.dataPath).split('.')) {
        if (!actual) break
        actual = actual[key]
      }
    }

    return compare(actual, operator, expected, scope.valueFormat)
  }

  const compare = (
    actual: any,
    operator: string,
    expected: any,
    dateFormat?: string
  ): boolean => {
    if (!operator) {
      return false
    }

    actual = Array.isArray(actual)
      ? actual.map((e) => normalize(e))
      : normalize(actual)
    expected = Array.isArray(expected)
      ? expected.map((e) => normalize(e))
      : normalize(expected)

    switch (operator.toLowerCase()) {
      case '>':
        return Array.isArray(actual)
          ? actual.every((a) => a > expected)
          : actual > expected

      case '>=':
        return Array.isArray(actual)
          ? strict
            ? actual.every(
                (a) =>
                  a >= expected && a !== null && a !== undefined && a !== ''
              )
            : actual.every((a) => a >= expected)
          : strict
            ? actual >= expected &&
              actual !== null &&
              actual !== undefined &&
              actual !== ''
            : actual >= expected

      case '<':
        return Array.isArray(actual)
          ? strict
            ? actual.every(
                (a) => a < expected && a !== null && a !== undefined && a !== ''
              )
            : actual.every((a) => a < expected)
          : strict
            ? actual < expected &&
              actual !== null &&
              actual !== undefined &&
              actual !== ''
            : actual < expected

      case '<=':
        return Array.isArray(actual)
          ? strict
            ? actual.every(
                (a) =>
                  a <= expected && a !== null && a !== undefined && a !== ''
              )
            : actual.every((a) => a <= expected)
          : strict
            ? actual <= expected &&
              actual !== null &&
              actual !== undefined &&
              actual !== ''
            : actual <= expected

      case 'between':
        return actual > expected[0] && actual < expected[1]

      case 'empty':
        if (Array.isArray(actual)) {
          return !actual.length
        } else if (actual && actual instanceof File) {
          return false
        } else if (actual && actual instanceof Blob) {
          return false
        } else if (actual && typeof actual === 'object') {
          let values = Object.values(actual)

          return (
            !values.length ||
            values.every((v) => {
              if (Array.isArray(v)) {
                return !v.length
              } else if (v && typeof v === 'object') {
                return Object.values(v).every((ov) => {
                  if (Array.isArray(ov)) {
                    return !ov.length
                  } else {
                    return ['', null, undefined].indexOf(ov) !== -1
                  }
                })
              } else {
                return ['', null, undefined].indexOf(v as any) !== -1
              }
            })
          )
        } else {
          return ['', null, undefined].indexOf(actual) !== -1
        }

      case 'not_empty':
        if (Array.isArray(actual)) {
          return !!actual.length
        } else if (actual && actual instanceof File) {
          return true
        } else if (actual && actual instanceof Blob) {
          return true
        } else if (actual && typeof actual === 'object') {
          let values = Object.values(actual)

          return (
            !!values.length &&
            values.some((v) => {
              if (Array.isArray(v)) {
                return !!v.length
              } else if (v && typeof v === 'object') {
                return Object.values(v).some((ov) => {
                  if (Array.isArray(ov)) {
                    return !!ov.length
                  } else {
                    return ['', null, undefined].indexOf(ov) === -1
                  }
                })
              } else {
                return ['', null, undefined].indexOf(v as any) === -1
              }
            })
          )
        } else {
          return ['', null, undefined].indexOf(actual) === -1
        }

      case '==':
      case 'in':
        if (Array.isArray(expected)) {
          if (Array.isArray(actual)) {
            // ['checkboxes', [1,2,3]]
            return !expected.length
              ? !actual.length
              : actual.filter((a) => expected.includes(a)).length > 0
          } else {
            // ['text', [1,2,3]]
            return expected.indexOf(actual) !== -1
          }
        } else {
          if (Array.isArray(actual)) {
            // ['checkboxes', 1]
            return actual.indexOf(expected) !== -1
          } else {
            // ['text', 1]
            return actual == expected
          }
        }

      case '!=':
      case 'not_in':
        if (Array.isArray(expected)) {
          if (Array.isArray(actual)) {
            // ['checkboxes', 'not_in', [1,2,3]]
            return !expected.length
              ? !!actual.length
              : actual.filter((e) => expected.includes(e)).length == 0
          } else {
            // ['text', 'not_in', [1,2,3]]
            return expected.indexOf(actual) === -1
          }
        } else {
          if (Array.isArray(actual)) {
            // ['checkboxes', '!=', 1]
            return actual.indexOf(expected) === -1
          } else {
            // ['text', '!=', 1]
            return actual != expected
          }
        }

      // Date comparisons are on-demand: the date module is only resolved when
      // a date-based condition actually evaluates (throws when not registered).
      case 'today':
        if (!Array.isArray(actual)) {
          actual = [actual]
        }

        return (
          actual.length &&
          actual.every((a: any) =>
            useDate(a, dateFormat, vueform).isSame(
              useDate(undefined, undefined, vueform),
              'day'
            )
          )
        )

      case 'before':
        if (!Array.isArray(actual)) {
          actual = [actual]
        }

        return (
          actual.length &&
          actual.every((a: any) => {
            let date = useDate(a, dateFormat, vueform)

            return (
              date.isValid() &&
              date.isBefore(
                useDate(
                  expected === 'today' ? undefined : expected,
                  undefined,
                  vueform
                ),
                'day'
              )
            )
          })
        )

      case 'after':
        if (!Array.isArray(actual)) {
          actual = [actual]
        }

        return (
          actual.length &&
          actual.every((a: any) => {
            let date = useDate(a, dateFormat, vueform)

            return (
              date.isValid() &&
              date.isAfter(
                useDate(
                  expected === 'today' ? undefined : expected,
                  undefined,
                  vueform
                ),
                'day'
              )
            )
          })
        )

      case '^':
        return String(actual).startsWith(expected)

      case '$':
        return String(actual).endsWith(expected)

      case '*':
        return String(actual).includes(expected)

      default:
        // @todo: add extendable operators
        // const customOperators = el$.config.operators || {}

        // if (customOperators[operator]) {
        //   return customOperators[operator](actual, expected, el$) as boolean
        // }
        return false
    }
  }

  const checkExpr = (condition: string, scope: EvaluationScope) => {
    if (!/^{/.test(condition) && !/}$/.test(condition)) {
      condition = `{${condition}}`
    }

    const expression = getExpressionModule(vueform)

    if (!expression.installed) {
      expression.warn()
      return false
    }

    return (
      expression.resolve(
        condition,
        unref(scope.model) || {},
        scope.context$
      ) === 'true'
    )
  }

  const hasCircularReference = (
    current$: any,
    other$: any,
    path?: string
  ): boolean => {
    if (!current$ || !other$?.props?.conditions || !path) return false

    let conditions = other$.props.conditions as ConditionalProp
    if (isNegated(conditions)) conditions = conditions.not

    if (typeof conditions === 'function' || isRef(conditions)) {
      return false
    }

    if (typeof conditions === 'string') {
      return getExpressionModule(vueform)
        .usedPaths(`{${conditions}}`, path)
        .includes(path)
    }

    if (!Array.isArray(conditions)) return false

    const elPathOf = (p: string) => {
      const i = p.indexOf('@')
      return i !== -1 ? p.slice(0, i) : p
    }

    // Single structured condition
    if (typeof conditions[0] === 'string') {
      return replaceWildcards(elPathOf(conditions[0]), path) === path
    }

    // Multiple structured conditions (AND + OR)
    return conditions.some((condition) => {
      if (!Array.isArray(condition)) return false

      if (typeof condition[0] === 'string') {
        return replaceWildcards(elPathOf(condition[0] as string), path) === path
      }

      return condition.some((orCondition) => {
        if (!Array.isArray(orCondition)) return false
        return (
          replaceWildcards(elPathOf(orCondition[0] as string), path) === path
        )
      })
    })
  }

  const createEvaluator = (
    model: MaybeRef<Record<string, any> | undefined>,
    context$: any,
    options?: MakeConditionalOptions
  ) => {
    const form$: FormContext | undefined = options?.form$ ?? context$?.form$

    const debounceDelay = computed(
      () => unref(options?.debounce) ?? debounceDefault ?? 300
    )

    let warnedMissingForm = false
    const warnMissingForm = () => {
      if (warnedMissingForm) return
      warnedMissingForm = true

      if (isDev()) {
        vfWarn(
          'Structured conditions target element paths, which require a form context (`form$`); resolving as unmet.'
        )
      }
    }

    // @todo: add similar fix than in makeItems to avoid retriggering
    // when the value is an inline array in vue template
    const triggerSource: WatchSource = () => {
      const trigger = unref(options?.trigger)

      if (Array.isArray(trigger)) {
        return trigger.map((p: string) => (form$ ? form$.get(p) : undefined))
      }

      if (isRef(trigger)) {
        return unref(trigger)
      }

      if (typeof trigger === 'function') {
        return trigger(context$)
      }

      return unref(model)
    }

    const makeScope = (): EvaluationScope => ({
      model,
      context$,
      form$,
      path: unref(options?.path),
      valueFormat: unref(options?.valueFormat),
      warnMissingForm,
    })

    const isEvaluable = (v: unknown): v is ConditionalProp =>
      typeof v === 'function' ||
      typeof v === 'string' ||
      typeof v === 'boolean' ||
      isRef(v) ||
      Array.isArray(v) ||
      isNegated(v as ConditionalProp)

    const resolveFn = (
      raw: ConditionalProp | undefined
    ): { negated: boolean; fn: ((ctx$: any) => any) | undefined } => {
      if (raw && isNegated(raw)) {
        const inner = raw.not
        return {
          negated: true,
          fn: typeof inner === 'function' ? inner : undefined,
        }
      }
      return {
        negated: false,
        fn: typeof raw === 'function' ? raw : undefined,
      }
    }

    const warn = (message: string, error: unknown) => {
      if (isDev()) {
        vfWarn(`${message}`, error)
      }
    }

    const sniffAsync = (get: () => ConditionalProp | undefined): boolean => {
      const { fn } = resolveFn(get())
      if (!fn) return false
      try {
        return isThenable(fn(context$))
      } catch {
        return false
      }
    }

    const buildSync = (get: () => ConditionalProp | undefined): Ref<boolean> =>
      computed(() => {
        const raw = get()
        if (raw === undefined || raw === null) return false
        if (!isEvaluable(raw)) return !!raw
        const value = check(raw, makeScope())
        return isThenable(value) ? false : value
      })

    const buildAsync = (
      get: () => ConditionalProp | undefined
    ): Ref<boolean> => {
      const result = ref(false)
      let token = 0

      const run = () => {
        const { fn, negated } = resolveFn(get())

        if (!fn) {
          result.value = false
          return
        }

        const current = ++token
        let raw: any

        try {
          raw = fn(context$)
        } catch (error) {
          if (current === token) result.value = false
          warn(
            'An async condition threw an error; treating it as unmet.',
            error
          )
          return
        }

        if (!isThenable(raw)) {
          if (current === token) result.value = negated ? !raw : !!raw
          return
        }

        Promise.resolve(raw)
          .then((value) => {
            if (current !== token) return
            result.value = negated ? !value : !!value
          })
          .catch((error) => {
            if (current !== token) return
            result.value = false
            warn('An async condition rejected; treating it as unmet.', error)
          })
      }

      run()
      watch(get, run)

      const debouncedRun = debounce(run, debounceDelay)
      const stopTrigger = watch(triggerSource, debouncedRun, { deep: true })

      onScopeDispose(() => {
        debouncedRun.cancel()
        stopTrigger()
      })

      return result
    }

    const evaluate = (
      conditions: MaybeRef<ConditionalProp | undefined>
    ): Ref<boolean> => {
      const get = () => unref(conditions)

      let activeResult: Ref<boolean> = ref(false)
      const rebuilds = ref(0)

      let isAsync: boolean | undefined
      let scope: EffectScope | undefined

      const build = () => {
        const next = sniffAsync(get)

        if (isAsync !== undefined && next === isAsync) return

        isAsync = next
        scope?.stop()
        scope = effectScope(true)
        scope.run(() => {
          activeResult = next ? buildAsync(get) : buildSync(get)
        })
        rebuilds.value++
      }

      build()
      watch(get, build)
      onScopeDispose(() => scope?.stop())

      return computed(() => {
        void rebuilds.value
        return activeResult.value
      })
    }

    const evaluateList = <T>(
      source: Ref<T[]>,
      getConditions: (item: T) => ConditionalProp | undefined
    ): Ref<Ref<boolean>[]> => {
      const availabilities = shallowRef<Ref<boolean>[]>([])
      let listScope: EffectScope | undefined

      const rebuild = () => {
        listScope?.stop()
        listScope = effectScope(true)
        listScope.run(() => {
          availabilities.value = source.value.map((item) => {
            const conditions = getConditions(item)
            return hasConditions(conditions)
              ? evaluate(conditions)
              : alwaysAvailable
          })
        })
      }

      watch(source, rebuild, { immediate: true, deep: true })
      onScopeDispose(() => listScope?.stop())

      return availabilities
    }

    return { evaluate, evaluateList }
  }

  // Intake accepts the widened `ConditionsResult` (function-produced
  // conditions arrive without tuple narrowing); the evaluator validates
  // structure dynamically, so internally everything stays `ConditionalProp`.
  const makeConditional = (
    conditions: MaybeRef<ConditionsResult | undefined>,
    model: MaybeRef<Record<string, any> | undefined>,
    context$: any,
    options?: MakeConditionalOptions
  ): Ref<boolean> =>
    createEvaluator(model, context$, options).evaluate(
      conditions as MaybeRef<ConditionalProp | undefined>
    )

  const makeConditionalList = <T>(
    source: Ref<T[]>,
    getConditions: (item: T) => ConditionsResult | undefined,
    model: MaybeRef<Record<string, any> | undefined>,
    context$: any,
    options?: MakeConditionalOptions
  ): Ref<Ref<boolean>[]> =>
    createEvaluator(model, context$, options).evaluateList(
      source,
      getConditions as (item: T) => ConditionalProp | undefined
    )

  return {
    makeConditional,
    makeConditionalList,
  }
}
