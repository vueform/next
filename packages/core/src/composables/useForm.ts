// @flag review later
import {
  defineComponent,
  getCurrentScope,
  h,
  isReactive,
  isRef,
  markRaw,
  onScopeDispose,
  shallowRef,
  unref,
  type Component,
  type MaybeRef,
  type Ref,
} from 'vue'

import type {
  VfFormContext,
  VfFormEmits,
  VfFormProps,
} from '#src/components/VfForm/types'
import type { VueformInstance } from '#src/helpers'
import { resolveVueform } from '#src/helpers/resolveVueform'
import type { ModelInstance } from '#src/modules/model'
import type {
  ArraySchema,
  DeepPartial,
  EmitsToProps,
  ExactValidatedSchema,
  FormSchema,
  MatchesSchemaModel,
  ObjectSchema,
  SchemaToModel,
  StandardSchemaV1,
} from '#src/types'
import { isPlainObject } from '#src/utils'

/**
 * Registers a callback fired with the form context once the form is mounted
 * (immediately when it already is). With no argument returns a Promise
 * resolving to the form context.
 */
type FormReady<C> = {
  (cb: (form$: C) => void): void
  (): Promise<C>
}

/**
 * The accepted shapes of `useForm`'s model argument: a `useModel` instance
 * (attached to the form), a ref (two-way synced), a reactive object (keys synced
 * back on update), or a plain object (initial value).
 */
type UseFormModelArg<M extends Record<string, any>> =
  | ModelInstance<any>
  | Ref<DeepPartial<M> | Record<string, any> | undefined>
  | (DeepPartial<M> & Record<string, any>)

/**
 * Widens each form option to also accept a ref or computed, so any option can
 * be reactive.
 */
type MaybeRefProps<T> = {
  [K in keyof T]: MaybeRef<T[K]>
}

/**
 * The tuple returned by `useForm`: the renderable form component, the unwrapped
 * form context, and the ready registrar.
 */
export type UseFormReturn<TSchema = FormSchema> = [
  Component,
  VfFormContext<VfFormProps<TSchema>>,
  FormReady<VfFormContext<VfFormProps<TSchema>>>,
]

// Instance-only members the mounted form context doesn't carry. The pre-mount
// `form$` proxy answers every other engine member from the bound instance —
// the data API, validation, submission state, `find`, and `on` (the mounted
// form fires its events into the instance's emitter, so pre-mount
// registrations keep working after mount) — and skips these so no member
// vanishes when the context takes over.
const instanceOnlyMembers = new Set([
  'attached',
  'destroy',
  'input',
  'validationSchema',
])

/**
 * Unwraps ref/computed option values.
 *
 * @param props The raw `useForm` options.
 */
function unrefProps(props: Record<string, any>): Record<string, any> {
  return Object.fromEntries(
    Object.entries(props).map(([key, value]) => [key, unref(value)])
  )
}

/**
 * Writes `data`'s keys into a reactive target and removes keys the data no
 * longer holds.
 *
 * @param target The reactive object to sync into.
 * @param data The emitted model snapshot.
 */
function syncReactive(target: Record<string, any>, data: Record<string, any>) {
  for (const key of Object.keys(data)) {
    target[key] = data[key]
  }
  for (const key of Object.keys(target)) {
    if (!(key in data)) delete target[key]
  }
}

/**
 * Creates a form component preconfigured with the given props and model,
 * returning it alongside the form context and a ready registrar. The form
 * always has an engine: a passed `useModel` instance is attached as-is, and
 * with no model (or a plain-object seed) an internal instance is created from
 * the schema and attached the same way — so the context answers the engine's
 * members (data, validation, submission) before the form mounts, and the
 * mounted members join on mount. Refs are two-way synced and reactive objects
 * are synced back on update instead; their store stays the caller's. Any
 * option may be a ref or computed. Setup-only when called without `vueform`.
 *
 * @param formProps Props forwarded to VfForm (e.g. `schema`).
 * @param model The form data: `useModel` instance, ref, reactive, or plain
 *   object.
 * @param vueform The Vueform instance to build from. Required outside a
 *   component context.
 */
export function useForm<
  const S extends (ObjectSchema | ArraySchema) & ExactValidatedSchema<S>,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(
  formProps: {
    schema: S
    validationSchema?: Z & MatchesSchemaModel<S, Z>
  } & MaybeRefProps<
    Omit<VfFormProps<S>, 'schema' | 'modelValue' | 'validationSchema'>
  > &
    EmitsToProps<VfFormEmits<S>> &
    Record<string, unknown>,
  model?: UseFormModelArg<SchemaToModel<S>>,
  vueform?: VueformInstance
): UseFormReturn<S>
// The loose overload keeps dynamic / schema-less / ref-schema usage compiling
// untouched (the `MatchesSchemaModel` check is vacuous for wide and invalid
// schemas), but runs the same validation-schema check as the strict overload —
// so a literal schema paired with a mismatched Standard Schema matches neither
// overload and errors instead of silently falling back untyped. `const S` is
// load-bearing: without it the inline schema literal widens and the check
// degrades to its vacuous branch.
export function useForm<
  const S = FormSchema,
  Z extends StandardSchemaV1 = StandardSchemaV1,
