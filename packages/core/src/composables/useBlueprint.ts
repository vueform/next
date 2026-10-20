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
} from '#src/composables'
import {
  BASE_CLASS_REGISTRAR,
  CLASS_REGISTRAR,
  createComponentContext,
  createPresetContext,
  markContextReady,
  opaque,
  useContext,
  useVueformContext,
  usePresetContext,
} from '#src/contexts'
import {
  type VueformGlobals,
  type DefineEvents,
  type VueformConfig,
} from '#src/helpers'
import type { LocaleModule } from '#src/modules/locale'
import { getSecurityModule } from '#src/modules/security'
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
  type UnwrapTopLevelRef,
} from '#src/types'
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
} from '#src/utils'

// ================= PRIVATE TYPES =================

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
   * Resolved CSS classes for the component, with keys created lazily on first
   * access.
   */
  classes: C & Record<string, any>

  /**
   * Registers one or more class definition objects or factories. Definitions
   * for the same key are merged.
   *
   * @param defs Class definition objects or factories.
   */
  useClasses: (...defs: ClassDefsArg<C>[]) => void

  /**
   * Registers override definitions from outside the component (templates /
   * slots). Per key, the last override that sets the key replaces the
   * component-defined value.
   *
   * @param defs Class definition objects or factories.
   */
  useClassOverrides: (
    ...defs: OverrideClassDefsArg<C, TApi, TPropRefs>[]
  ) => void

  /**
   * Installs the shared base class map at the bottom of the class chain.
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
 * Resolves event helpers: emit maps are wrapped with `DefineEvents`;
 * already-built `defineEvents()` returns pass through unchanged.
 */
type EventsOf<T extends Record<string, any>> = T extends {
  fire: (...args: any) => any
}
  ? T
  : DefineEvents<T>

/**
 * The public `props` shape on the context: resolved props minus type-only brand
 * keys.
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
 * and the resolved (non-ref) `props` object.
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
 * Extracts the component's class map from its props' `classes` prop.
 */
type ClassesOfProps<TProps> = TProps extends {
  classes?: ClassesProp<infer C>
}
  ? C extends Record<string, any>
    ? C
    : Record<string, any>
  : Record<string, any>

/**
 * Extracts the component's part vocabulary from its props' `parts` prop — the
 * `TParts` generic the bindings surface types resolver arguments from.
 */
type PartsOfProps<TProps> = Partial<
  TProps extends { parts?: PartsProp<infer P> } ? P : Record<string, any>
>

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
 * Normalizes an extension return: `void` / non-objects become `{}`.
 */
type ResolvedExtension<T> = T extends Record<string, any> ? T : {}

/**
 * Adds `ForwardsApi` to the api type when the blueprint carries a
 * `makeForwards` declaration.
 */
type ForwardsOf<TApi> = TApi extends { forwards: ForwardsConfig }
  ? ForwardsApi
  : {}

