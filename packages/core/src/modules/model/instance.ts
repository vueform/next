import {
  computed,
  effectScope,
  isRef,
  markRaw,
  ref,
  unref,
  watch,
  type Ref,
} from 'vue'

import { useSubmission } from '#src/composables/useSubmission'
import {
  createEvents,
  getAttachedValidationSchema,
  type VueformInstance,
} from '#src/helpers'
import { getExpressionModule } from '#src/modules/expression'
import { getHttpModule } from '#src/modules/http'
import type { FormSchema, LanguagesProp, StandardSchemaV1 } from '#src/types'
import { clone, equals, isDev, mergeOrReplace, warn } from '#src/utils'

import { makeChildModel, makeRootModel } from './binding'
import { makeEngine } from './engine'
import { getModelEvents, hasModelStore, setInternals } from './internals'
import { makeModelStore } from './store'
import type {
  ModelInstance,
  ModelModule,
  UseModelSubmissionOptions,
} from './types'
import {
  buildSchemaIndex,
  makeMountedNode,
  reconcileData,
  reconcileSchemaIndex,
} from './walk'

function makeModel(
  vueform: VueformInstance,
  options: {
    schema: FormSchema | Ref<FormSchema>
    validationSchema?: StandardSchemaV1
    languages?: LanguagesProp
  } & UseModelSubmissionOptions,
  model?: Record<string, any>
): ModelInstance {
  const { schema, validationSchema: explicitValidationSchema } = options

  const buildOptions = { vueform, languages: options.languages }

  const validationSchema =
    explicitValidationSchema ?? getAttachedValidationSchema(schema)

  if (isDev() && explicitValidationSchema) {
    const attached = getAttachedValidationSchema(schema)
    if (attached && attached !== explicitValidationSchema) {
      warn(
        'The `validationSchema` option overrides the ' +
          "Standard Schema attached via `defineSchema`'s second argument"
      )
    }
  }

  const index = buildSchemaIndex(unref(schema), buildOptions)

  // A Vue ref is not unwrapped: clone would copy RefImpl internals.
  let seed = model
  if (isRef(model)) {
    if (isDev()) {
      warn(
        'A Vue ref was passed as the model seed. The seed ' +
          'is a cloned snapshot — pass a plain or reactive object, not a ref.'
      )
    }
    seed = undefined
  }

  const initial =
    seed !== undefined ? mergeOrReplace(index.model, clone(seed)) : index.model

  const store = makeModelStore({
    model: initial,
    nullModel: index.nullModel,
  })

  // Detached scope: the instance must work outside component setup and its
  // effects (engines, change watcher) must not leak into a caller's scope.
  const scope = effectScope(true)

  const engine = scope.run(() =>
    makeEngine({
      index,
      store,
      vueform,
      validationSchema,
      scope,
      languages: options.languages,
    })
  )!

  // Reactive schemas: reconcile the index, data, and engines in place on
  // change — every identity (instance, store, index, surviving nodes) is
  // preserved, so attaching forms and expression state carry over.
  if (isRef(schema)) {
    scope.run(() => {
      watch(schema as Ref<FormSchema>, (newSchema, oldSchema) => {
        // Recomputes can yield structurally identical schemas (function
        // props defeat the guard by identity — rebuilds stay correct, just
        // unskipped).
        if (equals(newSchema, oldSchema)) return

        const diff = reconcileSchemaIndex(index, newSchema, buildOptions)
        reconcileData(store, diff)
        engine.rebuild(diff)
      })
    })
  }

  // ============ SUBMISSION ==============

  const virtualForm$ = engine.virtualForm$

  // The instance's event system: the submission events fire through it, the
  // `onXxx` options register on it, and an attaching form mirrors its own
  // events into it (data events bridge from the store).
  const events = createEvents()

  // Server-set validation errors from the last 422 response (when `setInvalid`
  // is enabled), keyed by element path. Cleared on the next `validate()`.
  const serverErrors = ref<Record<string, string[]>>({})

  const serverIssues = computed(() =>
    Object.entries(serverErrors.value).flatMap(([path, messages]) =>
      messages.map((message) => ({ path, rule: 'server', message }))
    )
  )

  // Client-side errors keyed by element path, derived from the structured
  // issues (the engine's flat `errors` carries messages only).
  const errorsByPath = (): Record<string, string[]> => {
    const result: Record<string, string[]> = {}
    for (const issue of engine.issues.value) {
      ;(result[issue.path ?? ''] ??= []).push(issue.message)
    }
    return result
  }

  // Validates the model, dropping stale server errors first.
  const validate = () => {
    serverErrors.value = {}
    return engine.validate()
  }

  // The shared submission flow wired to the instance's options and headless
  // equivalents of the form's hooks. The string `endpoint` option is used
  // as-is (no expression resolution headlessly), and `applyServerErrors`
  // lands 422 errors on the instance's error surface instead of element
  // message bags.
  const submission = useSubmission({
    context$: virtualForm$,
    http: getHttpModule(vueform).make(),
    payload: () =>
      options.transformPayload
        ? options.transformPayload(engine.payload.value, virtualForm$)
        : engine.payload.value,
    update: store.update,
    validate,
    invalid: () => engine.invalid.value,
    errors: errorsByPath,
    issues: () => engine.issues.value,
    endpoint: () => options.endpoint,
    method: () => options.method ?? 'POST',
    headers: () => options.headers,
    json: () => options.json,
    base64: () => options.base64,
    setInvalid: () => options.setInvalid,
    setResponse: () => options.setResponse,
    transformServerInvalid: () => options.transformServerInvalid,
    transformResponse: () => options.transformResponse,
    fire: events.fire,
    fireAsync: events.fireAsync,
    applyServerErrors: (errors) => {
      serverErrors.value = errors
    },
  })

  // When the attaching form unmounts, carry its final submission state over
  // so the instance's delegating members don't snap back to stale
  // pre-attachment values once the delegation target is gone.
  store.onRelease((released) => {
    if (typeof released.submits === 'number') {
      submission.submits.value = released.submits
    }
    submission.response.value = released.response
    submission.result.value = released.result
  })

  // Mirror the mounted form's invalid/valid transition events.
  scope.run(() => {
    watch(engine.invalid, (isInvalid, wasInvalid) => {
      if (isInvalid) {
        events.fire('invalid', virtualForm$)
      } else if (wasInvalid) {
        events.fire('valid', virtualForm$)
      }
    })
  })

  // Instance-level subscription spanning the store's data events (context
  // appended, matching the form's emit shapes) and the submission events.
  // Data events bridge lazily so unobserved stores never pay for the store's
  // change snapshots.
  const on = (event: string, cb: (...args: any[]) => any): (() => void) => {
    if (event === 'change') {
      return store.on('change', (newValue: any, oldValue: any) =>
        cb(newValue, oldValue, virtualForm$)
      )
    }
    if (event === 'load') {
      return store.on('load', (value: any) => cb(value, virtualForm$))
    }
    if (event === 'reset' || event === 'clear') {
      return store.on(event, () => cb(virtualForm$))
    }

    events.on(event, cb)
    return () => events.off(event, cb)
  }

  const callbackEvents = [
    'invalid',
    'valid',
    'submit',
    'response',
    'fail',
    'clientInvalid',
    'serverInvalid',
    'success',
    'cancelled',
    'change',
    'reset',
    'clear',
    'load',
  ] as const

  for (const event of callbackEvents) {
    const cb = (options as Record<string, any>)[
      `on${event[0].toUpperCase()}${event.slice(1)}`
    ]
    if (typeof cb === 'function') on(event, cb)
  }

  // ============= INSTANCE ===============

  // The attaching form's context, when a form has attached the store. Stateful
  // members delegate to it so the instance and the mounted form can never
  // disagree: one submission flow, one validation surface, one set of counters
  // — the form's while attached, the instance's own otherwise.
  const ctx = () => store.attachingContext.value

  const instance = {
    get: store.get,
    set: store.set,
    update: store.update,
    input: (data: Record<string, any>) => {
      getExpressionModule(vueform)
        .makeExpressionTracking(index)
        .notifyInputData(data)
      store.update(data)
    },
    load: store.load,
    clear: store.clear,
    reset: store.reset,
    clean: store.clean,
    toJSON: store.toJSON,
    toFormData: store.toFormData,
    on,
    // An attaching form owns submission (its props and UX apply); otherwise
    // the instance's own flow runs against its options.
    submit: () => (store.attached.value ? store.submit() : submission.submit()),
    abort: () => {
      const c = ctx()
      return c?.abort ? c.abort() : submission.abort()
    },
    index,
    find: (path: string) => {
      const c = ctx()
      return c?.find ? c.find(path) : engine.find(path)
    },
    validate: async (): Promise<boolean> => {
      const c = ctx()
      if (c?.validate) {
        await c.validate()
        return !c.invalid
      }
      return validate()
    },
    validationSchema: engine.validationSchema,
    toStandardSchema: engine.toStandardSchema,
    destroy: () => {
      scope.stop()
      store.destroy()
    },
    get model() {
      return store.model.value
    },
    get initialModel() {
      return store.initialModel.value
    },
    get dirty() {
      const c = ctx()
      return c ? !!c.dirty : store.dirty.value
    },
    get empty() {
      return engine.empty.value
    },
    get attached() {
      return store.attached.value
    },
    get data() {
      return store.model.value
    },
    get payload() {
      const c = ctx()
      return c ? c.payload : engine.payload.value
    },
    get invalid() {
      const c = ctx()
      return c ? !!c.invalid : engine.invalid.value
    },
    get errors() {
      const c = ctx()
      if (c) return c.errors
      const result = errorsByPath()
      for (const [path, messages] of Object.entries(serverErrors.value)) {
        ;(result[path] ??= []).push(...messages)
      }
      return result
    },
    get issues() {
      const formIssues = ctx()?.issues
      if (formIssues) return formIssues
      const server = serverIssues.value
      return server.length
        ? [...engine.issues.value, ...server]
        : engine.issues.value
    },
    get submitting() {
      const c = ctx()
      return c ? !!c.submitting : submission.submitting.value
    },
    get validating() {
      const c = ctx()
      return c ? !!c.validating : submission.validating.value
    },
    get submits() {
      const c = ctx()
      return c ? (c.submits ?? 0) : submission.submits.value
    },
    get response() {
      const c = ctx()
      return c ? c.response : submission.response.value
    },
    get result() {
      const c = ctx()
      return c ? c.result : submission.result.value
    },
  }

  setInternals(instance, { store, engine, events })

  // Marked raw so passing the instance through props never proxies the store.
  return markRaw(instance) as unknown as ModelInstance
}

/**
 * Creates the model module instance from the app config. The module is a
 * stateless factory: `make` builds standalone form models from schemas using
 * the component definitions registered in the config, while per-form state
 * lives in the produced instances.
 *
 * The returned instances own their data and expose the familiar data API
 * (`update` / `load` / `clear` / `reset` / `clean`, `dirty` / `empty`,
 * path-based `get` / `set`, `toJSON` / `toFormData`). Passing one to a form's
 * `v-model` (or `useForm`) makes the form attach it — the same store is shared
 * without cloning, and `submit()` submits the attaching form.
 *
 * @param vueform The owning instance, whose config the model shape depends on
 *   via the registered component definitions.
 */
export function createModel(vueform: VueformInstance): ModelModule {
  return {
    make: (
      options: {
        schema: FormSchema | Ref<FormSchema>
        validationSchema?: StandardSchemaV1
        languages?: LanguagesProp
      } & UseModelSubmissionOptions,
      seed?: Record<string, any>
    ) => makeModel(vueform, options, seed),
    makeRootModel,
    makeChildModel,
    makeModelStore,
    makeMountedNode,
    hasModelStore,
    getModelEvents,
  } as ModelModule
}
