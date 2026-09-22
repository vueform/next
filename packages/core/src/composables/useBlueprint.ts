import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated,
  reactive,
  ref,
  shallowRef,
  toRaw,
  useAttrs,
  type ComputedRef,
  type Ref,
} from 'vue'
import {
  useConfig,
  useCurrentInstance,
  useCurrentName,
  useOutlets,
  usePlugins,
} from '~/composables'
import {
  BASE_CLASS_REGISTRAR,
  CLASS_REGISTRAR,
  createComponentContext,
  createPresetContext,
  markContextReady,
  opaque,
  useComponentContext,
  useVueformContext,
  usePresetContext,
} from '~/contexts'
import {
  type VueformGlobals,
  type DefineEvents,
  type VueformConfig,
} from '~/helpers'
import type { LocaleModule } from '~/modules/locale'
import { getSecurityModule, type SecurityModule } from '~/modules/security'
import {
  type ClassesProp,
  type ClassValue,
  type ComponentOptions,
  type LooseClasses,
  type LooseRequired,
  type NormalizedPresetDefinition,
  type PartsProp,
  type PresetsProp,
  type SpreadMerge,
  type UnwrapApiRefs,
} from '~/types'
import {
  createPropRefs,
  getComponentDef,
  getInstanceRawProp,
  getInstanceRawPropKeys,
  hasInstanceRawProp,
  isComponentDefinition,
  isPlainObject,
  mergeClass,
  mergeProp,
  normalizePreset,
  toKebabCase,
  toPascalCase,
  typedKeys,
  unrefClass,
  type GenericInstance,
  warn,
  isDev,
} from '~/utils'

/**
 * The shape returned by `useParts`: the original part type (callable parts
 * remain callable, static parts remain spreadable) plus arbitrary extra keys.
 */
type ResolvedParts<T> = Partial<T>

/**
 * Return type of `defineClasses`: the lazy classes proxy plus a `useClasses`
 * registrar for deferred component-level class definitions.
 */
type DefineClassesReturn<
  C extends Record<string, any>,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = {
  /**
   * Resolved CSS classes for the component. Keys are created lazily on first
   * access so factories registered via `useClasses` may close over later
   * bindings.
   */
  classes: C & Record<string, any>

  /**
   * Registers one or more class definition objects or factories. Factories are
   * not invoked until a class key is first read (typically during render) and
   * receive `(api, propRefs)`. Definitions for the same key are merged.
   *
   * @param defs Class definition objects or factories.
   */
  useClasses: (...defs: ClassDefsArg<C, TApi, TPropRefs>[]) => void

  /**
   * Registers override definitions from outside the component (templates /
   * slots). Per key, the last override that sets the key replaces the
   * component-defined value; keys no override sets keep it.
   *
   * @param defs Class definition objects or factories.
   */
  useClassOverrides: (...defs: ClassDefsArg<C, TApi, TPropRefs>[]) => void

  /**
   * Installs the shared base class map at the bottom of the chain (below
   * `reclass`). Single writer — the element layout; a later call replaces the
   * previous map, so a remounting layout stays idempotent.
   *
   * @param defs The base class map.
   */
  setBaseClasses: (defs: Record<string, any>) => void
}

/**
 * Resolves the factory API type: `ReturnType` when given a factory function,
 * otherwise the API object type as-is (e.g. from `useBlueprint`).
 */
type ApiOf<T> = T extends (...args: any) => infer R ? R : T

/**
 * Resolves event helpers: emit maps (`SelectEmits`) are wrapped with
 * `DefineEvents`; already-built `defineEvents()` returns (with `fire`) pass
 * through unchanged (e.g. from `useBlueprint`).
 */
type EventsOf<T extends Record<string, any>> = T extends {
  fire: (...args: any) => any
}
  ? T
  : DefineEvents<T>

/**
 * The public `props` shape on the context: resolved props minus type-only brand
 * keys (symbol keys such as the items generics brand). The brand varies with
 * each component instance's inferred type parameters, so keeping it would make
 * generic instances unassignable to a component's canonical context (e.g.
 * `VfSelectContext` built from bare `VfSelectProps`). The brand is type-only
 * (never set at runtime) and its consumers (`ItemsGenericsOf`) read blueprint
 * setup props, not context props.
 */
type ContextProps<TProps> = {
  [K in keyof TProps as K extends symbol ? never : K]: TProps[K]
}

/**
 * Lazy `toRef` proxy over resolved props, used by `propRefs` and as the second
 * argument to `useClasses` factories.
 */
type PropRefsOf<TProps> = { [K in keyof TProps]-?: Ref<TProps[K]> }

/**
 * First argument to `useClasses` factories: the factory API plus event helpers
 * and the resolved (non-ref) `props` object. Kept as a pick of assembled fields
 * rather than the full `Blueprint2Api` to avoid a circular type through
 * `useClasses`.
 */
type ClassFactoryApi<
  TApi extends Record<string, any>,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
> = TApi &
  TEvents & {
    props: TProps
  }

/**
 * Extracts the component's class map from its props' `classes` prop, mirroring
 * how `useParts` recovers the parts map from `parts`.
 */
type ClassesOfProps<TProps> = TProps extends {
  classes?: ClassesProp<infer C>
}
  ? C extends Record<string, any>
    ? C
    : Record<string, any>
  : Record<string, any>

/**
 * Optional extension callback that may add or overwrite members on the
 * blueprint API before plugins run. May return nothing when it only registers
 * hooks/watchers.
 */
type BlueprintExtension<
  TApi extends Record<string, any>,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any>,
  TExt = void,
> = (api: TApi, props: TProps, events: TEvents) => TExt

/**
 * Normalizes an extension return: `void` / non-objects become `{}` so
 * `SpreadMerge` does not collapse the API when the callback only runs hooks.
 */
type ResolvedExtension<T> = T extends Record<string, any> ? T : {}

/**
 * Adds `ForwardsApi` to the api type when the blueprint carries a
 * `makeForwards` declaration — the type-level counterpart of `useBlueprint`
 * noticing `api.forwards` and assigning the built computeds.
 */
