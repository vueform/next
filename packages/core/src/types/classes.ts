import type { ComponentRegistry, ComponentNames } from './component'
import type { MaybeContextual } from './utils'

/**
 * A single CSS class value or an array of class values, including conditional
 * object syntax. Matches Vue's built-in `:class` binding type.
 */
export type ClassValue =
  | false
  | null
  | undefined
  | string
  | Record<string, any>
  | ClassValue[]

/**
 * Loosens a single class definition value so that functional class keys also
 * accept a plain `ClassValue`. Functional class keys additionally accept a
 * function whose last parameter is the component context.
 */
export type ClassInput<V, TContext = any> = V extends (
  ...args: infer A
) => ClassValue
  ?
      | ClassValue
      | ((...args: A) => ClassValue)
      | ((...args: [...A, context$: TContext]) => ClassValue)
  : ClassValue | ((context$: TContext) => ClassValue)

/**
 * Maps every key of a classes definition so that functional class keys also
 * accept a plain `ClassValue`.
 */
export type LooseClasses<T, TContext = any> = {
  [K in keyof T]?: ClassInput<T[K], TContext>
}

/**
 * Prop type for overriding a child component's classes from a parent,
 * supporting contextual functions. Functional class keys additionally accept a
 * function whose last parameter is the component context.
 */
export type ChildClassesProp<T extends ComponentNames> =
  ComponentRegistry[T]['classes'] extends infer Classes
    ? MaybeContextual<
        {
          [K in keyof Classes]?: Classes[K] extends infer C
            ? C extends (...args: infer A extends any[]) => any
              ?
                  | ClassValue
                  | ((...args: A) => ClassValue)
                  | ((...args: [...A, context$: any]) => ClassValue)
              : ClassValue | ((context$: any) => ClassValue)
            : never
        } & Record<string, ClassValue | ((...args: any[]) => ClassValue)>
      >
    : never

/**
 * Extracts the classes definition type for a given component.
 */
export type ClassesOf<T extends ComponentNames> =
  ComponentRegistry[T]['classes']
