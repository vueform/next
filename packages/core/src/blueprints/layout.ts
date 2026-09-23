import { computed, toRef, unref, markRaw, toRaw } from 'vue'
import {
  useGlobals,
  useConfig,
  useFallbackProp,
  useOutlets,
  useSecurity,
  useTokens,
} from '~/composables'
import { useElementContext } from '~/contexts'
import {
  type LoadingProps,
  type BaseElementParts,
  type BaseElementSlots,
  type BaseElementClasses,
} from '~/features'
import { defineDefaults, type DefineEvents } from '~/helpers'
import type {
  BaseComponentEmits,
  BaseComponentProps,
  BaseComponentExpose,
  ColumnKeys,
  ErrorLevelProp,
  LooseRequired,
  ShowRequiredProp,
} from '~/types'
import {
  withDefaultProps as withDefaultPropsBase,
  pickRefs,
  mergeClass,
} from '~/utils'

/**
 * Props for the element layout blueprint that provides layout, labels, and
 * error display.
 */
export interface LayoutProps<
  S = LayoutSlots,
  P = LayoutParts,
  C = LayoutClasses,
  TContext = any,
>
  extends BaseComponentProps<S, P, C, TContext>, LoadingProps<TContext> {
  /**
   * Whether to render the element's label tag.
   */
  label?: boolean

  /**
   * Whether to render addons when available.
   */
  addons?: boolean

  /**
   * Whether to render loading icon when available.
   */
  loading?: boolean

  /**
   * Whether to render langauges selector when available.
   */
  languages?: boolean

  /**
   * Whether to hide validation error messages for this element.
   */
  hideErrors?: boolean
}

/**
 * Events emitted by the element layout component.
 */
export interface LayoutEmits<
  TContext = any,
> extends BaseComponentEmits<TContext> {}

/**
 * Slots of the element layout component.
 */
export interface LayoutSlots<
  TContext = any,
> extends BaseElementSlots<TContext> {}

/**
 * Parts of the element layout component.
 */
export interface LayoutParts extends BaseElementParts {}

/**
 * CSS classes of the element layout component.
 */
export interface LayoutClasses extends BaseElementClasses {}

/**
 * Augmentable public API surface for element-layout-based components.
 */
export interface LayoutExpose extends BaseComponentExpose, LayoutApi {}

/**
 * Factory API produced by the element blueprint's `blueprint` function,
 * optionally parameterized by concrete props. Prefer this over
 * `ReturnType<typeof blueprint<TProps>>` at consumer sites.
 */
export type LayoutApi<TProps extends LayoutProps = LayoutProps> = ReturnType<
  typeof blueprint<TProps>
>

/**
 * Builds the element layout factory API from resolved props and events.
 * Resolves layout columns, label visibility, error display, and slot merging
 * for each form element.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 *
 * @param props Resolved component props.
 * @param _events Event emitter created by `defineEvents`.
 */