type ForwardsOf<TApi> = TApi extends { forwards: ForwardsConfig }
  ? ForwardsApi
  : {}

type Blueprint2Api<
  TApi extends Record<string, any>,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
  TSlots extends Record<string, any> = Record<string, any>,
> = {
  /**
   * Factory API plus event helpers and the resolved (non-ref) `props` object.
   * For SFC destructuring and class factories — not the public context shape.
   */
  api: ClassFactoryApi<TApi, TProps, TEvents> & ForwardsOf<TApi>

  /**
   * Resolved part attribute overrides.
   */
  parts: TParts

  /**
   * Resolved CSS classes for the component.
   */
  classes: TClasses

  /**
   * Merged named outlets: inline template slots (`useSlots`) combined with
   * prop-based slot component overrides. Uses the blueprint's own merged
   * `outlets` (e.g. from `makeElement`) when available, otherwise the raw
   * `defineSlots` map.
   */
  outlets: ComputedRef<TSlots>

  /**
   * Lazy `toRef` proxy over resolved props for reactive destructuring.
   */
  propRefs: PropRefsOf<TProps>

  /**
   * The component's single public context: the context proxy over the exposed
   * object — ref members read unwrapped and are assignable, `toRefs` / `toRaw`
   * work. Bind it to the `#template` slot and the template outlet as
   * `:context`; it is also what event handlers receive as `context$`, what
   * `find()` returns, and what `useContext()` returns.
   */
  context: BlueprintContext<TApi, TProps, TEvents, TSlots, TParts, TClasses>

  /**
   * The object to hand to `defineExpose`: `toRaw(context)` — the raw API (refs
   * intact) plus the resolved `props`, `parts`, `classes`, and `outlets`. Every
   * public view of the component — `context`, template refs — reads through
   * it.
   */
  expose: ClassFactoryApi<TApi, ContextProps<TProps>, TEvents> & {
    props: ContextProps<TProps>
    parts: TParts
    classes: TClasses
    outlets: ComputedRef<TSlots>
  }

  /**
   * Registers component-level class definitions. Factories are deferred until
   * first class-key access and receive `(api, propRefs)`.
   *
   * @param defs Class definition objects or factories.
   */
  useClasses: (
    ...defs: ClassDefsArg<
      TClasses,
      ClassFactoryApi<TApi, TProps, TEvents>,
      PropRefsOf<TProps>
    >[]
  ) => void
}

/**
 * A class definition factory that receives the component API and prop refs when
 * invoked (lazily, on first class-key access).
 */
type ClassDefsFactory<
  C,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = (api: TApi, propRefs: TPropRefs) => LooseClasses<C>

/**
 * A class definition object or a factory that returns one. Factories are
 * deferred until first key access and receive `(api, propRefs)` so they need
 * not close over setup bindings.
 */
type ClassDefsArg<
  C,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = LooseClasses<C> | ClassDefsFactory<C, TApi, TPropRefs>

/**
 * Assembled blueprint return. Factory members live under `api` for internal
 * destructuring; `context` is the flat public shape used by `defineExpose` and
 * the `#template` slot.
 */
/**
 * The members `useBlueprint` builds for a `makeForwards` declaration and
 * assigns onto the api (see `buildForwards`).
 */
export type ForwardsApi = {
  /**
   * Component attrs with forwarded event listeners routed through the Vueform
   * event system.
   */
  forwardProps: ComputedRef<Record<string, any>>

  /**
   * Outlets filtered to only include those designated for the underlying
   * adapter component.
   */
  forwardSlots: ComputedRef<Record<string, any>>
}

/**
 * Unified public component context: factory API and event helpers at the root,
 * plus resolved `props` / `parts` / `classes` / `outlets`.
 *
 * This is the single shape shared by:
 *
 * - event-handler `context$` (proxy over `instance.exposed`)
 * - `defineExpose` / `#template` slot payload
 *
 * `$config`, `$locale`, and `$globals` are always present — injected by
 * `createComponentContext` for every component, not only those that expose them
 * from a factory.
 *
 * `TApi` may be a factory (`typeof setup<…>`) or an already-built API object
 * type — factories are resolved via `ReturnType`. `TEvents` may be an emit map
 * (`SelectEmits`) or a `defineEvents()` return — emit maps are wrapped with
 * `DefineEvents`. `TParts` is always exposed as `Partial<TParts>`. Top-level
 * refs are unwrapped via `UnwrapApiRefs`.
 */
export type BlueprintContext<
  TApi,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
  TSlots extends Record<string, any> = Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
> = UnwrapApiRefs<
  // `outlets` is omitted from the api side: blueprints type it wide
  // (`ComputedRef<Record<string, any>>` from `useOutlets`), and intersecting
  // that with the declared `outlets` member below collapses every outlet to
  // `any`.
  Omit<ApiOf<TApi>, 'outlets'> &
    EventsOf<TEvents> & {
      props: ContextProps<TProps>
      parts: Partial<TParts>
      // Declared keys keep their types; any other key resolves too (the
      // classes proxy creates keys lazily), so templates can read keys they
      // registered via `useClasses` or that users supply through `classes`.
      classes: TClasses & Record<string, any>
      outlets: ComputedRef<TSlots>

      /**
       * The resolved Vueform configuration for the injecting app.
       */
      $config: VueformConfig

      /**
       * The locale module instance, or its inert surface when the `locale`
       * module is not registered.
       */
      $locale: LocaleModule

      /**
       * Form-level layout globals derived from the Vueform configuration.
       */
      $globals: VueformGlobals
    }
>

/**
 * Resolved props objects created by `useProps`, keyed by component instance. A
 * module-level WeakMap keeps the association off the instance object itself and
 * lets it be garbage-collected together with the instance.
 */
const resolvedProps = new WeakMap<GenericInstance, Record<string, any>>()

/**
 * Module-level memo for kebab-cased prop names. Prop names form a small,
 * bounded vocabulary, so the cache stays tiny while saving repeated regex work
 * on every component instance.
 */
const kebabCache = new Map<string, string>()

/**
 * The events and slots an adapter component forwards to the underlying
 * third-party component. Declared on the api as `forwards` by `makeForwards`;
 * `useBlueprint` notices it and builds `forwardProps` / `forwardSlots`.
 */
