import {
  hasDateModule,
  hasLocaleModule,
  useDate,
  useLocale,
  type DateUnit,
  type DateInstance,
  type FormContext,
  type VueformInstance,
} from '@vueform/core'
import { exprSum, exprFlatten } from './helpers'

/**
 * The context expression functions read from: the owning Vueform instance (set
 * once by the adapter, used to resolve module doorways like date and locale
 * against the right Vueform instance) plus per-evaluation state bound before
 * each `evaluate()` call.
 */
export type ExpressionFunctionContext = {
  vueform?: VueformInstance
  form$?: FormContext
  el$?: any
}

// The translated error placeholder, or plain 'Error' when the locale module
// is not registered (the noop surface would render the raw tag).
function expressionError(vueform?: VueformInstance): string {
  return vueform && hasLocaleModule(vueform)
    ? useLocale(vueform).t('expression_error')
    : 'Error'
}

// Resolves a dot-path prop on an element context. `[n]` index segments are
// normalized to dots (`model[0]` → `model.0`) because the expression pipeline
// rewrites numeric segments into bracket notation even inside quoted args.
function resolveProp(el$: any, prop: string) {
  const keys = prop.replace(/\[(\d+)\]/g, '.$1').split('.')
  let current: any = el$
  for (const key of keys) {
    if (current == null) return undefined
    current = current[key]
  }
  return current
}

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/
const DATETIME_HMS_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
const DATETIME_HM_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
let dateAddWarned = false

function formatLocal(d: DateInstance, includeSeconds: boolean) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const base = `${d.year()}-${pad(d.month())}-${pad(d.date())} ${pad(d.hour())}:${pad(d.minute())}`
  return includeSeconds ? `${base}:${pad(d.second())}` : base
}

export function defineFunction(
  func: (
    ctx: ExpressionFunctionContext
  ) => (...args: any[]) => string | number | boolean
) {
  return func
}

export const NOT = defineFunction(() => (a: any) => !a)

export const EMPTY = defineFunction(
  () => (v: any) =>
    Array.isArray(v) ? !v.length : v === '' || v === null || v === undefined
)

export const NOT_EMPTY = defineFunction(
  () => (v: any) =>
    Array.isArray(v) ? !!v.length : v !== '' && v !== null && v !== undefined
)

export const SUM = defineFunction(
  () =>
    (...args: any[]) =>
      exprSum(args)
)

export const AVG = defineFunction(() => (...args: any[]) => {
  const values = exprFlatten(args, '').filter((v: any) => v !== '')
  if (!values.length) return 0
  return exprSum(args) / (values.length || 1)
})

export const MIN = defineFunction(() => (...args: any[]) => {
  const values = exprFlatten(args, '').filter((v: any) => v !== '')
  if (!values.length) return 0
  return values.sort((a: any, b: any) => a - b)[0]
})

export const MAX = defineFunction(() => (...args: any[]) => {
  const values = exprFlatten(args, '').filter((v: any) => v !== '')
  if (!values.length) return 0
  return values.sort((a: any, b: any) => b - a)[0]
})

export const ROUND = defineFunction(() => (value: any, places: number) => {
  const num = Number(value)
  if (isNaN(num)) return 0
  return Number(num.toFixed(places))
})

export const COUNT = defineFunction(
  () =>
    (...args: any[]) =>
      exprFlatten(args, '').filter((v: any) => v !== '').length
)

export const AGE = defineFunction((ctx) => (value: any) => {
  if (!ctx.vueform || !hasDateModule(ctx.vueform)) {
    console.error(
      '[Vueform error]: Date module is required for the AGE() expression function'
    )
    return expressionError(ctx.vueform)
  }

  const date = useDate(value, undefined, ctx.vueform)

  return date.isValid()
    ? useDate(undefined, undefined, ctx.vueform).diff(date, 'year')
    : ''
})

export const TODAY = defineFunction(() => () => {
  const today = new Date()
  const DD = String(today.getDate()).padStart(2, '0')
  const MM = String(today.getMonth() + 1).padStart(2, '0')
  const YYYY = today.getFullYear()
  return `${YYYY}-${MM}-${DD}`
})

export const NOW = defineFunction(() => () => new Date().toISOString())

export const DATE_ADD = defineFunction(
  (ctx) => (value: any, toAdd: number, interval: DateUnit) => {
    if (!ctx.vueform || !hasDateModule(ctx.vueform)) {
      console.error(
        '[Vueform error]: Date module is required for the DATE_ADD() expression function'
      )
      return expressionError(ctx.vueform)
    }

    const result = useDate(value, undefined, ctx.vueform).add(toAdd, interval)

    if (typeof value === 'string') {
      if (DATE_ONLY_RE.test(value)) return result.toISODate()
      if (DATETIME_HMS_RE.test(value)) return formatLocal(result, true)
      if (DATETIME_HM_RE.test(value)) return formatLocal(result, false)

      if (!dateAddWarned) {
        console.warn(
          '[Vueform warn]: DATE_ADD received a non-standard date format. ' +
            'Install a date plugin to support custom formats. Falling back to YYYY-MM-DD.'
        )
        dateAddWarned = true
      }
    }

    return result.toISODate()
  }
)

export const FORMAT_DATE = defineFunction(
  (ctx) => (value: any, format: string) => {
    if (!ctx.vueform || !hasDateModule(ctx.vueform)) {
      console.error(
        '[Vueform error]: Date module is required for the FORMAT_DATE() expression function'
      )
      return expressionError(ctx.vueform)
    }

    return useDate(value, undefined, ctx.vueform).format(format)
  }
)

export const ENCODE_URI = defineFunction(
  () => (value: any) => (value == null ? '' : encodeURI(String(value)))
)

export const DECODE_URI = defineFunction(
  () => (value: any) => (value == null ? '' : decodeURI(String(value)))
)

export const ENCODE_URI_COMPONENT = defineFunction(
  () => (value: any) => (value == null ? '' : encodeURIComponent(String(value)))
)

export const DECODE_URI_COMPONENT = defineFunction(
  () => (value: any) => (value == null ? '' : decodeURIComponent(String(value)))
)

export const CONCAT = defineFunction(
  () =>
    (...args: any[]) =>
      args.reduce((acc, v) => acc + (v ?? ''), '')
)

export const LC = defineFunction(
  () => (value: any) => (value == null ? '' : String(value).toLowerCase())
)

export const UC = defineFunction(
  () => (value: any) => (value == null ? '' : String(value).toUpperCase())
)

export const UCF = defineFunction(() => (value: any) => {
  if (value == null) return ''
  const str = String(value)
  return str.charAt(0).toUpperCase() + str.slice(1)
})

export const PROP = defineFunction((ctx) => (path: string, prop: string) => {
  // Read form$ from the live eval context — expression is app-scoped, so
  // form$ is bound per resolve() rather than at provider creation.
  // The expression pipeline rewrites numeric and wildcard path segments
  // into bracket notation even inside quoted args (list.0.item →
  // list[0].item), but elements register with dot-notation paths.
  const el$ = (ctx.form$ as any)?.find(path.replace(/\[(\d+)\]/g, '.$1'))
  if (!el$) return undefined

  return resolveProp(el$, prop)
})

export const SELF = defineFunction((ctx) => (prop: string) => {
  const el$ = ctx.el$
  if (!el$) return undefined

  return resolveProp(el$, prop)
})