export function blueprint<TProps extends LayoutProps>(
  props: LooseRequired<TProps>,
  _events: DefineEvents<LayoutEmits>
) {
  /**
   * The parent element's component context.
   */
  const el$ = useElementContext()
  const showRequiredProp = useFallbackProp<ShowRequiredProp>('showRequired')
  const errorLevel = useFallbackProp<ErrorLevelProp>('errorLevel')
  const { defaultBreakpoint } = useGlobals()
  const config = useConfig()

  if (!el$) {
    throw new Error(
      '`blueprint()` can only be used inside an element component'
    )
  }
  const { resolvedColumns, help, description, errors, hoisted } = pickRefs(
    el$,
    ['resolvedColumns', 'help', 'description', 'errors', 'hoisted']
  )

  // ============== OUTLETS ===============

  const { outlets: baseOutlets } = useOutlets(props)
  const { allowsComponent } = useSecurity()

  /**
   * Outlets with `template` resolved from the element's `layout` prop when set,
   * otherwise from the standard template/config resolution. A string `layout`
   * is a registered component name and goes through `$security.allowComponents`
   * like any other name string; a rejected one falls back to the standard
   * resolution.
   */
  const outlets = computed(() => {
    const layout = el$.props.layout
    const template =
      layout && layout !== true
        ? typeof layout !== 'string'
          ? // `toRaw` first: a schema held in a ref or store hands the
            // component over as a reactive proxy.
            markRaw(toRaw(layout))
          : allowsComponent(layout)
            ? layout
            : baseOutlets.value.template
        : baseOutlets.value.template

    return {
      ...baseOutlets.value,
      template,
    }
  })

  // =============== THEME ================

  const { tokens, nonce, tokenClass, tokenCss } = useTokens(
    toRef(el$?.props, 'tokens')
  )

  // ================ REFS ================

  /**
   * Whether the element is a container-type element (e.g. group, list).
   *
   * @private
   */
  const isContainer = toRef(() => !!el$.isContainer)

  /**
   * Whether the element should render as a `<fieldset>` with a legend.
   */
  const isFieldset = toRef(() => isContainer.value && el$.label !== undefined)

  /**
   * Whether the element's container has an active pager for pagination.
   */
  const hasPager = toRef(() => unref(el$.container.pager)?.active)

  /**
   * Whether to render a `<label>` tag for the element.
   */
  const useLabelTag = toRef(() => props.label !== false && !isContainer.value)

  /**
   * The tag to use for the label when a heading level is set on a container
   * element (e.g. `'h1'`–`'h6'`), or `undefined` when no heading is active.
   */
  const headingTag = toRef(() =>
    isContainer.value && el$.props.heading
      ? (`h${el$.props.heading}` as const)
      : undefined
  )

  /**
   * Whether the element's label is visible.
   */
  const showLabel = toRef(
    () => el$.label !== undefined && !el$.props?.hideLabel
  )

  /**
   * Whether to render a screen-reader-only label for the element.
   */
  const showSrLabel = toRef(
    () => !showLabel.value && props.label !== false && useLabelTag.value
  )

  /**
   * Whether to render a placeholder label for horizontal layout alignment.
   */
  const showPhLabel = toRef(() => !showLabel.value && hasHorizontalLabel.value)

  /**
   * Whether to display the required indicator alongside the label.
   */
  const showRequired = toRef(
    () =>
      el$.required &&
      showRequiredProp.value &&
      showRequiredProp.value.includes('label')
  )

  /**
   * Whether the element's help text is visible.
   */
  const showHelp = toRef(() => !!help.value)

  /**
   * Whether the element's description text is visible.
   */
  const showDescription = toRef(() => !!description.value)

  /**
   * Whether to display validation error messages for this element.
   */
  const showErrors = toRef(
    () =>
      !el$.props.hideErrors &&
      (errorLevel.value === undefined ||
        errorLevel.value === 'element' ||
        errorLevel.value === 'all') &&
      !hoisted.value &&
      !!errors.value?.length &&
      !props.hideErrors
  )

  // ============== COMPUTED ==============

  const hasHorizontalLabel = computed(() => {
    for (const breakpoint in el$.resolvedColumns) {
      const label = el$.resolvedColumns[breakpoint].label
      if (label !== undefined && label > 0 && label < 12) {
        return true
      }
    }
    return false
  })

  /**
   * The resolved responsive CSS classes for each column section (container,
   * label, group, wrapper).
   */
  const columnClasses = computed(() => {
    let columnClasses: Record<
      ColumnKeys | 'group' | (string & {}),
      string | null
    > = {
      container: null,
      label: null,
      group: null,
      wrapper: null,
    }

    for (const breakpoint in resolvedColumns.value) {
      for (const key in resolvedColumns.value[breakpoint]) {
        const width = Number(
          resolvedColumns.value[breakpoint][key as ColumnKeys] || 0
        )
        const bp =
          breakpoint === defaultBreakpoint.value ? undefined : breakpoint

        columnClasses[key] = mergeClass(
          columnClasses[key],
          config.cols(width, bp)
        )

        if (key === 'label') {
          columnClasses[key] = mergeClass(
            columnClasses[key],
            config.label(width, bp)
          )
        }
      }
    }

    return columnClasses
  })

  // ============== METHODS ===============

  /**
   * Merges element-level default props into a target sub-component's props.
   *
   * @param target The sub-component name to resolve default props for.
   * @param base Optional base props to merge with.
   */
  const withDefaultProps = (target: string, base?: Record<string, any>) =>
    withDefaultPropsBase(el$, target, base)

  /**
   * Returns the CSS helper class for a given key, if class helpers are enabled.
   *
   * @param key The class helper key to look up.
   */
  const helperClasses = (key: string) =>
    !config.classHelpers ? null : config.classHelper(key)

  return {
    el$,

    /**
     * Blueprint-provided parts: VfLayout has no structural parts of its own, it
     * forwards the parent element's resolved parts so the layout renders with
     * that element's part overrides.
     */
    parts: el$.parts,
    outlets,
    tokens,
    tokenClass,
    tokenCss,
    nonce,
    isContainer,
    isFieldset,
    hasPager,
    showLabel,
    showSrLabel,
    showPhLabel,
    showRequired,
    columnClasses,
    useLabelTag,
    headingTag,
    showHelp,
    showDescription,
    showErrors,
    withDefaultProps,
    helperClasses,
  }
}

/**
 * Default prop values for the element layout blueprint.
 *
 * @skipTypeExport
 */
export const defaults = defineDefaults<LayoutProps>()({
  label: undefined,
  addons: undefined,
  loading: undefined,
  languages: undefined,
  expressions: undefined,
})