/**
 * Assembled blueprint return. Factory members live under `api` for internal
 * destructuring; `context` is the flat public shape used by `defineExpose` and
 * the `#template` slot.
 */
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
   * Resolved CSS classes for the component.
   */
  classes: TClasses

  /**
   * Merged named outlets: inline template slots combined with prop-based slot
   * component overrides.
   */
  outlets: ComputedRef<TSlots>

  /**
   * Lazy `toRef` proxy over resolved props for reactive destructuring.
   */
  propRefs: PropRefsOf<TProps>

  /**
   * The component's single public context — what the `#template` slot, event
   * handlers (`context$`), `find()`, and `useTemplateContext()` receive.
   */
  context: BlueprintContext<TApi, TProps, TEvents, TSlots, TParts, TClasses>

  /**
   * The per-part aggregate the template consumes: for each part key, one bag
   * (or resolver function when the part is functional) merging the part's
   * registered binding definitions and part attribute overrides. Classes are
   * not included — templates bind `:class="classes.x"` alongside.
   */
  bindings: BindingMemberOf<
    TSlots,
    ApiOf<TApi>,
    'bindings',
    BindingsOf<TParts, Record<string, any>>
  >

  /**
   * The object to hand to `defineExpose`: the raw API plus the resolved
   * `props`, `classes`, and `outlets`.
   */
  expose: ClassFactoryApi<TApi, ContextProps<TProps>, TEvents> & {
    props: ContextProps<TProps>
    classes: TClasses
    outlets: ComputedRef<TSlots>
    bindings: BindingMemberOf<
      TSlots,
      ApiOf<TApi>,
      'bindings',
      BindingsOf<TParts, Record<string, any>>
    >
  }

  /**
   * Registers component-level class definitions.
   *
   * @param defs Class definition objects or factories.
   */
  useClasses: (...defs: ClassDefsArg<TClasses>[]) => void

  /**
   * Registers part-keyed binding definitions (a11y, state markers, and any
   * other per-part attributes): for each part key a resolver function,
   * invoked at the consuming site with the template's call arguments (none
   * for arg-less parts). Entries for the same key resolve-then-shallow-merge
   * in registration order.
   *
   * @param defs Part-keyed binding definitions.
   */
  useBindings: (...defs: BindingDefsOf<BindingDefsSurfaceOf<TSlots>>[]) => void
}

/**
 * A class definition factory that receives the component API and prop refs when
 * invoked.
 */
type OverrideClassDefsFactory<
  C,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = (api: TApi, propRefs: TPropRefs) => LooseClasses<C>

/**
 * A part-keyed class definition registered via `useClasses`: for each class
 * key a `ClassValue`, a zero-argument resolver (resolved inside the key's own
 * computed — the key stays static), or a parameterized resolver (the key is
 * functional and templates call `classes.key(args)`). There are deliberately
 * NO whole-surface factories: entries close over the component scope, so
 * registering a definition performs no reactive reads and keys never inherit
 * one another's dependencies.
 */
type ClassDefsArg<C> = {
  [K in keyof C]?: C[K] extends (...args: any[]) => infer R
    ? // Functional keys also accept a plain static contribution: it merges
      // into the callable chain (e.g. a component's static `root` class under
      // the layout's functional base).
      C[K] | R
    : C[K] | (() => C[K])
}

/**
 * An override definition registered from outside the component (custom
 * templates / slots): a part-keyed object or a factory that returns one.
 * Factories here run inside each consuming key's computed.
 */
type OverrideClassDefsArg<
  C,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = LooseClasses<C> | OverrideClassDefsFactory<C, TApi, TPropRefs>

/**
 * Return type of `definePartBindings`: the registrar plus the structural
 * accessors the aggregate resolves through.
 */
type DefinePartBindingsReturn = {
  /**
   * Registers one or more part-keyed binding definitions.
   *
   * @param defs Part-keyed binding definitions.
   */
  useBindings: (...defs: BindingDefsInput[]) => void

  /**
   * The registered entries for a part key, untouched, in registration order.
   */
  entriesOf: (key: string) => BindingEntry[]

  /**
   * Every part key any registered definition mentions.
   */
  keysOf: () => string[]
}

/**
 * The component-level public context carried by the slots' `template` scope.
 * Component slot interfaces always pass their concrete `VfXContext` there, so
 * it is the one place the SFC's own types already reference the
 * Expose-declared binding surfaces (`bindings`). Resolves to `{}` when no
 * template slot is typed.
 */
type SlotContextOf<TSlots> = TSlots extends {
  template: (scope: { context: infer C }) => any
}
  ? C
  : {}

/**
 * Default context member type for a binding surface (`bindings` /
 * `modifiers`) when the context is not instantiated with an explicit
 * component-level type: the component context's type when the slots carry
 * one (the SFC side, where `TSlots` is the raw slots interface and the
 * template scope's `context` is the canonical `VfXContext`), otherwise the
 * api-provided member when the blueprint carries one, the loose part-keyed
 * shape as the last resort. Canonical component contexts never resolve
 * through this: they pass `VfXA11y` / `VfXModifiers` explicitly (and their
 * `ContextOutlets<TSlots>` blanks the template scope's `context` to
 * `unknown`, so no self-recursion is possible).
 */