export type ForwardsConfig = {
  /**
   * Event names to forward through the Vueform event system with `context$`
   * appended (kebab-case or camelCase).
   */
  events?: readonly string[]

  /**
   * Slot names to forward from the resolved outlets to the underlying
   * component.
   */
  slots?: readonly string[]
}

/**
 * Registers the resolved props object `useProps` created for a component
 * instance.
 *
 * @param instance The component's instance (VDOM or Vapor).
 * @param props The resolved props object returned by `useProps`.
 */
function setResolvedProps(
  instance: GenericInstance,
  props: Record<string, any>
) {
  resolvedProps.set(instance, props)
}

function toKebabCached(prop: string) {
  let kebab = kebabCache.get(prop)
  if (kebab === undefined) {
    kebab = toKebabCase(prop)
    kebabCache.set(prop, kebab)
  }
  return kebab
}

/**
 * Removes the `'this'` marker from a preset's `$apply` list before the preset
 * is forwarded to descendants, so `'this'` only ever matches the component the
 * preset was attached to.
 *
 * @param preset The normalized preset definition to forward.
 */
function stripThis(preset: NormalizedPresetDefinition) {
  const $apply = preset.$apply

  if (!Array.isArray($apply) || !$apply.includes('this')) {
    return preset
  }

  return { ...preset, $apply: $apply.filter(($a) => $a !== 'this') }
}

/**
 * Resolves component props by merging global config defaults, presets, and
 * user-provided values in priority order.
 *
 * Component-level defaults are not passed in — they come from Vue's
 * `withDefaults` on the SFC and are already present on `props`. This composable
 * only layers global config defaults and presets on top. Consequently, when the
 * user passes a prop, its `withDefaults` default is replaced wholesale
 * (standard Vue semantics) — only config defaults and presets participate in
 * object merging with user values.
 *
 * @param props The raw component props from `defineProps` / `withDefaults`.
 */
