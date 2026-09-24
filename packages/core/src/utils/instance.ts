import * as vue from 'vue'
import {
  getCurrentInstance,
  renderSlot,
  type ComponentInternalInstance,
  type Slot,
} from 'vue'
import type { ComponentOptions } from '@core/types'
import { camelToKebab } from './string'

/**
 * A dynamic props source in a Vapor instance's `rawProps.$` array: either a
 * resolver function returning a props object (e.g. a compiled `v-bind` spread)
 * or a plain props object.
 */
type DynamicPropsSource =
  (() => Record<string, unknown>) | Record<string, unknown>

/**
 * Structural type for Vue 3.6+ Vapor component instances. Vue does not publicly
 * export `VaporComponentInstance`, so this mirrors the fields Vueform relies
 * on. Vapor instances have no `vnode` and no `proxy`.
 */
export interface VaporInstanceLike {
  /**
   * Discriminant flag set by the Vapor runtime on every vapor instance.
   */
  vapor: true

  /**
   * The instance's unique id.
   */
  uid: number

  /**
   * The component definition, including fields merged from `defineOptions`
   * (e.g. `name`, `element`).
   */
  type: Record<string, any>

  /**
   * The raw props passed to the component: static keys live directly on the
   * object (values may be compiler-generated getters), dynamic spread sources
   * live under `$`.
   */
  rawProps: Record<string, unknown> & { $?: DynamicPropsSource[] }

  /**
   * The resolved, reactive props object.
   */
  props: Record<string, any>

  /**
   * The resolved, reactive fallthrough attrs object.
   */
  attrs: Record<string, any>

  /**
   * The object registered via `expose()`, if any.
   */
  exposed: Record<string, any> | null

  /**
   * The rendered block: a DOM node, a fragment (`{ nodes }`), a child vapor
   * component instance, or an array of these.
   */
  block?: unknown

  /**
   * The app context shared with the VDOM world.
   */
  appContext: ComponentInternalInstance['appContext']

  /**
   * Emits a component event.
   */
  emit: (event: string, ...args: any[]) => void
}

/**
 * A component instance in either rendering mode: a VDOM
 * `ComponentInternalInstance` or a Vapor instance.
 */
export type GenericInstance = ComponentInternalInstance | VaporInstanceLike

// Vue 3.6 runtime-exports the shared `currentInstance` binding (which holds
// vapor instances during vapor setup, where `getCurrentInstance()` returns
// null), but Vue 3.5 does not. Accessing it via a namespace record keeps
// builds and runtime on 3.5 working (resolves to `undefined`) without a
// static named import that bundlers would flag as missing.
const vueRuntime = vue as Record<string, any>

/**
 * Returns whether the given instance is a Vapor component instance.
 *
 * @param vm The instance to check.
 */
export function isVaporInstance(
  vm: GenericInstance | null | undefined
): vm is VaporInstanceLike {
  return !!(vm as VaporInstanceLike | null | undefined)?.vapor
}

/**
 * Returns the current component instance in either rendering mode: inside a
 * Vapor component's setup on Vue 3.6+ the Vapor instance, otherwise the VDOM
 * instance from `getCurrentInstance()`. Returns `null` outside setup context.
 *
 * The vapor `currentInstance` binding is checked first because on 3.6
 * `getCurrentInstance()` skips vapor instances and falls back to
 * `currentRenderingInstance`, which inside a vapor-rendered tree points at the
 * subtree root rather than the current component.
 */
export function getGenericInstance(): GenericInstance | null {
  const vapor = vueRuntime['currentInstance']
  if (isVaporInstance(vapor)) return vapor

  return getCurrentInstance()
}

/**
 * Returns the component definition (name, element flag, props, emits) for an
 * instance in either rendering mode. On VDOM instances this is the merged
 * `$options` view when a proxy exists (preserving mixin/extends semantics);
 * otherwise the raw component `type`.
 *
 * @param vm The component instance.
 */
export function getComponentDef(vm: GenericInstance): ComponentOptions {
  if (!isVaporInstance(vm) && vm.proxy) {
    return vm.proxy.$options as ComponentOptions
  }
  return vm.type as ComponentOptions
}

const vdomSlotCache = new WeakMap<Slot, Slot>()

/**
 * Returns the first DOM node of a Vapor block, descending into arrays,
 * fragments (`{ nodes }`), and nested component instances (`{ block }`).
 * Mirrors the Vapor runtime's (unexported) `normalizeBlock` walk.
 *
 * @param block The block to resolve.
 */
function firstBlockNode(block: unknown): Node | null {
  if (!block) return null

  if (block instanceof Node) return block

  if (Array.isArray(block)) {
    for (const child of block) {
      const node = firstBlockNode(child)
      if (node) return node
    }
    return null
  }

  const record = block as { block?: unknown; nodes?: unknown }
  if (record.block !== undefined) return firstBlockNode(record.block)
  if (record.nodes !== undefined) return firstBlockNode(record.nodes)

  return null
}

/**
 * Resolves a raw prop value or dynamic source: compiler-generated getters are
 * invoked, plain values pass through. Mirrors the Vapor runtime's
 * `resolveSource`.
 *
 * @param source The raw value or source to resolve.
 */
function resolveSource(source: unknown) {
  return typeof source === 'function' ? source() : source
}

/**
 * The marker Vue 3.6's `renderSlot` reads to route a slot function through the
 * `VaporSlot` interop block: a raw vapor slot carries itself under this key.
 * Exported by the vapor runtime builds only (`undefined` on 3.5), and a Symbol
 * since 3.6.0-rc.3 — earlier RCs used the `__vapor` boolean instead, which is
 * kept for compatibility.
 */
