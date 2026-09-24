import { computed, toRef } from 'vue'
import type { StandardSchemaV1 } from '@core/types'
import { warn, isDev } from '@core/utils'
import type {
  Issue,
  OwnerView,
  ValidationModule,
  ValidationOwner,
  ValidationView,
  Validator,
} from './types'

let warnedMissingModule = false

const alwaysFalse = computed(() => false)
const alwaysTrue = computed(() => true)
const emptyErrors = computed(() => [] as string[])
const emptyIssues = computed(() => [] as Issue[])
const emptyLanguages = computed(() => new Set<string>())

const emptyView: ValidationView = {
  language: undefined,
  invalid: alwaysFalse,
  pending: alwaysFalse,
  debouncing: alwaysFalse,
  busy: alwaysFalse,
  required: alwaysFalse,
  errors: emptyErrors,
  issues: emptyIssues,
  validated: alwaysTrue,
  validate: async () => true,
  invalidate: () => {},
  reset: () => {},
}

const emptyOwnerView: OwnerView = {
  languages: { default: emptyView },
  invalid: alwaysFalse,
  pending: alwaysFalse,
  debouncing: alwaysFalse,
  validated: alwaysTrue,
  errors: emptyErrors,
  issues: emptyIssues,
}

// Never mutated — shared by every element.
const emptyValidation: Record<string, ValidationView> = { default: emptyView }

// Everything is valid without the module, so the value passes through.
const passthroughSchema: StandardSchemaV1 = {
  '~standard': {
    version: 1,
    vendor: 'vueform',
    validate: (value) => ({ value }),
  },
}

// A single shared instance — noop validators carry no per-form state.
const noopValidator: Validator = {
  issues: emptyIssues,
  errors: emptyErrors,
  invalid: alwaysFalse,
  pending: alwaysFalse,
  debouncing: alwaysFalse,
  wired: false,
  register: () => {},
  unregister: () => {},
  setRules: (_owner, rules) => warnMissingModule(rules),
  setValidationSchema: () => {},
  validate: async () => true,
  invalidate: () => {},
  reset: () => {},
  onChange: () => {},
  repath: () => {},
  view: () => emptyOwnerView,
  toStandardSchema: () => passthroughSchema,
}

function warnMissingModule(rules: unknown) {
  const hasRules = !!rules && (!Array.isArray(rules) || rules.length > 0)
  if (!hasRules || warnedMissingModule) return
  warnedMissingModule = true
  if (isDev()) {
    warn(
      '`rules` were provided but the `validation` ' +
        'module is not registered; skipping validation. Register it ' +
        'via `createVueform({ modules: { validation } })`.'
    )
  }
}

function makeValidationOwner(
  options: Parameters<ValidationModule['makeValidationOwner']>[0]
): ValidationOwner {
  return {
    id: options.id,
    get el$() {
      return options.el$()
    },
    path: options.path,
    dataPath: options.dataPath ?? options.path,
    languages: () =>
      options.translatable() ? options.languages() : ['default'],
    getValue: (language) => {
      const raw = options.value()
      return options.translatable() &&
        language &&
        language !== 'default' &&
        raw &&
        typeof raw === 'object'
        ? raw[language]
        : raw
    },
    bail: options.bail,
    debounce: options.debounce,
    touched: options.touched,
    available: options.available,
  }
}

function attachValidator(_store: object, _validator: Validator) {}

function getAttachedValidator(_store: object): Validator | undefined {
  return undefined
}

function toStandardSchema(
  source: { toStandardSchema?: () => StandardSchemaV1 } | undefined
): StandardSchemaV1 | undefined {
  return source?.toStandardSchema?.()
}

function makeElementValidation(
  options: Parameters<ValidationModule['makeElementValidation']>[0]
) {
  const { el$, rules, path, model, languages, translatable } = options

  const owner = makeValidationOwner({
    id: {},
    path: () => path.value,
    el$,
    translatable: () => translatable.value,
    languages: () => Object.keys(languages.value || {}),
    value: () => model.value,
  })

  const currentValidation = toRef(
    () => emptyValidation.default || ({} as Partial<ValidationView>)
  )

  const validateSelf = async () => true

  const validateCurrent = async () => true

  const initValidation = () => warnMissingModule(rules.value)

  const noop = () => {}

  return {
    validator: noopValidator,
    owner,
    validation: emptyValidation,
    currentValidation,
    hasOwnValidation: alwaysFalse,
    shouldValidate: alwaysFalse,
    success: alwaysTrue,
    required: alwaysFalse,
    invalidLanguages: emptyLanguages,
    ownInvalid: alwaysFalse,
    ownPending: alwaysFalse,
    ownDebouncing: alwaysFalse,
    ownValidated: alwaysTrue,
    ownRuleErrors: emptyErrors,
    validateSelf,
    validateCurrent,
    invalidateSelf: noop,
    unvalidateSelf: noop,
    notifyChange: noop,
    onUserInput: noop,
    onBlur: noop,
    initValidation,
    destroyValidation: noop,
  }
}

function makeFormValidation() {
  const exportStandardSchema = () => passthroughSchema

  return {
    issues: emptyIssues,
    toStandardSchema: exportStandardSchema,
  }
}

/**
 * The inert validation surface used when the `validation` module is not
 * registered — behaves as if validation wasn't there at all: everything is
 * valid, policy predicates return `false`, views are static and empty. Warns
 * once in dev when rules are actually provided.
 */
export const noopValidation: ValidationModule = {
  makeValidator: () => noopValidator,
  makeFormValidation,
  makeElementValidation,
  makeValidationOwner,
  attachValidator,
  getAttachedValidator,
  toStandardSchema,
  hasValidateOnTrigger: () => false,
  shouldValidateLive: () => false,
  shouldValidateOnBlur: () => false,
}
