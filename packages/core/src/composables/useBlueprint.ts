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
  useComponentContext,
  useVueformContext,
  usePresetContext,
} from '#src/contexts'
import {
  type VueformGlobals,
  type DefineEvents,
  type VueformConfig,
} from '#src/helpers'
import type { LocaleModule } from '#src/modules/locale'
import { getSecurityModule, type SecurityModule } from '#src/modules/security'
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

/**
 * Attribute bindings for a single DOM part: ARIA attributes, ids, and roles
 * meant to be applied with a single `v-bind`.
 */
export type A11yBindingBag = Record<
  string,
  string | number | boolean | undefined
>

/**
 * Part-keyed accessibility bindings of a component — the loose shape the
 * context machinery falls back to when no component-level `VfXA11y` is in
 * scope. Each key names a DOM part (using the same vocabulary as
 * `parts`/`classes`) and holds the attributes that part must carry — a plain
 * bag, or for per-item parts a function of the item's position returning the
 * bag (resolved at the call site like functional parts).
 */
export type A11yBindings<TPart extends string = string> = Partial<
  Record<TPart, A11yBindingBag | ((...args: any[]) => A11yBindingBag)>
>

/**
 * Styling attributes for a single DOM part: `data-*` state and variant
 * attributes meant to be applied with a single `v-bind`. Presence attributes
 * carry `''` when active and `undefined` when not (so Vue removes them instead
 * of rendering `"false"`).
 */
export type ModifierBag = Record<string, string | number | undefined>

/**
 * Part-keyed styling modifiers of a component — the loose shape the context
 * machinery falls back to when no component-level `VfXModifiers` is in scope.
 * Each key names a DOM part (using the same vocabulary as `parts`/`classes`)
 * and holds the `data-*` attributes that part must carry — a plain bag, or
 * for per-item parts a function of the item's position/state returning the
 * bag (resolved at the call site like functional parts).
 */
export type Modifiers<TPart extends string = string> = Partial<
  Record<TPart, ModifierBag | ((...args: any[]) => ModifierBag)>
>

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
  useClasses: (...defs: ClassDefsArg<C, TApi, TPropRefs>[]) => void

  /**
   * Registers override definitions from outside the component (templates /
   * slots). Per key, the last override that sets the key replaces the
   * component-defined value.
   *
   * @param defs Class definition objects or factories.
   */
  useClassOverrides: (...defs: ClassDefsArg<C, TApi, TPropRefs>[]) => void

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
   * Resolved part attribute overrides.
   */
  parts: TParts

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
   * handlers (`context$`), `find()`, and `useContext()` receive.
   */
  context: BlueprintContext<TApi, TProps, TEvents, TSlots, TParts, TClasses>

  /**
   * Merged part-keyed accessibility bindings registered by the component via
   * `useA11y` (usually through a canonical `#src/a11y` pattern).
   */
  a11yBindings: MergedBindings<TApi, TSlots, 'a11yBindings', A11yBindings>

  /**
   * Merged part-keyed styling modifiers registered by the component via
   * `useModifiers` (`data-*` state and variant attributes).
   */
  modifiers: MergedBindings<TApi, TSlots, 'modifiers', Modifiers>

  /**
   * The per-part aggregate the template consumes: for each part key, one bag
   * (or resolver function) merging the part's modifiers, a11y bindings, part
   * attribute overrides, and resolved classes (as `class`).
   */
  bindings: BindingMemberOf<
    TSlots,
    ApiOf<TApi>,
    'bindings',
    BindingsOf<TParts, TClasses, Modifiers, A11yBindings>
  >

  /**
   * The object to hand to `defineExpose`: the raw API plus the resolved
   * `props`, `parts`, `classes`, and `outlets`.
   */
  expose: ClassFactoryApi<TApi, ContextProps<TProps>, TEvents> & {
    props: ContextProps<TProps>
    parts: TParts
    classes: TClasses
    outlets: ComputedRef<TSlots>
    a11yBindings: MergedBindings<TApi, TSlots, 'a11yBindings', A11yBindings>
    modifiers: MergedBindings<TApi, TSlots, 'modifiers', Modifiers>
    bindings: BindingMemberOf<
      TSlots,
      ApiOf<TApi>,
      'bindings',
      BindingsOf<TParts, TClasses, Modifiers, A11yBindings>
    >
  }

  /**
   * Registers component-level class definitions.
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

  /**
   * Registers component-level accessibility binding definitions (part-keyed
   * `aria-*`/role bags), usually by invoking a canonical pattern from
   * `#src/a11y`. Bags for the same part shallow-merge; functional entries
   * replace the whole entry.
   *
   * @param defs Binding definition objects or factories.
   */
  useA11y: (
    ...defs: BindingDefsArg<
      ClassFactoryApi<TApi, TProps, TEvents>,
      PropRefsOf<TProps>
    >[]
  ) => void

  /**
   * Registers component-level styling modifier definitions (part-keyed
   * `data-*` bags). Bags for the same part shallow-merge; functional entries
   * replace the whole entry.
   *
   * @param defs Modifier definition objects or factories.
   */
  useModifiers: (
    ...defs: BindingDefsArg<
      ClassFactoryApi<TApi, TProps, TEvents>,
      PropRefsOf<TProps>
    >[]
  ) => void
}

