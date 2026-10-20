// @flag review later
import {
  defineComponent,
  h,
  isReactive,
  isRef,
  markRaw,
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

/**
 * Unwraps ref/computed option values.
 *
 * @param props The raw `useForm` options.
 */
const unrefProps = (props: Record<string, any>): Record<string, any> =>
  Object.fromEntries(
    Object.entries(props).map(([key, value]) => [key, unref(value)])
  )

// Members shared between a `useModel` instance and the mounted form context.
// Pre-mount, `form$` answers these from a bound instance; instance-only
// members (`attached`, `input`, `validationSchema`) and mount-only members
// stay off the list so nothing appears or vanishes on mount. `on` exists on
// both but stays off deliberately: a pre-mount registration would land on the
// instance's emitter, which the mounted form's submissions don't fire into.
const sharedModelMembers = new Set([
  'model',
  'data',
  'initialModel',
  'payload',
  'dirty',
  'empty',
  'invalid',
  'errors',
  'issues',
  'index',
  'get',
  'set',
  'update',
  'load',
  'clear',
  'reset',
  'clean',
  'validate',
  'validating',
  'find',
  'submit',
  'submits',
  'submitting',
  'response',
  'result',
  'abort',
  'toJSON',
  'toFormData',
  'toStandardSchema',
])

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
 * returning it alongside the form context and a ready registrar. The model is
 * bound according to its shape: `useModel` instances are attached, refs are
 * two-way synced, reactive objects are synced back on update, and plain objects
 * seed the initial value. Any option may be a ref or computed. Setup-only when
 * called without `vueform`.
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

  /**
   * The bound `useModel` instance, when the model argument is one.
   */
  const modelInstance: ModelInstance<any> | null =
    model !== undefined && instance.modules.model.hasModelStore(model)
      ? model
      : null

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
      if (modelInstance && sharedModelMembers.has(key as string)) {
        return (modelInstance as any)[key]
      }
      return undefined
    },
    has(_, key) {
      const ctx = formRef.value
      if (ctx) return key in ctx
      return !!modelInstance && sharedModelMembers.has(key as string)
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
    if (model === undefined) return {}

    // Branded useModel instance: attached to the form — no update listener.
    if (modelInstance) {
      return { modelValue: model }
    }

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