function useProps<T extends Record<string, any>>(props: Readonly<T>): T {
  createComponentContext()

  const config = useConfig()
  const instance = useCurrentInstance()

  // When `useProps` already ran for this instance (e.g. `useBlueprint`
  // running it again after an earlier direct call), reuse the resolved
  // proxy — re-merging config/presets would duplicate class values.
  const alreadyResolved = getResolvedProps(instance)
  if (alreadyResolved) {
    return alreadyResolved as T
  }

  const componentName = useCurrentName()
  const isElement = getComponentDef(instance).element ?? false
  const globalDefaults = useVueformContext().defaults[componentName] || {}
  const inheritedPresets = usePresetContext() || ref([])

  // Whether user-provided plain objects merge into object defaults
  // (config/preset) or replace them entirely.
  const mergeObjectProps = config.mergeObjectProps !== false

  const componentPresets = computed(() => {
    const presets = new Set<string | NormalizedPresetDefinition[]>()

    // 1. Default presets for child element
    const globalDefaultPresets = globalDefaults.presets
    if (globalDefaultPresets) {
      for (const preset of globalDefaultPresets) {
        presets.add(
          typeof preset === 'string' ? preset : normalizePreset(preset)
        )
      }
    }

    // 2. User provided presets (already resolved by withDefaults when a
    //    component-level presets default exists)
    const userPresets = (props as { presets?: PresetsProp }).presets
    if (userPresets) {
      for (const preset of userPresets) {
        presets.add(
          typeof preset === 'string' ? preset : normalizePreset(preset)
        )
      }
    }

    if (presets.size === 0) return []

    const componentPresets: NormalizedPresetDefinition[] = []

    for (const item of presets) {
      if (!item) continue

      if (typeof item === 'string') {
        const preset = config.presets[item] as NormalizedPresetDefinition[]

        if (!preset) {
          if (isDev()) {
            warn(`Preset \`${item}\` not found`)
          }
          continue
        }

        if (Array.isArray(preset)) {
          for (let i = 0; i < preset.length; i++)
            componentPresets.push(preset[i])
        } else {
          componentPresets.push(preset)
        }
      } else {
        for (let i = 0; i < item.length; i++) componentPresets.push(item[i])
      }
    }

    return componentPresets
  })

  const presets = computed(() => [
    ...inheritedPresets.value,
    ...componentPresets.value,
  ])

  const forwardPresets = computed(() => [
    ...inheritedPresets.value,
    ...componentPresets.value.filter(({ $cascade }) => $cascade).map(stripThis),
  ])

  createPresetContext(forwardPresets)

  const componentDef = getComponentDef(instance) as ComponentOptions

  const applicablePresets = computed(() =>
    presets.value.filter((preset) =>
      typeof preset.$apply === 'function'
        ? preset.$apply(componentDef)
        : preset.$apply.some(
            ($a) =>
              $a === componentName ||
              $a === 'this' ||
              $a === '*' ||
              ($a === '*element' && isElement)
          )
    )
  )

  // Returns the previous Set instance when the key set is unchanged, so
  // dependents are not invalidated by preset changes that don't affect
  // which keys are targeted.
  let prevPresetKeys: Set<string> | undefined

  const presetKeys = computed(() => {
    const keys = new Set<string>()
    for (const preset of applicablePresets.value) {
      for (const key in preset) {
        if (!key.startsWith('$')) keys.add(key)
      }
    }

    const prev = prevPresetKeys
    if (prev && prev.size === keys.size) {
      let same = true
      for (const key of keys) {
        if (!prev.has(key)) {
          same = false
          break
        }
      }
      if (same) return prev
    }

    prevPresetKeys = keys
    return keys
  })

  const hasAnyPresets = computed(() => applicablePresets.value.length > 0)

  // Raw / `@vue-ignore` props are not reactive on their own. The component
  // re-renders when they change, so a version counter bumped in
  // `onBeforeUpdate` (raw props are already fresh there) restores invalidation
  // for resolvers that read them via `getInstanceRawProp`.
  const rawPropsVersion = ref(0)
  onBeforeUpdate(() => {
    rawPropsVersion.value++
  })

  // All keys the resolved props object exposes, and the subset that needs the
  // full resolution pipeline (a config default or a namespaced preset key).
  // Component-level defaults are already on `props` via `withDefaults`, so they
  // do not need to be managed here. Everything else is a plain runtime prop
  // that can be read straight from `props` unless a preset targets it.
  const allKeys = new Set<string>()
  const managedKeys = new Set<string>()

  for (const key in props) {
    allKeys.add(key)
  }

  // Props declared via `/* @vue-ignore */` are not runtime props. Global
  // config defaults for such props must still produce a resolver. User values
  // are read from raw instance props (`getInstanceRawProp`), not fallthrough
  // attrs. We intentionally do NOT iterate all raw prop keys: shorthand
  // pass-through attrs (`part:*`, `class:*`, `reclass:*`) and arbitrary
  // fallthrough attrs must not be hoovered into the resolved props wholesale.
  // `useParts`/`useClasses` read resolved namespaced keys from here first and
  // fall back to raw attrs for keys the pipeline doesn't manage.
  for (const key in globalDefaults) {
    allKeys.add(key)
    managedKeys.add(key)
  }

  // Presets may target namespaced (`<group>:<name>`) props declared via
  // `/* @vue-ignore */` (e.g. `part:input`). Runtime prop options can't tell
  // ignored props from arbitrary keys, so the namespace convention is the
  // contract: namespaced preset keys resolve, unknown plain keys are ignored.
  // Snapshot at setup: presets added later can't introduce new keys.
  for (const key of presetKeys.value) {
    if (key.includes(':')) {
      allKeys.add(key)
      managedKeys.add(key)
    }
  }

  const resolvers = new Map<string, ComputedRef<any>>()

  const makeResolver = (prop: string) => {
    const kebabProp = toKebabCached(prop)
    const isRuntimeProp = prop in props
    const configValue = globalDefaults[prop]
    const hasAnyDefault = prop in globalDefaults

    return computed(() => {
      // Non-runtime props have no reactive source of their own (see above).
      if (!isRuntimeProp) void rawPropsVersion.value

      const hasVnodeValue =
        hasInstanceRawProp(instance, prop) ||
        hasInstanceRawProp(instance, kebabProp)

      const propValue = isRuntimeProp
        ? (props as any)[prop]
        : (getInstanceRawProp(instance, prop) ??
          getInstanceRawProp(instance, kebabProp))

      const userValue = hasVnodeValue ? propValue : undefined

      if (userValue !== undefined && !isPlainObject(userValue)) {
        return userValue
      }

      const hasPreset = hasAnyPresets.value && presetKeys.value.has(prop)

      // When the user did not pass the prop, `propValue` is Vue's
      // `withDefaults` value and acts as the component-level default under
      // global config. When they did, start from config alone — the user
      // value is merged below.
      let value = hasVnodeValue
        ? configValue
        : mergeProp(propValue, configValue, prop)

      if (hasPreset) {
        const applicable = applicablePresets.value
        for (let i = 0; i < applicable.length; i++) {
          const presetValue = applicable[i][prop]
          if (presetValue !== undefined) {
            value = mergeProp(value, presetValue, prop, applicable[i].$merge)
          }
        }
      }

      if (userValue !== undefined) {
        // `classes` and `presets` have dedicated merge semantics (and
        // dedicated replace mechanisms), so `mergeObjectProps` only controls
        // regular plain-object props.
        value =
          !mergeObjectProps &&
          isPlainObject(userValue) &&
          prop !== 'classes' &&
          prop !== 'presets'
            ? userValue
            : mergeProp(value, userValue, prop)
      }

      if (!hasAnyDefault && !hasVnodeValue && !hasPreset) {
        return propValue
      }

      // Objects/arrays passed through unmerged from config defaults or presets
      // are shared across instances — clone them so mutating one element's
      // resolved prop can't corrupt another's (user-provided values stay live
      // by reference). Component definitions (a default `template`, `layout`,
      // or slot component) are immutable and identity-sensitive — copying one
      // would drop `markRaw`'s non-enumerable flag — so they pass through.
      if (value !== userValue) {
        if (isPlainObject(value) && !isComponentDefinition(value)) {
          return { ...value }
        }
        if (Array.isArray(value)) return [...value]
      }

      return value
    })
  }

  // Managed keys get their resolver eagerly so config defaults are resolved
  // at setup (frozen-at-setup semantics), matching Vue's own default timing.
  for (const prop of managedKeys) {
    resolvers.set(prop, makeResolver(prop))
  }

  const refs = new Proxy(Object.create(null) as Record<string, any>, {
    get(target, key) {
      // Keep `reactive()` from wrapping the resolved props when they are read
      // through the context (`context.props`).
      if (key === '__v_skip') return true
      // Answer Vue's raw probe so `isProxy` — and with it `toRefs` — treats
      // the resolved props as reactive state (`toRefs(context.props)` works
      // without the dev warning). The raw form is the component's own setup
      // props, i.e. the values with defaults/config/preset resolution
      // stripped.
      if (key === '__v_raw') return props
      if (typeof key !== 'string') return Reflect.get(target, key)

      const resolver = resolvers.get(key)
      if (resolver) return resolver.value

      if (!allKeys.has(key)) return undefined

      // Plain runtime props skip the pipeline entirely, but presets added
      // after setup may start targeting them — reading `hasAnyPresets` /
      // `presetKeys` here keeps the consuming effect subscribed so the key
      // is upgraded to a full resolver when that happens.
      if (hasAnyPresets.value && presetKeys.value.has(key)) {
        const created = makeResolver(key)
        resolvers.set(key, created)
        return created.value
      }

      return (props as any)[key]
    },
    // Props are read-only. Without this trap a write (e.g. through a
    // `toRefs(context.props)` ref) would land silently on the hidden proxy
    // target and be shadowed by the resolvers — warn instead, like Vue's own
    // props do.
    set(_, key) {
      if (isDev()) {
        warn(
          `[vueform] props are read-only (attempted to set "${String(key)}").`
        )
      }
      return true
    },
    has(_, key) {
      return typeof key === 'string' && allKeys.has(key)
    },
    ownKeys() {
      return [...allKeys]
    },
    getOwnPropertyDescriptor(_, key) {
      if (typeof key === 'string' && allKeys.has(key)) {
        return { enumerable: true, configurable: true }
      }
      return undefined
    },
  })

  setResolvedProps(instance, refs)

  return refs as any
}