type BindingMemberOf<TSlots, TApi, K extends string, TLoose> = [
  SlotContextOf<TSlots>,
] extends [Record<K, infer M>]
  ? M
  : K extends keyof TApi
    ? UnwrapTopLevelRef<TApi[K]>
    : TLoose

/**
 * The component's bindings definition surface (`VfXBindings`), recovered from
 * the slots' template context via the context's type-only `__bindingDefs`
 * channel; the loose part-keyed shape when the slots carry no typed context.
 */
type BindingDefsSurfaceOf<TSlots> = [SlotContextOf<TSlots>] extends [
  { __bindingDefs?: (defs: infer B) => void },
]
  ? [B] extends [never]
    ? Record<string, any>
    : B
  : Record<string, any>

/**
 * One aspect surface's member for a part key, normalized for aggregation:
 * the empty bag when the surface has no member for the key, non-nullable
 * otherwise (optional members stay callable/spreadable).
 */
type AspectOf<T, K> = K extends keyof T ? NonNullable<T[K]> : {}

/**
 * Resolves a functional aspect member to the bag it returns; plain bags pass
 * through.
 */
type ResolvedAspect<T> = T extends (...args: any[]) => infer R ? R : T

/**
 * A member's call parameters, `never` for non-function members.
 */
type AspectArgsOf<T> = T extends (...args: infer A) => any ? A : never

/**
 * The call signature a part's resolver accepts: the parameters declared by
 * the key's bindings member, falling back to the PART member's functional
 * signature (parts type per-item overrides even when the component declares
 * no entries — every key is a resolver, so no definition is required to call
 * one with arguments), empty for arg-less parts.
 */
type BindingArgsOf<P, B> = [AspectArgsOf<B>] extends [never]
  ? [AspectArgsOf<P>] extends [never]
    ? []
    : AspectArgsOf<P>
  : AspectArgsOf<B>

/**
 * One part's aggregated binding bag from the already-extracted member types:
 * its binding definition attributes (resolver entries resolved to their
 * returned bags) and its part attribute overrides. Classes are not included —
 * templates bind `:class="classes.x"` alongside.
 */
type BindingBagOf<P, B> = ResolvedAspect<B> & ResolvedAspect<P>

/**
 * One part's aggregate binding member: the key's resolver — always present,
 * never optional — called with the part's arguments or none:
 * `v-bind="bindings.input()"`, `v-bind="bindings.item(item)"`.
 */
type BindingOf<P, B> = (
  ...args: BindingArgsOf<P, B>
) => BindingBagOf<P, B> | undefined

/**
 * The call signature of one part's override resolver on the `parts` surface:
 * the part member's functional parameters, empty for arg-less parts.
 */
type PartArgsOf<T> = [AspectArgsOf<NonNullable<T>>] extends [never]
  ? []
  : AspectArgsOf<NonNullable<T>>

// ================= PUBLIC TYPES =================

/**
 * The resolved part-override surface of a component: the user's `part:<key>`
 * props / attrs and `parts` prop, keyed by the component's part vocabulary.
 * Every key is the part's override resolver — `parts.root()`,
 * `parts.item(file, index)` — returning the sanitized override bag (a function
 * override is invoked with the call-site arguments plus the component context
 * appended last), or `undefined` when there is no override. `Object.keys` /
 * the `in` operator enumerate the overridden keys. Consumed by
 * `defineAggregateBindings` (every `bindings.X()` call merges the override on
 * top of the registered definitions), and exposed as the context's `parts`
 * member for presence questions the merged bag cannot answer — `VfLayout`'s
 * passthrough root renders a wrapper `<div>` only when `el$.parts.root()` says
 * a raw override exists.
 */
export type Parts<TParts = Record<string, any>> = {
  [K in keyof TParts]-?: (
    ...args: PartArgsOf<TParts[K]>
  ) => Record<string, any> | undefined
} & Record<string, (...args: any[]) => Record<string, any> | undefined>

