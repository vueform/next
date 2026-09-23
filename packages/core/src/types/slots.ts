import type { ComponentRegistry } from '~/types'
import type { Component } from 'vue'

/**
 * Maps component names to their accepted slot prop type.
 */
type ComponentsWithSlotsProp = {
  [
    K in keyof ComponentRegistry as keyof ComponentRegistry[K]['props'] extends never
      ? never
      : Extract<keyof ComponentRegistry[K]['props'], 'slots'> extends never
        ? never
        : K
  ]: ComponentRegistry[K]
}

/**
 * Global slot override definitions, mapping component names to their available
 * slot names with replacement components.
 */
export type SlotsDefinition = {
  [K in keyof ComponentsWithSlotsProp]?: ComponentsWithSlotsProp[K] extends {
    slots: infer T extends Record<string, any>
  }
    ? {
        [TK in keyof T]?: Component
      }
    : never
}

/**
 * Extracts the resolved slot prop types for every registered component, mapping
 * slot names to their prop shapes.
 */
export type SlotProps = {
  [K in keyof ComponentRegistry]: ComponentRegistry[K] extends {
    slots: infer T extends Record<string, any>
  }
    ? {
        [TK in keyof T]: T[TK] extends () => any
          ? {}
          : T[TK] extends (props: infer P) => any
            ? P
            : never
      }
    : never
}

/**
 * Slot props of a possibly-unregistered component's slot. Same rationale as
 * `PartOf`: core types reference core-only components (`VfTabs`, `VfSteps`,
 * `VfLanguages`) whose registry augmentations are absent from adapter type
 * programs — degrade to a loose record instead of erroring.
 */
export type SlotPropsOf<
  C extends keyof SlotProps | (string & {}),
  S extends
    | (C extends keyof SlotProps ? Extract<keyof SlotProps[C], string> : never)
    | (string & {}),
> = C extends keyof SlotProps
  ? S extends keyof SlotProps[C]
    ? SlotProps[C][S]
    : Record<string, any>
  : Record<string, any>