/**
 * Wraps a function-valued part so it is both directly spreadable by `v-bind`
 * (resolving via the Proxy traps for non-callable parts that use the `(context)
 * => obj` pattern) and callable as a function (for callable parts that forward
 * runtime args).
 *
 * Static-object values are NOT routed through here — they are returned by
 * `useParts` as-is, since callable parts always receive functions in the
 * current design and object-typed parts are only ever spread.
 *
 * @param value The user-provided function part value.
 * @param context The current component context, exposed to context-aware parts.
 * @param $security The security surface whose prop filter guards results.
 */
function createFunctionPart(
  value: (...args: any[]) => any,
  context: any,
  { $security }: { $security: Pick<SecurityModule, 'sanitizeProps'> }
): any {
  // Arrow function target: avoids `prototype` (non-configurable on regular
  // functions), keeping the Proxy `ownKeys` invariant satisfied even when the
  // resolved value has no own keys.
  const target = (...args: any[]) => value(...args, context)

  // `computed` re-evaluates the user function whenever its reactive deps
  // change, and registers itself as a dep of the surrounding render effect
  // when the proxy is read inside a template — this is what keeps `v-bind`
  // bindings reactive when the part is consumed via property access (the
  // `(context) => obj` pattern on a non-callable part). The resolved object
  // is attr-sanitized like every other parts source — function results can
  // incorporate untrusted data.
  const resolved = computed(() => {
    const r = value(context)
    return r != null && typeof r === 'object' ? $security.sanitizeProps(r) : r
  })

  return new Proxy(target, {
    get(_, key) {
      if (key === 'call' || key === 'apply' || key === 'bind') {
        return Reflect.get(target, key)
      }
      return resolved.value?.[key as any]
    },
    ownKeys() {
      return resolved.value != null && typeof resolved.value === 'object'
        ? Reflect.ownKeys(resolved.value)
        : []
    },
    getOwnPropertyDescriptor(_, key) {
      const r = resolved.value
      if (r != null && typeof r === 'object' && key in r) {
        return {
          value: r[key as any],
          enumerable: true,
          configurable: true,
          writable: true,
        }
      }
      return undefined
    },
  })
}

/**
 * Resolves part overrides for a component. Each part sources from, in priority
 * order: the resolved `part:<key>` prop (config defaults, presets, and user
 * values merged by `useProps`), the raw `part:<key>` attr, then the `parts`
 * prop. Static-object values are returned as-is (zero allocation overhead).
 * Function values are wrapped in a Proxy that is both spreadable and callable,
 * so the same wrapper supports both consumption patterns: `v-bind="parts.X"`
 * for non-callable parts using the `(context) => obj` pattern, and
 * `parts.X(args)` for callable parts.
 *
 * Accepts the resolved props object directly (any `Record` with an optional
 * `parts` field) so blueprint generics flow without an `as any` cast.
 *
 * @param props Resolved props from `useProps`.
 */
function useParts<TProps extends Record<string, any>>(
  props: TProps
): ResolvedParts<
  TProps extends { parts?: PartsProp<infer P> } ? P : Record<string, any>
> {
  const attrs = useAttrs()
  const context = useComponentContext()
  const instance = useCurrentInstance()
  const $security = getSecurityModule()

  // The resolved props proxy created by `useProps`. Namespaced `part:<key>`
  // props that a config default or preset targets are fully resolved there
  // (config + presets + user value, merged), so they take priority. Keys the
  // pipeline doesn't manage resolve to `undefined` and fall back to the raw
  // `part:*` attr.
  const resolvedProps = getResolvedProps(instance)

  // Cache function-valued parts so the same proxy is reused across renders for
  // a stable function reference. Lives at the top level of `useParts` so it
  // persists for the component's entire lifetime, not per reactive evaluation.
  const cache = new Map<string, { source: any; proxy: any }>()

  const resolveSource = (key: string) =>
    resolvedProps?.[`part:${key}`] ?? attrs[`part:${key}`] ?? props.parts?.[key]

  return new Proxy({} as any, {
    get(_, key) {
      // Keep `reactive()` from wrapping the parts proxy when it is read
      // through the context.
      if (key === '__v_skip') return true
      if (typeof key !== 'string') return undefined
      const source = resolveSource(key)
      if (typeof source !== 'function') {
        // `parts` is a schema-reachable attribute bag: strip HTML sinks
        // (`innerHTML`/`srcdoc`), string-valued `on*` entries, and
        // `$security.banProps` keys before the object hits a `v-bind`
        // spread. Clean bags (the common case) return the same reference,
        // keeping identity and reactivity.
        return source != null && typeof source === 'object'
          ? $security.sanitizeProps(source)
          : source
      }
      const entry = cache.get(key)
      if (entry && entry.source === source) return entry.proxy
      const proxy = createFunctionPart(
        source as (...args: any[]) => any,
        context,
        { $security }
      )
      cache.set(key, { source, proxy })
      return proxy
    },
    has(_, key) {
      return typeof key === 'string' && resolveSource(key) !== undefined
    },
    ownKeys() {
      const keys = new Set<string>()
      if (props.parts) {
        for (const k in props.parts) keys.add(k)
      }
      for (const k in attrs) {
        if (k.startsWith('part:')) keys.add(k.slice(5))
      }
      if (resolvedProps) {
        for (const k of Object.keys(resolvedProps)) {
          if (k.startsWith('part:')) keys.add(k.slice(5))
        }
      }
      return [...keys]
    },
    getOwnPropertyDescriptor(_, key) {
      if (typeof key !== 'string') return undefined
      if (resolveSource(key) === undefined) return undefined
      return {
        enumerable: true,
        configurable: true,
        writable: true,
        value: undefined,
      }
    },
  })
}

