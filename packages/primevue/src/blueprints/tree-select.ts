import {
  defineDefaults,
  useFeatures,
  makeElement,
  makeLayout,
  makeAddons,
  makeIcons,
  makeInteraction,
  makeDisabled,
  makePlaceholder,
  makeData,
  makeInput,
  makeProvider,
  makeForwards,
  type BaseElementClasses,
  type BaseElementEmits,
  type BaseElementExpose,
  type BaseElementA11y,
  type BaseElementModifiers,
  type BaseFieldElementParts,
  type BaseElementProps,
  type BaseElementSlots,
  type DefineEvents,
  type LooseRequired,
  type AddonsProps,
  type IconsProps,
  type ExpressionProps,
  type ValidationProps,
  type AddonableProps,
  type DisabledProps,
  type PlaceholderProps,
  type LoadingProps,
  type LayoutProps,
  type ModelEmits,
  type InteractionEmits,
  type InputEmits,
  type ValidationEmits,
  type ModelApi,
  aliasProps,
  makeLoading,
} from '@vueform/core'
import type {
  TreeSelectProps as ATreeSelectProps,
  TreeSelectEmitsOptions as ATreeSelectEmits,
} from 'primevue/treeselect'
import { computed } from 'vue'

import {
  makeFloatLabel,
  makeIfta,
  makeInfo,
  type ModelPropsWithDefaultValue,
  type FloatLabelProps,
  type IftaLabelProps,
  type InfoProps,
} from '#src/features'
import {
  makeTreeOptions,
  type TreeOptionsProps,
  type TreeSelectionModeProp,
  type TreeSelectModel,
  type TreeSelectModelProp,
} from '#src/features/tree-options'
import type { ForwardedEmits, TreeOptionsProp } from '#src/types'

export type { TreeSelectModel, TreeSelectModelProp }

/**
 * Plain props type for the tree-select element blueprint — the widest
 * instantiation of `TreeSelectProps`. Use this whenever "the props of a
 * tree-select" is meant without generic narrowing; it also serves as the
 * constraint for `blueprint` / `TreeSelectApi` type parameters.
 */
type LooseTreeSelectProps = TreeSelectProps<
  string,
  TreeOptionsProp,
  TreeSelectionModeProp
>

/**
 * Generic props interface for the tree-select element blueprint, parameterized
 * by the tree-option / selection-mode type arguments. Reach for
 * `LooseTreeSelectProps` instead when no narrowing is needed.
 */
export interface TreeSelectProps<
  T extends string = 'tree-select',
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends TreeSelectionModeProp = undefined,
  TModel = any,
  S = TreeSelectSlots,
  P = TreeSelectParts,
  C = TreeSelectClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      TreeSelectModelProp<TOptions, TSelectionMode, TModel>,
      TContext
    >,
    ValidationProps<TContext>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    TreeOptionsProps<TOptions>,
    /* @vue-ignore */ Omit<
      ATreeSelectProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'placeholder'
      | 'loading'
      | 'options'
      | 'selectionMode'
    > {
  /**
   * Defines the selection mode. Controls the model value shape:
   *
   * - unset / `'single'` / `'multiple'` → `{ [key]?: true }`
   * - `'checkbox'` → `{ [key]?: { checked; partialChecked } }`
   */
  selectionMode?: TSelectionMode | 'single' | 'multiple' | 'checkbox'
}

/**
 * Events emitted by the tree-select element.
 */
export interface TreeSelectEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<any, TContext>,
    InteractionEmits<TContext>,
    ValidationEmits<TContext>,
    InputEmits<string[], TContext>,
    /* @vue-ignore */ ForwardedEmits<
      ATreeSelectEmits,
      (typeof forwards.events)[number],
      TContext
    > {}

/**
 * Slots available in the tree-select element blueprint.
 */
export interface TreeSelectSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Structural parts of the tree-select element blueprint.
 */
export interface TreeSelectParts extends BaseFieldElementParts {}

/**
 * CSS classes for the tree-select element blueprint.
 */
export interface TreeSelectClasses extends BaseElementClasses {}

/**
 * Styling modifiers of the tree-select element blueprint.
 */
export interface TreeSelectModifiers extends BaseElementModifiers {}

/**
 * Accessibility bindings of the tree-select element blueprint.
 */
export interface TreeSelectA11y extends BaseElementA11y {}

/**
 * Augmentable public API surface for tree-select-based components.
 */
export interface TreeSelectExpose extends BaseElementExpose, TreeSelectApi {}

/**
 * Factory API produced by the tree-select blueprint's `blueprint` function,
 * optionally parameterized by concrete props (e.g.
 * `TreeSelectApi<VfTreeSelectProps<typeof options, 'checkbox'>>`). Prefer this
 * over `ReturnType<typeof blueprint<TProps>>` at consumer sites (Expose /
 * Context layers, extensions).
 *
 * `makeTreeOptions` returns a fixed `TreeNode[]` `items` list (not
 * parameterized by `TOptions`), so `ModelApi` is used rather than
 * `ItemsModelApi`.
 */
export type TreeSelectApi<
  TProps extends LooseTreeSelectProps = LooseTreeSelectProps,
> = ModelApi<ReturnType<typeof blueprint>, TProps>

/**
 * PrimeVue TreeSelect events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
export const forwards = {
  events: [
    'value-change',
    'update:expandedKeys',
    'before-show',
    'before-hide',
    'show',
    'hide',
    'node-select',
    'node-unselect',
    'node-expand',
    'node-collapse',
    'filter',
  ],
  slots: [
    'value',
    'option',
    'header',
    'footer',
    'empty',
    'dropdownicon',
    'itemtoggleicon',
    'itemcheckboxicon',
    'clearicon',
  ],
} as const

/**
 * Builds the tree-select factory API from resolved props and events.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`. Passing `blueprint` as a value lets call-site
 * inference instantiate the API at the SFC's concrete props — the only
 * alternative to a per-blueprint wrapper hosting `typeof blueprint<TProps>`,
 * since conditional-type inference on a captured factory erases its type
 * parameters to constraints (verified empirically).
 */
export function blueprint<TProps extends LooseTreeSelectProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<TreeSelectEmits>
) {
  const api = useFeatures(
    aliasProps(props, {
      default: 'defaultValue',
    }),
    events,
    {
      nullValue: computed(() => ({})),
    }
  )
    .use(makeElement())
    .use(makeLayout())
    .use(makeAddons())
    .use(makeIcons())
    .use(makeInteraction())
    .use(makeDisabled())
    .use(makePlaceholder())
    .use(makeData())
    .use(makeInput())
    .use(makeLoading())
    .use(makeTreeOptions())
    .use(makeFloatLabel())
    .use(makeIfta())
    .use(makeInfo())
    .use(makeForwards(forwards))
    .use(makeProvider())
    .build()

  /**
   * Shows the tree-select overlay.
   */
  const show = () => {
    api.input.value?.show()
  }

  /**
   * Hides the tree-select overlay.
   */
  const hide = () => {
    api.input.value?.hide()
  }

  return { ...api, show, hide }
}

/**
 * Default prop values for the tree-select blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<TreeSelectProps>()({
  type: 'tree-select',
  layout: true,
  submit: true,
  bail: true,
  maxErrors: 1,
  conditions: undefined,
  expressions: undefined,
  showRequired: undefined,
  untrackOn: undefined,
})
