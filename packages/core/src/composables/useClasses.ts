import { toRaw, type Ref } from 'vue'

import { CLASS_REGISTRAR, useComponentContext } from '#src/contexts'
import type {
  ClassesOf,
  ClassInput,
  ClassValue,
  ComponentNames,
  ComponentRegistry,
  ContextOf,
  LooseClasses,
  PropsOf,
} from '#src/types'

/**
 * Keys a single class definition introduces: for factories, the keys of the
 * returned object; for definition objects, their own keys.
 */
type TemplateClassKeys<D> = D extends (...args: any[]) => infer R
  ? keyof R
  : keyof D

/**
 * Class definitions accepted by `useClasses` from outside a component's own
 * setup: the host's declared keys stay typed, and any extra key is allowed so a
 * template can introduce class keys of its own.
 */
export type TemplateClasses<T extends ComponentNames> = LooseClasses<
  ComponentRegistry[T]['classes']
> &
  Record<string, ClassInput<ClassValue>>

/**
 * Lazy `toRef` proxy over the host's resolved props, passed to class factories
 * as their second argument.
 */
export type TemplatePropRefs<T extends ComponentNames> = {
  [K in keyof PropsOf<T>]-?: Ref<PropsOf<T>[K]>
}

/**
 * A class definition object, or a factory receiving the host's public context
 * and prop refs. Factories are invoked lazily on first class-key access and
 * re-run reactively.
 */
export type TemplateClassDefs<T extends ComponentNames> =
  | TemplateClasses<T>
  | ((
      context$: ContextOf<T>,
      propRefs: TemplatePropRefs<T>
    ) => TemplateClasses<T>)

/**
 * The classes object `useClasses` returns: the host component's declared keys
 * plus every key the passed definitions introduce. At runtime it is the host's
 * own `context.classes` proxy — the type just widens it with the template's
 * keys, so they read as `ClassValue` without a module augmentation.
 */
export type TemplateClassesOf<
  T extends ComponentNames,
  D extends TemplateClassDefs<T>[],
> = ClassesOf<T> & {
  [
    K in Exclude<TemplateClassKeys<D[number]>, keyof ClassesOf<T>> & string
  ]: ClassValue
}

/**
 * Registers class definitions on the nearest Vueform component from a custom
 * template or slot. A key you set **replaces** the component's own value for
 * that key (the last definition wins per key); keys you leave out keep the
 * component's value. The result still resolves through the regular chain, so
 * user `classes` / `reclass` props, defaults, and presets apply on top. Keys
 * the component doesn't define (e.g. an `icon` node only the template renders)
 * are accepted and resolve the same way.
 *
 * Returns the host's `context.classes` proxy, typed with the built-in keys plus
 * the keys the definitions introduce — so the template can bind its own keys
 * type-safely without augmenting the component's `Classes` interface.
 *
 * @param name The host component name, used for type inference.
 * @param defs Class definition objects or factories over the host context.
 */
export function useClasses<
  T extends ComponentNames,
  D extends TemplateClassDefs<T>[],
>(_name: T, ...defs: D): TemplateClassesOf<T, D> {
  const context$ = useComponentContext()
  const register = toRaw(context$)?.[CLASS_REGISTRAR]

  if (typeof register !== 'function') {
    throw new Error(
      '`useClasses()` must be called in the setup of a template or slot rendered by a Vueform component'
    )
  }

  register(...defs)

  return context$.classes
}
