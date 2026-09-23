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
} from '~/components/VfForm/types'
import type { VueformInstance } from '~/helpers'
import { resolveVueform } from '~/helpers/resolveVueform'
import type { ModelInstance } from '~/modules/model'
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
} from '~/types'

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
 * (adopted by the form), a ref (two-way synced), a reactive object (keys synced
 * back on update), or a plain object (initial value).
 */
type UseFormModelArg<M extends Record<string, any>> =
  | ModelInstance<any>
  | Ref<DeepPartial<M> | Record<string, any> | undefined>
  | (DeepPartial<M> & Record<string, any>)

/**
 * Widens each form option to also accept a ref or computed — `useForm` unwraps
 * them at render time, so any option can be reactive.
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
 * Unwraps ref/computed option values. Called inside the render function, so the
 * refs are tracked as render dependencies — changing one re-renders the form
 * with the fresh prop value.
 *
 * @param props The raw `useForm` options.
 */
const unrefProps = (props: Record<string, any>): Record<string, any> =>
  Object.fromEntries(
    Object.entries(props).map(([key, value]) => [key, unref(value)])
  )

// Members shared between a `useModel` instance and the mounted form context.
// Pre-mount, `form$` answers these from a bound instance; instance-only
// members (`adopted`, `input`, `on`, `validationSchema`) and mount-only
// members stay off the list so nothing appears or vanishes on mount.
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
  'find',
  'submit',
  'toJSON',
  'toFormData',
  'toStandardSchema',
])

/**
 * Writes `data`'s keys into a reactive target and removes keys the data no
 * longer holds, so external references to the reactive object stay live.
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
 * returning it alongside the (not yet mounted) form context and a ready
 * registrar:
 *
 * ```ts
 * const [MyForm, form$, formReady] = useForm({ schema }, model)
 *
 * formReady((form$) => {
 *   form$.find('email')
 * })
 * ```
 *
 * The component renders VfForm with the merged props, forwards extra attrs and
 * slots, and binds the model according to its shape: `useModel` instances are
 * adopted (shared store), refs are two-way synced, reactive objects get their
 * keys synced back on update, and plain objects seed the initial value.
 *
 * Any option may be a ref or computed — unwrapped reactively at render time, so
 * changing it re-renders the form with the new value (e.g. a computed
 * `autosave` config, a `disabled` ref).
 *
 * `form$` is a live proxy to the mounted form's full context (`undefined`
 * members before mount) — use `formReady` for work that needs the mounted form.
 * When the model is a `useModel` instance, the members shared with the instance
 * (`model`, `get` / `set` / `update`, `validate`, …) already answer before
 * mount, backed by the instance's store.
 *
 * Setup-only when called without `vueform` — it resolves the calling
 * component's instance. Outside a component — plain modules, stores, tests —
 * pass your instance, or use its bound method, which does the same:
 * `vueform.useForm({ schema }, model)`.
 *
 * @private
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
export function useForm(
  formProps?: Record<string, any>,
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
   * The bound `useModel` instance, when the model argument is one. While the
   * form isn't mounted, `form$` answers the shared model members from it.
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
   * Live facade over the mounted form's context. Members read through to the
   * current context, so a single destructure-free reference stays valid across
   * remounts.
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
   * Template-ref callback capturing the form's exposed context and flushing
   * pending ready callbacks on mount.
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

    // Branded useModel instance: adopted by the form — no update listener.
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