/**
 * A class definition factory that receives the component API and prop refs when
 * invoked.
 */
type ClassDefsFactory<
  C,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = (api: TApi, propRefs: TPropRefs) => LooseClasses<C>

/**
 * A class definition object or a factory that returns one.
 */
type ClassDefsArg<
  C,
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = LooseClasses<C> | ClassDefsFactory<C, TApi, TPropRefs>

/**
 * A bindings definition factory that receives the component API and prop refs
 * when invoked — same calling convention as `useClasses` factories.
 */
type BindingDefsFactory<
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = (api: TApi, propRefs: TPropRefs) => Record<string, any>

/**
 * A bindings definition object or a factory that returns one: part-keyed bags
 * of attributes, or functions returning a bag for per-item parts.
 */
type BindingDefsArg<
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = Record<string, any> | BindingDefsFactory<TApi, TPropRefs>

/**
 * Return type of `defineBindings`: the merged part-keyed bags computed plus
 * the registrar for component-level definitions.
 */
type DefineBindingsReturn<
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
> = {
  /**
   * Merged part-keyed binding bags: the blueprint-provided base with
   * component-registered definitions layered on top.
   */
  bindings: ComputedRef<Record<string, any>>

  /**
   * Registers one or more binding definition objects or factories. Bags for
   * the same part shallow-merge on top of earlier layers; functional entries
   * replace the whole entry.
   *
   * @param defs Binding definition objects or factories.
   */
  useBindings: (...defs: BindingDefsArg<TApi, TPropRefs>[]) => void
}

/**
 * The component-level public context carried by the slots' `template` scope.
 * Component slot interfaces always pass their concrete `VfXContext` there, so
 * it is the one place the SFC's own types already reference the
 * Expose-declared binding surfaces (`a11yBindings: VfXA11y` / `modifiers:
 * VfXModifiers`). Resolves to `{}` when no template slot is typed.
 */
type SlotContextOf<TSlots> = TSlots extends {
  template: (scope: { context: infer C }) => any
}
  ? C
  : {}

/**
 * The merged surface `useBlueprint` returns for one binding system
 * (`a11yBindings` / `modifiers`): the component context's Expose-declared type
 * when the slots carry one (precise per component), otherwise the
 * blueprint-provided base type (when the api carries one) intersected with
 * the loose part-keyed shape so component-registered bags stay readable.
 */
type MergedBindings<TApi, TSlots, K extends string, TLoose> = ComputedRef<
  [SlotContextOf<TSlots>] extends [Record<K, infer M>]
    ? M
    : K extends keyof TApi
      ? UnwrapTopLevelRef<TApi[K]> & TLoose
      : TLoose