/**
 * One part's binding definition entry: ALWAYS a resolver function, invoked at
 * the consuming site with the template's call arguments (none for arg-less
 * parts). Every key of the `bindings` aggregate is uniformly a resolver —
 * there is no static/functional mode, so parts need no definition at all for
 * templates to resolve them with arguments (`bindings.item(file, index)`
 * works with zero entries, handing the arguments to user part overrides).
 */
export type BindingEntry = (
  ...args: any[]
) => Record<string, any> | null | undefined

/**
 * A part-keyed bindings definition registered via `useBindings`: for each
 * part key, one entry. Entries for the same key across definitions
 * resolve-then-shallow-merge in registration order. Deliberately NO
 * whole-surface factories — entries close over the component scope (or
 * receive the api through their pattern, e.g. `useBindings(inputAria(api))`),
 * so registering a definition performs no reactive reads.
 */
export type BindingDefs = Record<string, BindingEntry>

/**
 * Def-input shape for a resolved bindings surface: functional keys take their
 * declared resolver, static keys take the bag itself or a zero-argument
 * resolver (laziness is a definition-side freedom — the public `VfXBindings`
 * interfaces always declare the RESOLVED shapes). Patterns annotate their
 * returns with this.
 */
export type BindingDefsOf<B> = {
  [K in keyof B]?: B[K] extends (...args: infer A) => infer R
    ? // Parameterized keys: a contribution resolved with the key's call
      // arguments. A partial bag (or nothing) is fine: entries for the same
      // key merge.
      (...args: A) => Partial<R> | null | undefined
    : // Arg-less keys: a zero-argument contribution. Always a function — the
      // resolver runs at the consuming site, so its reactive reads track
      // there.
      () => Partial<B[K]> | null | undefined
}

/**
 * What the `useBindings` registrar accepts: part-keyed definition objects.
 * Typed `Record<string, any>` at the boundary so interface-typed pattern
 * results (which carry no index signature) are accepted; the per-key entry
 * contracts live on the component's `VfXBindings` interface and the pattern
 * interfaces.
 */
export type BindingDefsInput = Record<string, any>

/**
 * Default `bindings` definition surface when the context is not instantiated
 * with an explicit component-level `VfXBindings` type: the loose part-keyed
 * shape.
 */
export type DefaultContextBindings = Record<string, any>

/**
 * One part's resolved binding bag, looked up by key across the component's
 * Parts/Bindings interfaces — the slot scope type for a single
 * `bindings` prop, e.g. `PartBindings<'text', VfButtonParts>`. Surfaces that
 * do not carry the key contribute nothing, and functional members resolve to
 * their returned bags, so the same form works for every part.
 *
 * Includes `undefined`: a resolver returns `undefined` when the part
 * currently has nothing to bind (no definition entries and no part override),
 * so the possible absence is part of what a slot receives — call sites never
 * append it.
 *
 * Components whose slots pass several bindings bags should build one private
 * map instead: `type VfXBags = ResolvedBindings<VfXParts, VfXBindings>` and
 * reference `VfXBags['item']` per slot.
 */
export type PartBindings<K extends PropertyKey, TParts, TBindings = {}> =
  | BindingBagOf<AspectOf<TParts, K>, AspectOf<TBindings, K>>
  | undefined

/**
 * Every part's resolved binding bag, keyed like the component's `bindings`
 * aggregate — the building block for a component's private resolved-bags
 * alias (see `PartBindings`).
 */
export type ResolvedBindings<TParts, TBindings = {}> = {
  [K in keyof TParts | keyof TBindings]: PartBindings<K, TParts, TBindings>
}

/**
 * The per-part `bindings` aggregate type: for every part key (plus any
 * definition-only key not yet anchored to a part), the key's resolver.
 * Templates always call — `v-bind="bindings.x()"` /
 * `v-bind="bindings.item(…)"` — and slots receive the resolved bag as their
 * `bindings` prop.
 */