function withClassHelpers(
  value: any,
  name: string,
  key: string,
  classHelper: (key: string) => string
) {
  const path = `${name}.${String(key)}`
  const helper = classHelper(path)

  value =
    typeof value === 'function'
      ? (...args: any[]) => {
          const res = value(...args)
          return res ? mergeClass(helper, res) : null
        }
      : value
        ? mergeClass(helper, value)
        : null

  return value
}

/**
 * Resolves CSS class definitions for a component by merging theme defaults,
 * config overrides, presets, and user props. The component name is inferred
 * from the current instance and class keys are resolved lazily so factories may
 * be registered after `api` / `propRefs` exist. Factories receive those as
 * `(api, propRefs)`.
 *
 * @param api The component API passed to class factories.
 * @param propRefs Lazy `toRef` proxy over resolved props.
 */
function defineClasses<
  C extends Record<string, any> = Record<string, ClassValue>,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
>(api: TApi, propRefs: TPropRefs): DefineClassesReturn<C, TApi, TPropRefs> {
  const name = useCurrentName()
  const config = useConfig() as ReturnType<typeof useConfig>
  const context$ = useComponentContext()
  const instance = useCurrentInstance()
  const rawPropKeys = getInstanceRawPropKeys(instance)

  const isElement = !!config.components[name]?.element

  /**
   * The shared base class map installed by the element layout (`VfLayout`) at
   * mount, forming the foundational layer beneath the component's own classes.
   * A shallow ref: keys resolved before the layout mounts recompute once it
   * registers. Single writer — a later call replaces the map, so a remounting
   * layout stays idempotent.
   */
  const baseClassDefs = shallowRef<Record<string, any> | null>(null)

  const setBaseClasses = (defs: Record<string, any>) => {
    baseClassDefs.value = defs
  }

  /**
   * Component-level class definitions registered via `useClasses`. Stored as a
   * shallow ref so appending defs after setup still invalidates dependents.
   */
  const classDefs = shallowRef<ClassDefsArg<C, TApi, TPropRefs>[]>([])

  /**
   * Registers one or more class definition objects or factories. Factories are
   * not invoked until a class key is first read (typically during render).
   *
   * @param defs Class definition objects or factories.
   */
  const useClasses = (...defs: ClassDefsArg<C, TApi, TPropRefs>[]) => {
    if (defs.length === 0) return
    classDefs.value = [...classDefs.value, ...defs]
  }

  // Reactively resolve factory args so computed deps are tracked. Factories
  // run here only when a key computed (or ownKeys) first reads them.
  const resolvedClassDefs = computed(() => {
    return classDefs.value.map((cls) =>
      typeof cls === 'function' ? cls(api, propRefs) : cls
    )
  })

  /**
   * Override definitions registered from outside the component (custom
   * templates / slots via `useClasses()`). Unlike `classDefs`, these are not
   * merged with the component's own values: per key, the last override that
   * sets the key replaces the component-defined value, and keys no override
   * sets keep it.
   */
  const overrideDefs = shallowRef<ClassDefsArg<C, TApi, TPropRefs>[]>([])

  /**
   * Registers class definitions that override the component's own per key.
   *
   * @param defs Class definition objects or factories.
   */
  const useClassOverrides = (...defs: ClassDefsArg<C, TApi, TPropRefs>[]) => {
    if (defs.length === 0) return
    overrideDefs.value = [...overrideDefs.value, ...defs]
  }

  const resolvedOverrideDefs = computed(() => {
    return overrideDefs.value.map((cls) =>
      typeof cls === 'function' ? cls(api, propRefs) : cls
    )
  })

  const refs = reactive<Record<string, any>>({})
  const created = new Set<string>()

  // Injects context$ into an override value. Functional classes
  // receive it as the last arg; non-functional contextual functions
  // are resolved immediately.
  const resolveWithContext = (override: any, isFunctional: boolean) =>
    isFunctional && typeof override === 'function'
      ? (...args: any[]) => override(...args, context$)
      : typeof override === 'function'
        ? override(context$)
        : override

  const resolveKey = (key: string) => {
    const props = context$.props

    // Merge component-defined classes (useClasses args) for this key.
    const ownValue = resolvedClassDefs.value.reduce(
      (acc: any, resolved: any) => mergeClass(acc, resolved?.[key]),
      null
    )

    // Overrides from templates / slots: the last one that sets the key
    // replaces the component-defined value; otherwise the own value stands.
    const overrideValue = resolvedOverrideDefs.value.reduce(
      (acc: any, resolved: any) =>
        resolved?.[key] !== undefined ? resolved[key] : acc,
      undefined
    )

    const userValue = overrideValue !== undefined ? overrideValue : ownValue

    // The layout-installed shared base value for this key.
    const baseClassValue = baseClassDefs.value?.[key] ?? null

    // Base value = layout base + component self-defined.
    let value: any = mergeClass(baseClassValue, userValue)

    // Whether the base resolves to a callable class (e.g. root, item).
    const isFunctional = typeof value === 'function'

    // Config-level reclass override (component → *element → *).
    const configReclassProp =
      (config.reclass?.[name] as any)?.[key] ??
      (isElement ? (config.reclass?.['*element'] as any)?.[key] : undefined) ??
      (config.reclass?.['*'] as any)?.[key]

    const reclassProp =
      props.reclass?.[key] ?? getInstanceRawProp(instance, `reclass:${key}`)
    const classesProp = props.classes?.[key]
    const classKeyProp = getInstanceRawProp(instance, `class:${key}`)
    const classProp = props.class

    // Reclass replaces the entire value (prop takes priority over config).
    if (reclassProp) {
      value = resolveWithContext(reclassProp, isFunctional)
    } else if (configReclassProp) {
      value = resolveWithContext(configReclassProp, isFunctional)
    }

    // Wrap static reclass back into a function so the template
    // can still call it for functional class keys.
    if (isFunctional && typeof value !== 'function') {
      const plain = value
      value = () => plain
    }

    // Merge additive overrides from props.
    if (classesProp) {
      value = mergeClass(value, resolveWithContext(classesProp, isFunctional))
    }

    if (classKeyProp) {
      value = mergeClass(value, resolveWithContext(classKeyProp, isFunctional))
    }

    if (key.startsWith('root') && classProp) {
      value = mergeClass(value, classProp)
    }

    // Resolve refs inside the merged value (conditional-object conditions,
    // array members, or the value itself) — schemas hand them over raw, and
    // this runs inside the per-key computed, so the reads stay tracked.
    return unrefClass(
      config.classHelpers && isDev()
        ? withClassHelpers(value, name, key, config.classHelper)
        : value
    )
  }

  const ensureKey = (key: string) => {
    if (created.has(key)) return
    created.add(key)
    refs[key] = computed(() => resolveKey(key))
  }

  const collectKnownKeys = (): string[] => {
    const keys = new Set<string>()

    if (baseClassDefs.value) {
      for (const key of typedKeys(baseClassDefs.value)) {
        if (typeof key === 'string') keys.add(key)
      }
    }

    for (const prop of rawPropKeys) {
      if (prop.startsWith('class:')) {
        keys.add(prop.slice(6))
      } else if (prop.startsWith('reclass:')) {
        keys.add(prop.slice(8))
      }
    }

    const resolvedClasses = getResolvedProps(instance)?.classes
    if (resolvedClasses) {
      for (const key of Object.keys(resolvedClasses)) {
        keys.add(key)
      }
    }

    for (const resolved of [
      ...resolvedClassDefs.value,
      ...resolvedOverrideDefs.value,
    ]) {
      for (const key of typedKeys(resolved as Record<string, any>)) {
        if (typeof key === 'string') keys.add(key)
      }
    }

    for (const key of created) {
      keys.add(key)
    }

    return [...keys]
  }

  const classes = new Proxy(refs, {
    get(target, key, receiver) {
      // Vue's reactivity probes (`__v_skip`, `__v_raw`, …) must be answered
      // here rather than forwarded: the target is a reactive object that would
      // answer `__v_raw` with its own raw target, making `toRaw()` — which
      // `reactive()` runs on every assigned member — swap this proxy for that
      // bare object. `__v_skip` is answered so the context hands the proxy out
      // as-is; every other flag reads as absent, and none becomes a class key.
      if (typeof key === 'string' && key.startsWith('__v_')) {
        return key === '__v_skip' ? true : undefined
      }

      if (typeof key === 'string') {
        ensureKey(key)
      }
      return Reflect.get(target, key, receiver)
    },
    has(target, key) {
      if (typeof key === 'string') {
        ensureKey(key)
        return true
      }
      return Reflect.has(target, key)
    },
    ownKeys() {
      const keys = collectKnownKeys()
      for (const key of keys) ensureKey(key)
      return keys
    },
    getOwnPropertyDescriptor(target, key) {
      if (typeof key === 'string') {
        ensureKey(key)
        return {
          enumerable: true,
          configurable: true,
          get: () => Reflect.get(target, key),
        }
      }
      return Reflect.getOwnPropertyDescriptor(target, key)
    },
  }) as C & Record<string, any>

  return { classes, useClasses, useClassOverrides, setBaseClasses }
}