>

/**
 * Default context member type for a binding surface (`a11yBindings` /
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
 * Default `a11yBindings` context member type — see `BindingMemberOf`. Used
 * as the `TA11y` default by `BlueprintContext` and the `*Context` builders.
 */
export type DefaultContextA11y<TApi, TSlots> = BindingMemberOf<
  TSlots,
  ApiOf<TApi>,
  'a11yBindings',
  A11yBindings
>

/**
 * Default `modifiers` context member type — see `BindingMemberOf`. Used as
 * the `TModifiers` default by `BlueprintContext` and the `*Context` builders.
 */
export type DefaultContextModifiers<TApi, TSlots> = BindingMemberOf<
  TSlots,
  ApiOf<TApi>,
  'modifiers',
  Modifiers
>

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
 * The call signature a part's aggregate binding resolves with: the parameters
 * of its first functional ASPECT member (modifiers, a11y, classes — the
 * symmetry doctrine makes them identical), or `never` when the key is static.
 *
 * Deliberately ignores the part member: the runtime decides a key's mode from
 * the registered aspect definitions (part overrides are dual-surface wrappers
 * that cannot signal it), so deriving the typed mode from the same surfaces
 * keeps types and runtime equal by construction. A functional part key with
 * no functional aspect member types as a static bag — calling it is a type
 * error, which is the compiler telling you to add the backing definition.
 */
type BindingArgsOf<_P, C, M, A> = M extends (...args: infer R) => any
  ? R
  : A extends (...args: infer R) => any
    ? R
    : C extends (...args: infer R) => any
      ? R
      : never

/**
 * One part's aggregated binding bag from the already-extracted member types:
 * its modifier and a11y attributes, its part attribute overrides (functional
 * members resolved to their returned bags), and its resolved classes under
 * `class` (merged, never replaced, with part-level `class` overrides).
 */
type BindingBagOf<P, M, A> = Omit<
  ResolvedAspect<M> & ResolvedAspect<A> & ResolvedAspect<P>,
  'class'
> & {
  /**
   * The part's resolved CSS classes, including part-level `class` overrides.
   */
  class?: ClassValue
}

/**
 * One part's resolved binding bag, looked up by key across the component's
 * Parts/Modifiers/A11y interfaces — the slot scope type for a single
 * `bindings` prop, e.g. `PartBindings<'text', VfButtonParts>`. Surfaces that
 * do not carry the key contribute nothing, and functional members resolve to
 * their returned bags, so the same form works for every part.
 *
 * Includes `undefined`: the aggregate hands a slot `undefined` when the part
 * currently has nothing to bind (no modifier/a11y bag, no part override, and
 * classes resolving to nothing), so the possible absence is part of what a
 * slot receives — call sites never append it.
 *
 * Components whose slots pass several bindings bags should build one private
 * map instead: `type VfXBindings = ResolvedBindings<VfXParts, VfXModifiers,
 * VfXA11y>` and reference `VfXBindings['item']` per slot.
 */
export type PartBindings<
  K extends PropertyKey,
  TParts,
  TModifiers = {},
  TA11y = {},
> =
  | BindingBagOf<
      AspectOf<TParts, K>,
      AspectOf<TModifiers, K>,
      AspectOf<TA11y, K>
    >
  | undefined

/**
 * Every part's resolved binding bag, keyed like the component's `bindings`
 * aggregate — the building block for a component's private `VfXBindings`
 * alias (see `PartBindings`).
 */
export type ResolvedBindings<TParts, TModifiers = {}, TA11y = {}> = {
  [K in keyof TParts | keyof TModifiers | keyof TA11y]: PartBindings<
    K,
    TParts,
    TModifiers,
    TA11y
  >
}

/**
 * One part's aggregate binding member: the merged bag itself (possibly
 * `undefined`) for static keys, bound bare with `v-bind="bindings.x"`; or the
 * key's resolver — always present, never optional — for functional keys,
 * called as `v-bind="bindings.item(…)"`.
 */