>(
  formProps?: {
    schema?: S
    validationSchema?: Z & MatchesSchemaModel<S, Z>
  } & Record<string, any>,
  model?: UseFormModelArg<Record<string, any>>,
  vueform?: VueformInstance
): UseFormReturn
export function useForm(
  formProps: Record<string, any> = {},
  model?: any,
  vueform?: VueformInstance
): UseFormReturn<any> {
  const instance = resolveVueform(vueform)
  const VfForm = instance.config.components.VfForm

  if (!VfForm) {
    throw new Error(
      '`useForm()` requires the VfForm component to be registered'
    )
  }

  /**
   * The mounted form's exposed context (`null` before mount / after unmount).
   */
  const formRef = shallowRef<any>(null)

  const modelModule = instance.modules.model

  /**
   * The `useModel` instance handed in as the model argument, if any.
   */
  const passedInstance: ModelInstance<any> | null =
    model !== undefined && modelModule.hasModelStore(model) ? model : null

  /**
   * The internally created engine when no instance was handed in: with no
   * model argument (or a plain-object seed) the form still gets a `useModel`
   * instance built from its schema, so `form$` answers the engine's members
   * before mount regardless of whether a model was passed. Ref and reactive
   * models keep their sync semantics instead — their store is the caller's.
   */
  const internalInstance: ModelInstance<any> | null =
    !passedInstance &&
    (model === undefined ||
      (!isRef(model) && !isReactive(model) && isPlainObject(model)))
      ? modelModule.make(
          {
            schema: (formProps.schema ?? {}) as any,
            validationSchema: unref(formProps.validationSchema) as any,
            languages: isPlainObject(unref(formProps.languages))
              ? (unref(formProps.languages) as any)
              : undefined,
          },
          model as Record<string, any> | undefined
        )
      : null

  // The internal engine's effects live in a detached scope; tie its teardown
  // to the calling scope when one exists. A passed instance is the caller's —
  // never destroyed here.
  if (internalInstance && getCurrentScope()) {
    onScopeDispose(() => internalInstance.destroy())
  }

  /**
   * The bound engine: the passed `useModel` instance or the internal one.
   */
  const modelInstance = passedInstance ?? internalInstance

  /**
   * Callbacks awaiting the mounted form context.
   */
  const readyCallbacks: ((form$: any) => void)[] = []

  /**
   * Live facade over the mounted form's context.
   */
  const form$: any = new Proxy(Object.create(null), {
    get(_, key) {
      if (key === '__v_skip') return true
      const ctx = formRef.value
      if (ctx) return ctx[key]
      if (
        modelInstance &&
        typeof key === 'string' &&
        !instanceOnlyMembers.has(key) &&
        key in modelInstance
      ) {
        return (modelInstance as any)[key]
      }
      return undefined
    },
    has(_, key) {
      const ctx = formRef.value
      if (ctx) return key in ctx
      return (
        !!modelInstance &&
        typeof key === 'string' &&
        !instanceOnlyMembers.has(key) &&
        key in modelInstance
      )
    },
  })

  const formReady: FormReady<any> = ((cb?: (form$: any) => void): any => {
    if (cb) {
      if (formRef.value) {
        cb(form$)
      } else {
        readyCallbacks.push(cb)
      }
      return
    }

    if (formRef.value) return Promise.resolve(form$)
    return new Promise((resolve) => {
      readyCallbacks.push(() => resolve(form$))
    })
  }) as FormReady<any>

  /**
   * Template-ref callback capturing the form's exposed context.
   *
   * @param exposed The form's exposed context (or `null` on unmount).
   */
  const captureContext = (exposed: any) => {
    formRef.value = exposed || null

    if (exposed) {
      readyCallbacks.splice(0).forEach((cb) => cb(form$))
    }
  }

  /**
   * The model binding props derived from the model argument's shape.
   */
  const modelBinding = (): Record<string, any> => {
    // Engine (passed or internal): attached to the form — no update listener.
    if (modelInstance) {
      return { modelValue: modelInstance }
    }

    if (model === undefined) return {}

    if (isRef(model)) {
      return {
        modelValue: model.value ?? {},
        'onUpdate:modelValue': (value: any) => {
          model.value = value
        },
      }
    }

    if (isReactive(model)) {
      return {
        modelValue: model,
        'onUpdate:modelValue': (value: any) => syncReactive(model, value),
      }
    }

    return { modelValue: model }
  }

  const MyForm = markRaw(
    defineComponent({
      name: 'UseForm',
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () =>
          h(
            VfForm as any,
            {
              ...unrefProps(formProps),
              ...modelBinding(),
              ...attrs,
              ref: captureContext,
            },
            // Fresh object: vapor interop slots are non-extensible, but `h`
            // needs to tag its children object with `_ctx`.
            { ...slots }
          )
      },
    })
  )

  return [MyForm, form$, formReady]
}