export type BindingsOf<TParts, TBindings> = {
  [K in keyof TParts | keyof TBindings]: BindingOf<
    AspectOf<TParts, K>,
    AspectOf<TBindings, K>
  >
} & Record<string, any>

/**
 * The members `useBlueprint` builds for a `makeForwards` declaration and
 * assigns onto the api.
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
 * The events and slots an adapter component forwards to the underlying
 * third-party component.
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
 * Unified public component context: factory API and event helpers at the root,
 * plus resolved `props` / `parts` / `classes` / `outlets` / `bindings`.
 * `$config`, `$locale`, and `$globals` are always present. `parts` is the
 * part-override surface (`Parts`), not a bag: overrides render through
 * `bindings.X()` (the `TParts` vocabulary types the resolver arguments), and
 * `parts.x()` answers what the user overrode.
 */
export type BlueprintContext<
  TApi,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
  TSlots extends Record<string, any> = Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
  TBindings = DefaultContextBindings,
> = UnwrapApiRefs<
  // `outlets` is omitted from the api side: blueprints type it wide
  // (`ComputedRef<Record<string, any>>` from `useOutlets`), and intersecting
  // that with the declared `outlets` member below collapses every outlet to
  // `any`.
  Omit<ApiOf<TApi>, 'outlets'> &
    EventsOf<TEvents> & {
      props: ContextProps<TProps>
      parts: Parts<TParts>
      // Declared keys keep their types; any other key resolves too (the
      // classes proxy creates keys lazily), so templates can read keys they
      // registered via `useClasses` or that users supply through `classes`.
      classes: TClasses & Record<string, any>
      outlets: ComputedRef<TSlots>

      /**
       * The per-part aggregate the template consumes: for each part key, one
       * bag (or resolver function when the part is functional) merging the
       * part's registered binding definitions and part attribute overrides.
       * Classes are not included — templates bind `:class="classes.x"`
       * alongside.
       */
      bindings: BindingMemberOf<
        TSlots,
        ApiOf<TApi>,
        'bindings',
        BindingsOf<TParts, TBindings>
      >

      /**
       * Type-only channel carrying the component's bindings definition
       * surface (`VfXBindings`), so `useBlueprint` can type the `useBindings`
       * registrar it returns to the SFC. Function-typed so the channel is
       * CONTRAVARIANT: the loosely-instantiated SFC-side context stays
       * assignable to the concrete `VfXContext`. Never assigned at runtime.
       *
       * @internal
       */
      readonly __bindingDefs?: (defs: TBindings) => void

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

// ================= PRIVATE CONSTANTS =================

/**
 * Resolved props objects created by `useProps`, keyed by component instance.
 */
const resolvedProps = new WeakMap<GenericInstance, Record<string, any>>()

/**
 * Module-level memo for kebab-cased prop names.
 */
const kebabCache = new Map<string, string>()

// ================= PRIVATE FUNCTIONS =================

/**
 * Resolves component props by merging global config defaults, presets, and
 * user-provided values in priority order.
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
 * Builds the component's part-override surface: for every part key, the key's
 * override resolver. Each part sources from, in priority order: the resolved
 * `part:<key>` prop, the raw `part:<key>` attr, then the `parts` prop.
 * Overrides are resolved on demand (inside whichever effect calls
 * `bindings.X()` or `parts.x()`), so their reactive reads land in the
 * consumer — same per-key dependency isolation as binding definition entries.
 *
 * @param props Resolved props from `useProps`.
 */
function useParts(props: Record<string, any>): Parts {
  const attrs = useAttrs()
  const context = useContext()
  const instance = useCurrentInstance()
  const $security = getSecurityModule()

  // The resolved props proxy created by `useProps`. Namespaced `part:<key>`
  // props that a config default or preset targets are fully resolved there
  // (config + presets + user value, merged), so they take priority. Keys the
  // pipeline doesn't manage resolve to `undefined` and fall back to the raw
  // `part:*` attr.
  const resolvedProps = getResolvedProps(instance)

  const sourceOf = (key: string) =>
    resolvedProps?.[`part:${key}`] ?? attrs[`part:${key}`] ?? props.parts?.[key]

  const resolveOverride = (key: string, args: any[]) => {
    const source = sourceOf(key)
    if (source == null) return undefined

    // A function override is invoked with the call-site arguments, the
    // component context appended last — per-item parts receive
    // `(item, index, context$)`, arg-less parts `(context$)`.
    const bag = typeof source === 'function' ? source(...args, context) : source

    // `parts` is a schema-reachable attribute bag: strip HTML sinks
    // (`innerHTML`/`outerHTML`), prototype keys, and entries matching
    // `$security.banProps` before the bag hits a `v-bind` spread. Clean bags
    // (the common case) return the same reference. Non-object results carry
    // no attributes.
    return bag != null && typeof bag === 'object'
      ? $security.sanitizeProps(bag)
      : undefined
  }

  const resolvers = new Map<string, (...args: any[]) => any>()

  const resolverOf = (key: string) => {
    let resolver = resolvers.get(key)
    if (!resolver) {
      resolver = (...args: any[]) => resolveOverride(key, args)
      resolvers.set(key, resolver)
    }
    return resolver
  }

  const collectKeys = () => {
    const found = new Set<string>()
    if (props.parts) {
      for (const k in props.parts) found.add(k)
    }
    for (const k in attrs) {
      if (k.startsWith('part:')) found.add(k.slice(5))
    }
    if (resolvedProps) {
      for (const k of Object.keys(resolvedProps)) {
        if (k.startsWith('part:')) found.add(k.slice(5))
      }
    }
    return [...found]
  }

  return new Proxy({} as Record<string, any>, {
    get(_, key) {
      // See the classes proxy: reactivity probes must be answered here.
      if (typeof key === 'string' && key.startsWith('__v_')) {
        return key === '__v_skip' ? true : undefined
      }

      if (typeof key !== 'string') return undefined
      return resolverOf(key)
    },
    // Presence-based, unlike the bindings aggregate: `'root' in parts`
    // answers whether the user overrode that part.
    has(_, key) {
      return typeof key === 'string' && sourceOf(key) !== undefined
    },
    ownKeys() {
      return collectKeys()
    },
    getOwnPropertyDescriptor(_, key) {
      if (typeof key === 'string') {
        return {
          enumerable: true,
          configurable: true,
          get: () => resolverOf(key),
        }
      }
      return undefined
    },
  }) as Parts
}

/**
 * Resolves CSS class definitions for a component by merging theme defaults,
 * config overrides, presets, and user props.
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
  const context$ = useContext()
  const instance = useCurrentInstance()
  const rawPropKeys = getInstanceRawPropKeys(instance)

  const isElement = !!config.components[name]?.element

  /**
   * The shared base class map installed by the element layout, forming the
   * foundational layer beneath the component's own classes.
   */
  const baseClassDefs = shallowRef<Record<string, any> | null>(null)

  const setBaseClasses = (defs: Record<string, any>) => {
    baseClassDefs.value = defs
  }

  /**
   * Component-level class definitions registered via `useClasses`.
   */
  const classDefs = shallowRef<ClassDefsArg<C>[]>([])

  /**
   * Registers one or more class definition objects or factories.
   *
   * @param defs Class definition objects or factories.
   */
  const useClasses = (...defs: ClassDefsArg<C>[]) => {
    if (defs.length === 0) return
    classDefs.value = [...classDefs.value, ...defs]
  }

  // One entry of one definition, read for one key: zero-argument resolvers
  // are invoked HERE — inside the consuming key's own computed — so their
  // reactive reads track per key and keys never inherit one another's
  // dependencies (the former whole-surface factory computed made every key a
  // subscriber of every definition's reads). Parameterized resolvers pass
  // through: they stay callable and resolve at the template's call site.
  const resolveDefEntry = (entry: any) =>
    typeof entry === 'function' && entry.length === 0 ? entry() : entry

  /**
   * Override definitions registered from outside the component (custom
   * templates / slots). Per key, the last override that sets the key replaces
   * the component-defined value.
   */
  const overrideDefs = shallowRef<OverrideClassDefsArg<C, TApi, TPropRefs>[]>(
    []
  )

  /**
   * Registers class definitions that override the component's own per key.
   *
   * @param defs Class definition objects or factories.
   */
  const useClassOverrides = (
    ...defs: OverrideClassDefsArg<C, TApi, TPropRefs>[]
  ) => {
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

    // Merge component-defined classes (useClasses args) for this key —
    // reading each definition's entry directly, so only THIS key's computed
    // tracks what its entries read.
    const ownValue = classDefs.value.reduce(
      (acc: any, def: any) => mergeClass(acc, resolveDefEntry(def?.[key])),
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

    // The layout-installed shared base value for this key (zero-argument
    // entries resolve here like definition entries do).
    const baseClassValue = resolveDefEntry(baseClassDefs.value?.[key]) ?? null

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
      ...classDefs.value,
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
 * The single part-keyed attribute surface registered via `useBindings`.
 * Part-keyed definitions ONLY — there are deliberately no whole-surface
 * factories: entries close over the component scope (or receive the api
 * through their pattern, e.g. `useBindings(inputAria(api))`), so REGISTERING
 * a definition performs no reactive reads. Entries resolve one at a time at
 * their consuming site (see `defineAggregateBindings`), which is
 * load-bearing: resolving inside a shared computed would hand every key's
 * subscribers every entry's reads, and an eagerly-read child-aggregate
 * (`invalid`, form `errors`) closes a reactive cycle through children's
 * vapor dynamic prop sources that Vue 3.6's dirty-check cannot terminate on.
 */
function definePartBindings(): DefinePartBindingsReturn {
  const defs = shallowRef<BindingDefs[]>([])

  const useBindings = (...newDefs: BindingDefsInput[]) => {
    if (newDefs.length === 0) return
    defs.value = [...defs.value, ...newDefs]
  }

  // Structure only: collecting a key's entries hands them over untouched —
  // no entry executes here.
  const entriesOf = (key: string): BindingEntry[] => {
    const list: BindingEntry[] = []
    for (const def of defs.value) {
      const entry = def[key]
      if (entry !== undefined) list.push(entry)
    }
    return list
  }

  const keysOf = (): string[] => {
    const keys = new Set<string>()
    for (const def of defs.value) {
      for (const key of Object.keys(def)) keys.add(key)
    }
    return [...keys]
  }

  return { useBindings, entriesOf, keysOf }
}

/**
 * Builds the per-part `bindings` aggregate the templates consume. EVERY key
 * is uniformly a resolver — templates always call, with the part's arguments
 * or none: `v-bind="bindings.input()"`, `v-bind="bindings.item(item)"`. The
 * call resolves the part's definition entries (each invoked with the
 * call-site arguments; resolve-then-shallow-merge in registration order) and
 * the part override on top (resolved through the `Parts` surface — a function
 * override is invoked with the same arguments, the symmetry doctrine). There
 * is no static/functional mode, so a part needs NO definition entry for a
 * template to resolve it with arguments. Classes are not included — templates
 * bind them separately via `:class="classes.x"`.
 *
 * Entries resolve at call time, so whichever effect calls the key (usually
 * the consuming render effect) tracks that entry's reads — and only that
 * entry's: keys never inherit one another's dependencies, which keeps
 * child-aggregate reads (`invalid`, form `errors`) out of the bags that
 * children's vapor prop sources pull (see `definePartBindings`).
 *
 * @param parts The component's part-override surface.
 * @param bindingDefs The component's registered binding definitions.
 */
function defineAggregateBindings(
  parts: Parts,
  bindingDefs: Pick<DefinePartBindingsReturn, 'entriesOf' | 'keysOf'>
) {
  const resolvers = new Map<string, (...args: any[]) => any>()

  const buildBag = (key: string, args: any[]) => {
    let bag: Record<string, any> | undefined

    for (const entry of bindingDefs.entriesOf(key)) {
      const resolved = typeof entry === 'function' ? entry(...args) : entry
      if (!resolved) continue
      bag = bag ? { ...bag, ...resolved } : { ...resolved }
    }

    // The part override merges on top, sanitized (a function override is
    // invoked with the call-site arguments — the symmetry doctrine).
    const p = parts[key]?.(...args)
    if (p) bag = bag ? { ...bag, ...p } : p

    return bag
  }

  const resolveKey = (key: string) => {
    let resolver = resolvers.get(key)
    if (!resolver) {
      resolver = (...args: any[]) => buildBag(key, args)
      resolvers.set(key, resolver)
    }
    return resolver
  }

  const collectKnownKeys = (): string[] => {
    const keys = new Set<string>([
      ...bindingDefs.keysOf(),
      ...Object.keys(parts),
    ])
    return [...keys]
  }

  return new Proxy({} as Record<string, any>, {
    get(_, key) {
      // See the classes proxy: reactivity probes must be answered here.
      if (typeof key === 'string' && key.startsWith('__v_')) {
        return key === '__v_skip' ? true : undefined
      }

      if (typeof key !== 'string') return undefined
      return resolveKey(key)
    },
    has(_, key) {
      return typeof key === 'string'
    },
    ownKeys() {
      return collectKnownKeys()
    },
    getOwnPropertyDescriptor(_, key) {
      if (typeof key === 'string') {
        return {
          enumerable: true,
          configurable: true,
          get: () => resolveKey(key),
        }
      }
      return undefined
    },
  })
}

/**
 * Builds the `forwardProps` / `forwardSlots` computeds for a `makeForwards`
 * declaration.
 *
 * @param config The forwarded event / slot names from `api.forwards`.
 * @param outlets The resolved outlets computed.
 */
function buildForwards(
  config: ForwardsConfig,
  outlets: ComputedRef<Record<string, any>>
) {
  const context$ = useContext()
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
 * is forwarded to descendants.
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

// ================= PUBLIC FUNCTIONS =================

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
 * Universal SFC-side blueprint consumer: runs the blueprint's `setup` with
 * resolved props and events, and assembles the component's api, parts, classes,
 * outlets, context, and expose object.
 *
 * @private
 * @param setup Blueprint setup receiving resolved props and events.
 * @param rawProps Raw props from `defineProps` / `withDefaults`.
 * @param events Event emitter from `defineEvents`.
 * @param slots Slot map from `defineSlots` (type-only).
 * @param extension Optional callback to add or overwrite API members.
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
  PartsOfProps<LooseRequired<TProps>>,
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
      const context$ = useContext()
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

  // The single part-keyed attribute surface (a11y, state markers, and any
  // other per-part attrs), defined entirely at the component layer via
  // `useBindings` — every entry a resolver, zero-argument for arg-less parts,
  // parameterized for per-item parts (often through a canonical pattern from
  // `#src/a11y`).
  const { useBindings, entriesOf, keysOf } = definePartBindings()

  // The per-part aggregate the templates consume: for each part key, one bag
  // merging the part's registered binding definitions and part attribute
  // overrides. Classes are not included — templates bind them separately via
  // `:class="classes.x"`.
  const bindings = defineAggregateBindings(parts, { entriesOf, keysOf })

  // The single public context: the `reactive()` proxy created at the top of
  // setup (see `createComponentContext`). It is what event handlers receive as
  // `context$`, what `find()` returns, what `useTemplateContext()` returns, and what
  // the `#template` slot and the template outlet receive as `context` — one
  // object, ref members read unwrapped and assignable. The API is added
  // through the proxy so reads that happened before it (plugins, class
  // factories) re-run.
  const context = useContext()

  // `props` is left out: the context's raw object serves the resolved props
  // through a getter from the moment it is created (see
  // `createComponentContext`), and `api.props` is that same object.
  const { props: _props, ...members } = api as Record<string, any>
  const assigned: Record<string, any> = {
    ...members,
    parts,
    classes,
    outlets,
    bindings,
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
    classes,
    outlets,
    propRefs,
    context,
    expose,
    bindings,
    useClasses,
    useBindings,
  } as any
}
