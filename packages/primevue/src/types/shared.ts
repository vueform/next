import type { ConditionalProp } from '@vueform/core'
import type { TreeNode as PvTreeNode } from 'primevue/treenode'

/**
 * Floating label behavior mode for PrimeVue input components.
 */
export type FloatProp = 'in' | 'on'

/**
 * Position of a tooltip relative to its target element.
 */
export type TooltipPosProp = 'top' | 'bottom' | 'left' | 'right'

/**
 * Position of an info popup relative to its target element.
 */
export type InfoPositionProp = TooltipPosProp

export type TreeNode = PvTreeNode & { conditions?: ConditionalProp }

/**
 * Allowed types for the tree-select `options` prop: a static array of tree
 * nodes, an endpoint URL string, or a function returning tree nodes (sync or
 * async). Arrays may be mutable or `readonly` / `as const` tuples so literal
 * key unions can drive selection-keys model inference.
 *
 * The array arm is `readonly any[]` (not `TreeNode[]`) so `as const` trees —
 * whose nested `children` are readonly — remain assignable.
 */
export type TreeOptionsProp = readonly any[] | string | ((context$: any) => any)