const rawVaporSlotKey: symbol | undefined = (vue as any).rawVaporSlotKey

/**
 * Wraps a raw Vapor slot function (which returns DOM blocks) into a
 * VDOM-renderable slot function returning VNodes, so it can be rendered with
 * `h()`, `<component :is>`, or called directly by VDOM code. Mirrors the
 * wrapping the vapor interop's slots proxy applies when a VDOM component
 * receives slots from a vapor parent: Vue 3.6's `renderSlot` renders slot
 * functions marked as vapor slots through a `VaporSlot` interop block.
 *
 * Only call this for slots of a Vapor instance — VDOM slot functions must be
 * passed through untouched.
 *
 * @param name The slot name.
 * @param slot The raw Vapor slot function.
 */
export function toVdomRenderableSlot(name: string, slot: Slot): Slot {
  const cached = vdomSlotCache.get(slot)
  if (cached) return cached
  ;(slot as any).__vapor = true
  if (rawVaporSlotKey) (slot as any)[rawVaporSlotKey] = slot

  const wrapped = ((props?: Record<string, unknown>) => [
    renderSlot({ [name]: slot }, name, props || {}),
  ]) as Slot
  ;(wrapped as any).__vs = slot
  if (rawVaporSlotKey) (wrapped as any)[rawVaporSlotKey] = slot

  vdomSlotCache.set(slot, wrapped)
  return wrapped
}

/**
 * Returns the root DOM node of a component instance in either rendering mode:
 * the VDOM `$el` (which may be a text/comment node for fragment roots) or the
 * first node of a Vapor instance's block. Returns `null` before mount.
 *
 * @param vm The component instance.
 */
export function getInstanceRootNode(vm: GenericInstance): Node | null {
  if (isVaporInstance(vm)) {
    return firstBlockNode(vm.block)
  }

  return (vm.proxy?.$el as Node | undefined) ?? null
}

/**
 * Returns the raw prop keys passed to a component instance (explicitly passed
 * props, listeners, and fallthrough attrs) in either rendering mode. For Vapor
 * instances this includes keys from resolved dynamic spread sources.
 *
 * @param vm The component instance.
 */
export function getInstanceRawPropKeys(vm: GenericInstance): string[] {
  if (!isVaporInstance(vm)) {
    return Object.keys(vm.vnode?.props || {})
  }

  const raw = vm.rawProps || {}
  const keys: string[] = []

  for (const key in raw) {
    if (key !== '$') keys.push(key)
  }

  if (raw.$) {
    for (const source of raw.$) {
      const resolved = resolveSource(source) as
        Record<string, unknown> | undefined
      if (!resolved) continue
      for (const key in resolved) {
        if (!keys.includes(key)) keys.push(key)
      }
    }
  }

  return keys
}

/**
 * Returns whether an exact raw prop key was explicitly passed to a component
 * instance, in either rendering mode. No camelCase/kebab-case conversion is
 * performed — callers check both variants when needed. Mirrors the Vapor
 * runtime's `hasAttrFromRawProps` for Vapor instances.
 *
 * @param vm The component instance.
 * @param key The exact raw prop key to check.
 */
export function hasInstanceRawProp(vm: GenericInstance, key: string): boolean {
  if (!isVaporInstance(vm)) {
    const raw = vm.vnode?.props
    return !!raw && key in raw
  }

  const raw = vm.rawProps
  if (!raw || key === '$') return false

  const dynamicSources = raw.$
  if (dynamicSources) {
    let i = dynamicSources.length
    while (i--) {
      const source = resolveSource(dynamicSources[i]) as
        Record<string, unknown> | undefined
      if (source && Object.prototype.hasOwnProperty.call(source, key)) {
        return true
      }
    }
  }

  return Object.prototype.hasOwnProperty.call(raw, key)
}

/**
 * Returns whether a raw prop was explicitly passed to a component instance by
 * camelCase or kebab-case name, in either rendering mode. Mirrors the variant
 * handling of `hasRawProp` for raw props objects.
 *
 * @param vm The component instance.
 * @param key The prop name to check (any casing).
 */
export function hasInstanceRawPropLoose(
  vm: GenericInstance,
  key: string
): boolean {
  if (hasInstanceRawProp(vm, key)) return true

  const kebab = camelToKebab(key)
  if (kebab !== key && hasInstanceRawProp(vm, kebab)) return true

  const camel = kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  return camel !== key && camel !== kebab && hasInstanceRawProp(vm, camel)
}

/**
 * Returns the raw value of an exact prop key passed to a component instance, in
 * either rendering mode. Dynamic spread sources take precedence over static
 * keys (last source wins), mirroring the Vapor runtime's `getAttrFromRawProps`
 * (without its `class`/`style` merging, which Vueform never reads through this
 * path).
 *
 * @param vm The component instance.
 * @param key The exact raw prop key to read.
 */
export function getInstanceRawProp(vm: GenericInstance, key: string): unknown {
  if (!isVaporInstance(vm)) {
    return vm.vnode?.props?.[key]
  }

  const raw = vm.rawProps
  if (!raw || key === '$') return undefined

  const dynamicSources = raw.$
  if (dynamicSources) {
    let i = dynamicSources.length
    while (i--) {
      const source = dynamicSources[i]
      const isDynamic = typeof source === 'function'
      const resolved = (isDynamic ? resolveSource(source) : source) as
        Record<string, unknown> | undefined
      if (resolved && Object.prototype.hasOwnProperty.call(resolved, key)) {
        return isDynamic ? resolved[key] : resolveSource(resolved[key])
      }
    }
  }

  if (Object.prototype.hasOwnProperty.call(raw, key)) {
    return resolveSource(raw[key])
  }

  return undefined
}