/**
 * Builds the `forwardProps` / `forwardSlots` computeds for a `makeForwards`
 * declaration: attrs with forwarded event listeners routed through the Vueform
 * event system, and the resolved outlets filtered to the names designated for
 * the underlying adapter component.
 *
 * @param config The forwarded event / slot names from `api.forwards`.
 * @param outlets The resolved outlets computed.
 */
function buildForwards(
  config: ForwardsConfig,
  outlets: ComputedRef<Record<string, any>>
) {
  const context$ = useComponentContext()
  const $attrs = useAttrs()

  const handlers: Record<string, (...args: any[]) => void> = {}
  const attrKeys = new Set<string>()

  for (const name of config.events ?? []) {
    const attrKey = `on${toPascalCase(name)}`
    attrKeys.add(attrKey)
    handlers[attrKey] = (...args: any[]) =>
      context$.fire(name, ...args, context$)
  }

  /**
   * Component attrs with forwarded event listeners routed through the Vueform
   * event system.
   */
  const forwardProps = computed(() => {
    const result: Record<string, any> = { ...handlers }
    for (const key in $attrs) {
      if (
        !attrKeys.has(key) &&
        !key.startsWith('part:') &&
        !key.startsWith('class:') &&
        !key.startsWith('reclass:')
      ) {
        result[key] = $attrs[key]
      }
    }
    return result
  })

  const slotNames = config.slots ? new Set(config.slots) : undefined

  /**
   * Outlets filtered to only include those designated for the underlying
   * adapter component.
   */
  const forwardSlots = computed(() => {
    if (!slotNames) return {}
    const result: Record<string, any> = {}
    for (const [name, slot] of Object.entries(outlets.value)) {
      if (slotNames.has(name)) {
        result[name] = slot
      }
    }
    return result
  })

  return { forwardProps, forwardSlots }
}

/**
 * Returns the resolved props object `useProps` created for a component
 * instance, or `undefined` when the component doesn't use `useProps`.
 *
 * @param instance The component's instance (VDOM or Vapor).
 * @internal
 */
export function getResolvedProps(instance: GenericInstance) {
  return resolvedProps.get(instance)
}

/**
 * Universal SFC-side blueprint consumer for prop-generic blueprints:
 *
 * ```ts
 * const { api, context } = useBlueprint(
 *   setup,
 *   props,
 *   events,
 *   slots,
 *   extension
 * )
 * ```
 *
 * Takes the blueprint's generic `setup` as a value so `TApi` is instantiated
 * from the SFC's concrete props at the call site. Call-site generic-argument
 * instantiation is the one TypeScript mechanism (besides `typeof setup<TProps>`
 * instantiation expressions) that preserves prop-generic narrowing, and it
 * works with deferred SFC generics (`TItems` etc.), so no per-blueprint
 * `useBlueprint` wrapper is needed.
 *
 * Prop validation flows through the `setup` argument: if the SFC's props don't
 * satisfy the blueprint's loose-props constraint, the error surfaces on `setup`
 * rather than on `rawProps`.
 *
 * Component-level defaults come from Vue's `withDefaults` on the SFC;
 * `useProps` only merges global config defaults and presets.
 *
 * @param setup Blueprint setup receiving resolved props and events.
 * @param rawProps Raw props from `defineProps` / `withDefaults`.
 * @param events Event emitter from `defineEvents`.
 * @param slots Slot map from `defineSlots`. Type-only: it instantiates the
 *   outlets' `TSlots`; the runtime outlets come from `useOutlets` (which reads
 *   the same slots via `useSlots()`).
 * @param extension Optional callback to add or overwrite API members.
 * @private
 */