type BindingOf<P, C, M, A> = [BindingArgsOf<P, C, M, A>] extends [never]
  ? BindingBagOf<P, M, A> | undefined
  : (...args: BindingArgsOf<P, C, M, A>) => BindingBagOf<P, M, A> | undefined

/**
 * The per-part `bindings` aggregate type: for every part key (plus any
 * aspect-only key not yet anchored to a part), the merged bag (static keys)
 * or its resolver function (functional keys). Templates bind
 * `v-bind="bindings.x"` / `v-bind="bindings.item(…)"` and slots receive the
 * resolved bag as their `bindings` prop.
 */
export type BindingsOf<TParts, TClasses, TModifiers, TA11y> = {
  [
    K in keyof TParts | keyof TClasses | keyof TModifiers | keyof TA11y
  ]: BindingOf<
    AspectOf<TParts, K>,
    AspectOf<TClasses, K>,
    AspectOf<TModifiers, K>,
    AspectOf<TA11y, K>
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
 * Unified public component context: factory API and event helpers at the root,
 * plus resolved `props` / `parts` / `classes` / `outlets`. `$config`,
 * `$locale`, and `$globals` are always present.
 */
export type BlueprintContext<
  TApi,
  TProps extends Record<string, any>,
  TEvents extends Record<string, any> = {},
  TSlots extends Record<string, any> = Record<string, any>,
  TParts extends Record<string, any> = Record<string, any>,
  TClasses extends Record<string, any> = Record<string, any>,
  TModifiers = DefaultContextModifiers<TApi, TSlots>,
  TA11y = DefaultContextA11y<TApi, TSlots>,
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
       * Part-keyed accessibility bindings registered by the component via
       * `useA11y` (usually through a canonical `#src/a11y` pattern).
       */
      a11yBindings: TA11y

      /**
       * Part-keyed styling modifiers (`data-*` state and variant attributes)
       * registered by the component via `useModifiers`.
       */
      modifiers: TModifiers

      /**
       * The per-part aggregate the template consumes: for each part key, one
       * bag (or resolver function when the part is functional) merging the
       * part's modifiers, a11y bindings, part attribute overrides, and
       * resolved classes (as `class`).
       */
      bindings: BindingsOf<TParts, TClasses, TModifiers, TA11y>

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
 * Resolved props objects created by `useProps`, keyed by component instance.
 */
const resolvedProps = new WeakMap<GenericInstance, Record<string, any>>()

/**
 * Module-level memo for kebab-cased prop names.
 */
const kebabCache = new Map<string, string>()

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
 * Wraps a function-valued part so it is both directly spreadable by `v-bind`
 * and callable as a function.
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
 * Wraps an object-valued part so it mirrors a function part's dual surface:
 * directly spreadable by `v-bind`, and callable like a functional part —
 * returning the same bag regardless of arguments. Call sites that resolve
 * per-item parts (`parts.item?.(item, index)`) therefore never need to care
 * which form the user chose.
 *
 * @param value The user-provided object part value.
 * @param $security The security surface whose prop filter guards results.
 */
function createObjectPart(
  value: Record<string, any>,
  { $security }: { $security: Pick<SecurityModule, 'sanitizeProps'> }
): any {
  // Arrow function target: avoids `prototype` (non-configurable on regular
  // functions), keeping the Proxy `ownKeys` invariant satisfied.
  const target = () => $security.sanitizeProps(value)

  // `parts` is a schema-reachable attribute bag: strip HTML sinks
  // (`innerHTML`/`outerHTML`), prototype keys, and entries matching
  // `$security.banProps` before the object hits a `v-bind` spread. Clean bags
  // (the common case) return the same reference, keeping identity and
  // reactivity.
  return new Proxy(target, {
    get(_, key) {
      if (key === 'call' || key === 'apply' || key === 'bind') {
        return Reflect.get(target, key)
      }
      return $security.sanitizeProps(value)[key as any]
    },
    ownKeys() {
      return Reflect.ownKeys($security.sanitizeProps(value))
    },
    getOwnPropertyDescriptor(_, key) {
      const r = $security.sanitizeProps(value)
      if (key in r) {
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
 * order: the resolved `part:<key>` prop, the raw `part:<key>` attr, then the
 * `parts` prop.
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

  // Cache part wrappers so the same proxy is reused across renders for a
  // stable reference. Lives at the top level of `useParts` so it persists for
  // the component's entire lifetime, not per reactive evaluation.
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
      if (
        source == null ||
        (typeof source !== 'function' && typeof source !== 'object')
      ) {
        return source
      }
      const entry = cache.get(key)
      if (entry && entry.source === source) return entry.proxy
      // Both forms resolve to the same dual surface — spreadable by `v-bind`
      // and callable — so call sites never depend on which one the user chose.
      const proxy =
        typeof source === 'function'
          ? createFunctionPart(source as (...args: any[]) => any, context, {
              $security,
            })
          : createObjectPart(source, { $security })
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
  const context$ = useComponentContext()
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
  const classDefs = shallowRef<ClassDefsArg<C, TApi, TPropRefs>[]>([])

  /**
   * Registers one or more class definition objects or factories.
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
   * templates / slots). Per key, the last override that sets the key replaces
   * the component-defined value.
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
 * Resolves one part-keyed bindings surface (`a11yBindings` / `modifiers`) by
 * merging component-registered definitions on top of an optional
 * blueprint-provided base.
 *
 * Far simpler than the classes pipeline on purpose: one defs array and one
 * merged computed — no overrides, config layers, or lazy per-key proxies.
 * User-side per-part overrides keep flowing through `parts`.
 *
 * @param base Getter for the blueprint's base bags (e.g. the merged
 *   `api.a11yBindings` computed), or `null` when the surface is
 *   component-only (modifiers).
 * @param api The component API passed to definition factories.
 * @param propRefs Lazy `toRef` proxy over resolved props.
 */
function defineBindings<
  TApi = Record<string, any>,
  TPropRefs = Record<string, any>,
>(api: TApi, propRefs: TPropRefs): DefineBindingsReturn<TApi, TPropRefs> {
  const defs = shallowRef<BindingDefsArg<TApi, TPropRefs>[]>([])

  const useBindings = (...newDefs: BindingDefsArg<TApi, TPropRefs>[]) => {
    if (newDefs.length === 0) return
    defs.value = [...defs.value, ...newDefs]
  }

  // One merged computed: factories are resolved inside so their reads stay
  // tracked. Per part key, object bags shallow-merge onto earlier layers
  // (last write wins per attribute); functional entries replace whole-entry.
  const bindings = computed(() => {
    const merged: Record<string, any> = {}

    for (const def of defs.value) {
      const resolved =
        typeof def === 'function' ? def(api, propRefs) : (def as any)
      if (!resolved) continue

      for (const key of typedKeys(resolved as Record<string, any>)) {
        if (typeof key !== 'string') continue
        const value = (resolved as any)[key]
        if (value === undefined) continue
        const prev = merged[key]

        merged[key] =
          typeof value === 'function' || typeof prev !== 'object' || !prev
            ? value
            : { ...prev, ...value }
      }
    }

    return merged
  })

  return { bindings, useBindings }
}

/**
 * Builds the per-part `bindings` aggregate the templates consume. Each key has
 * ONE mode, decided by the registered aspect DEFINITIONS (classes, modifiers,
 * a11y — never part overrides, whose dual-surface wrappers cannot signal it):
 *
 * - STATIC (no functional def): `bindings.input` IS the merged bag (or
 *   `undefined`), bound bare with `v-bind="bindings.input"`. Part overrides
 *   resolve by spread, which applies their context-function semantics.
 * - FUNCTIONAL (any functional def): `bindings.item` is a resolver called with
 *   the part's arguments — `v-bind="bindings.item(item)"` — resolving every
 *   surface with that one argument list (the symmetry doctrine). Part
 *   overrides are invoked with the same arguments.
 *
 * This is why every functional part key must carry at least one functional
 * aspect definition: the defs are the mode's source of truth. The merged bag
 * carries the part's modifiers, a11y bindings, and part attribute overrides
 * (canonical order), plus the part's resolved classes as `class` (part-level
 * `class` overrides merge in rather than replace).
 *
 * Reads happen at access/call time, so whichever effect reads the key
 * (usually the render effect) tracks them.
 *
 * @param parts The resolved part attribute overrides.
 * @param classes The lazy resolved-classes proxy.
 * @param a11yBindings The merged a11y bags computed.
 * @param modifiers The merged modifier bags computed.
 */
function defineAggregateBindings(
  parts: Record<string, any>,
  classes: Record<string, any>,
  a11yBindings: ComputedRef<Record<string, any>>,
  modifiers: ComputedRef<Record<string, any>>
) {
  const resolvers = new Map<string, (...args: any[]) => any>()

  const resolveEntry = (value: any, args: any[]) =>
    typeof value === 'function' ? value(...args) : value

  const buildBag = (key: string, args: any[], functional: boolean) => {
    const m = resolveEntry(modifiers.value[key], args)
    const a = resolveEntry(a11yBindings.value[key], args)

    // Part overrides follow the key's mode: functional keys invoke them with
    // the call-site arguments; static keys spread them, which routes through
    // the wrapper's spread surface (context functions resolve there).
    const raw = parts[key]
    const p =
      raw == null
        ? undefined
        : functional && typeof raw === 'function'
          ? raw(...args)
          : { ...raw }

    const cls = mergeClass(resolveEntry(classes[key], args), (p as any)?.class)

    if (!m && !a && !p && cls == null) return undefined

    const bag: Record<string, any> = { ...m, ...a, ...p }
    if (cls != null) bag.class = cls
    return bag
  }

  /**
   * The key's mode: functional when any registered definition for it is a
   * function. Reads stay inside the caller's effect, so mode changes
   * re-render.
   */
  const isFunctionalKey = (key: string) =>
    typeof modifiers.value[key] === 'function' ||
    typeof a11yBindings.value[key] === 'function' ||
    typeof classes[key] === 'function'

  const resolverFor = (key: string) => {
    let resolver = resolvers.get(key)
    if (!resolver) {
      resolver = (...args: any[]) => buildBag(key, args, true)
      resolvers.set(key, resolver)
    }
    return resolver
  }

  const resolveKey = (key: string) =>
    isFunctionalKey(key) ? resolverFor(key) : buildBag(key, [], false)

  const collectKnownKeys = (): string[] => {
    const keys = new Set<string>([
      ...Object.keys(modifiers.value),
      ...Object.keys(a11yBindings.value),
      ...Object.keys(parts),
      ...Object.keys(classes),
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

  // The two part-keyed aspect surfaces. Both are pure view concerns defined
  // entirely at the component layer: modifiers via `useModifiers`, a11y via
  // `useA11y` (usually invoking a canonical pattern from `#src/a11y`).
  const { bindings: a11yBindings, useBindings: useA11y } = defineBindings(
    api,
    propRefs
  )

  const { bindings: modifiers, useBindings: useModifiers } = defineBindings(
    api,
    propRefs
  )

  // The per-part aggregate the templates consume: for each part key, one bag
  // merging the part's modifiers, a11y bindings, part attribute overrides,
  // and (as `class`) its resolved classes.
  const bindings = defineAggregateBindings(
    resolvedParts,
    classes,
    a11yBindings,
    modifiers
  )

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
    a11yBindings,
    modifiers,
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
    parts: resolvedParts,
    classes,
    outlets,
    propRefs,
    context,
    expose,
    a11yBindings,
    modifiers,
    bindings,
    useClasses,
    useA11y,
    useModifiers,
  } as any
}