export function useBlueprint<
  TProps extends Record<string, any>,
  TEvents extends Record<string, any>,
  TApi extends Record<string, any>,
  TSlots extends Record<string, any> = Record<string, any>,
  TExt = void,
>(
  setup: (props: LooseRequired<TProps>, events: TEvents) => TApi,
  rawProps: Readonly<TProps>,
  events: TEvents,
  _slots: TSlots = {} as TSlots,
  extension?: BlueprintExtension<TApi, LooseRequired<TProps>, TEvents, TExt>
): Blueprint2Api<
  SpreadMerge<TApi, ResolvedExtension<TExt>>,
  LooseRequired<TProps>,
  TEvents,
  ReturnType<typeof useParts<LooseRequired<TProps>>>,
  ClassesOfProps<LooseRequired<TProps>>,
  TSlots
> {
  // Context must exist before usePlugins/lifecycle wiring reads it, and
  // before useProps (which also creates it — idempotent).
  createComponentContext()

  const props = useProps(rawProps as LooseRequired<TProps>)
  const parts = useParts(props)

  const api = usePlugins<SpreadMerge<TApi, ResolvedExtension<TExt>>>(
    () => {
      const context$ = useComponentContext()
      const fire = (events as any).fire

      onBeforeMount(() => fire('beforeMount', context$))

      const result = setup(props, events)
      const extras = extension?.(result, props, events)
      const extended = (
        extras != null && typeof extras === 'object'
          ? { ...result, ...extras }
          : result
      ) as SpreadMerge<TApi, ResolvedExtension<TExt>>

      onMounted(() => fire('mounted', context$))
      onBeforeUnmount(() => fire('beforeUnmount', context$))
      onUnmounted(() => fire('unmounted', context$))
      onUpdated(() => fire('updated', context$))

      return extended
    },
    events as Record<string, any>
  )

  // Blueprint-provided `parts` (e.g. VfLayout forwarding `el$.parts`) wins.
  const resolvedParts =
    'parts' in api && (api as any).parts != null ? (api as any).parts : parts

  // Standard outlets (inline + prop-based slots, resolved template — see
  // `useOutlets`) are built here for every component. A blueprint-provided
  // `outlets` wins (only the layout blueprint, which resolves the element's
  // `layout` prop into `template` on top of its own `useOutlets` call).
  const outlets =
    'outlets' in api && (api as any).outlets != null
      ? (api as any).outlets
      : useOutlets(props).outlets

  // A `makeForwards` declaration (`api.forwards`) turns into the actual
  // `forwardProps` / `forwardSlots` here, where the resolved outlets computed
  // is in scope.
  if ((api as any).forwards != null) {
    Object.assign(api, buildForwards((api as any).forwards, outlets))
  }

  const propRefs = createPropRefs(props)

  // Event helpers and `props` must be on `api` before `useClasses` so
  // factories and the public context receive them.
  Object.assign(api, events, { props })

  const { classes, useClasses, useClassOverrides, setBaseClasses } =
    defineClasses(api, propRefs)

  // The single public context: the `reactive()` proxy created at the top of
  // setup (see `createComponentContext`). It is what event handlers receive as
  // `context$`, what `find()` returns, what `useContext()` returns, and what
  // the `#template` slot and the template outlet receive as `context` — one
  // object, ref members read unwrapped and assignable. The API is added
  // through the proxy so reads that happened before it (plugins, class
  // factories) re-run.
  const context = useComponentContext()

  // `props` is left out: the context's raw object serves the resolved props
  // through a getter from the moment it is created (see
  // `createComponentContext`), and `api.props` is that same object.
  const { props: _props, ...members } = api as Record<string, any>
  const assigned: Record<string, any> = {
    ...members,
    parts: resolvedParts,
    classes,
    outlets,
  }

  // These land on the context's raw object, so the placement rule applies
  // (see `opaque`): plain-object members (e.g. the form's `index`, which
  // holds refs of its own) are marked raw so a deep `reactive()` view of the
  // context hands them back as-is instead of unwrapping the refs inside them.
  for (const value of Object.values(assigned)) {
    opaque(value)
  }

  Object.assign(context, assigned)

  // Effects that read members before this point (a list row reading a
  // sibling's model through the registry while the sibling was still being
  // set up) re-run now.
  markContextReady(context)

  // The object the SFC hands to `defineExpose`: the raw target of the context,
  // so `toRaw(context)`, template refs (which Vue wraps with `proxyRefs`), and
  // the context itself all read the same members.
  const expose = toRaw(context)

  // Hidden doorway for `useClasses()` called from a custom template or slot:
  // registers definitions on this component's own registrar, where the latest
  // definition wins per key — the template overrides the keys it sets and the
  // component's values remain for the rest. Factories receive the public
  // (ref-unwrapped) context like event handlers do, not the raw `api`, so their
  // typing matches `ContextOf`. Lives on the raw object (reached through
  // `toRaw`), non-enumerable so it never shows up when it is spread.
  Object.defineProperty(expose, CLASS_REGISTRAR, {
    value: (...defs: any[]) =>
      useClassOverrides(
        ...defs.map((def) =>
          typeof def === 'function'
            ? (_api: any, refs: any) => def(context, refs)
            : def
        )
      ),
    enumerable: false,
    configurable: true,
  })

  // Hidden doorway for the element layout: installs the shared base class map
  // (`root`, `label`, `errors`, …) at the bottom of this component's class
  // chain, below `reclass`. Non-enumerable for the same reason as above.
  Object.defineProperty(expose, BASE_CLASS_REGISTRAR, {
    value: setBaseClasses,
    enumerable: false,
    configurable: true,
  })

  return {
    api,
    parts: resolvedParts,
    classes,
    outlets,
    propRefs,
    context,
    expose,
    useClasses,
  } as any
}
