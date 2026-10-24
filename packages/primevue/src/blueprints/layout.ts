import {
  mergeClass,
  useI18n,
  type BaseComponentExpose,
  type DefineEvents,
  type LooseRequired,
  type Parts,
} from '@vueform/core'
import {
  blueprint as useSetup,
  defaults,
  type LayoutProps,
  type LayoutEmits,
  type LayoutParts,
  type LayoutSlots,
  type LayoutBindings,
  type LayoutClasses,
} from '@vueform/core/blueprints/layout'
import { computed, toRef, unref } from 'vue'

export { defaults }
export type {
  LayoutProps,
  LayoutEmits,
  LayoutParts,
  LayoutSlots,
  LayoutBindings,
  LayoutClasses,
}

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
 * PrimeVue element layout blueprint. Extends the core element blueprint with
 * float/ifta-aware label tag logic — when a floating or IFTA label is active
 * the regular label renders as a `<span>` instead of a `<label>`.
 *
 * SFCs consume it via the shared composable: `useBlueprint(blueprint, props,
 * events, slots, extension?)`.
 *
 * @param props Resolved component props.
 * @param events Event emitter created by `defineEvents`.
 */
export function blueprint<TProps extends LayoutProps>(
  props: LooseRequired<TProps>,
  events: DefineEvents<LayoutEmits>
) {
  const base = useSetup(props, events)

  const { el$, useLabelTag: useLabelTagBase, tokenCss, tokenClass } = base

  const { tags } = useI18n()

  // ================ REFS ================

  /**
   * Whether to render a `<label>` tag for the element. Extends the base so it
   * also returns `false` when a floating or IFTA label is active and the input
   * wrapper's label is the only one with `for`.
   */
  const useLabelTag = toRef(
    () =>
      useLabelTagBase.value &&
      el$.floatLabel === undefined &&
      !el$.outlets?.['float-label'] &&
      el$.ifta === undefined &&
      !el$.outlets?.ifta
  )

  /**
   * The pager of the element's container, if any.
   *
   * Always a `Ref` (never `Ref | undefined`) so `ContextOf` / `slotContext`
   * unwrap agree — `UnwrapTopLevelRef` does not peel `Ref | undefined`.
   */
  const pager = toRef(() => unref(el$.container.pager))

  // ============== COMPUTED ==============

  /**
   * Argument object for the PrimeVue tooltip directive on the info icon.
   */
  const infoTooltipArg = computed(() => ({
    position: el$.infoPosition ?? 'top',
  }))

  /**
   * Whether the element is currently in a loading state that should show a
   * spinner (respects an explicit `loading: false` prop override).
   */
  const isLoading = computed(() => !!el$.loading && props.loading !== false)

  /**
   * Whether the content needs an IconField wrapper (an icon on either side or a
   * loading spinner).
   */
  const hasIcons = computed(
    () =>
      !!(
        el$.outlets['icon-before'] ||
        el$.iconBefore ||
        el$.outlets['icon-after'] ||
        el$.iconAfter ||
        isLoading.value
      )
  )

  const hasBeforeAddon = computed(
    () =>
      el$.addonable &&
      !!(el$.outlets['addon-before'] || el$.addonsBefore.length)
  )

  const hasAfterAddon = computed(
    () =>
      el$.addonable && !!(el$.outlets['addon-after'] || el$.addonsAfter.length)
  )

  /**
   * Whether a language addon should be rendered (translate mode or a custom
   * language slot).
   */
  const hasLanguageAddon = computed(
    () =>
      props.languages !== false &&
      ((!!el$.props.translate && el$.translatable) || !!el$.outlets.language)
  )

  /**
   * Whether an InputGroup wrapper is rendered around the content.
   */
  const renderGroup = computed(
    () =>
      props.addons !== false &&
      (hasBeforeAddon.value || hasAfterAddon.value || hasLanguageAddon.value)
  )

  /**
   * Whether a PrimeVue FloatLabel wrapper is active.
   */
  const hasFloat = computed(
    () => el$.floatLabel !== undefined || !!el$.outlets['float-label']
  )

  /**
   * Whether a PrimeVue IftaLabel wrapper is active.
   */
  const hasIfta = computed(() => el$.ifta !== undefined || !!el$.outlets.ifta)

  /**
   * Whether either a FloatLabel or IftaLabel wrapper is rendered.
   */
  const hasLabelWrapper = computed(() => hasFloat.value || hasIfta.value)

  /**
   * Props for the passthrough root `<div>` rendered when the element has
   * `layout: false`, or `undefined` when no root wrapper is needed.
   */
  const rootProps = computed(() => {
    if (el$.props.layout !== false) return undefined

    const resolvedTokenClass = tokenCss.value ? tokenClass : null
    // The element's part-override surface: whether a wrapper `<div>` renders
    // at all hinges on a raw `part:root` override existing, which the merged
    // `bindings.root()` bag cannot answer (definitions alone produce a bag).
    const parts = el$.parts as Parts | undefined
    const root = parts?.root()

    if (root) {
      return {
        ...root,
        class: mergeClass(
          mergeClass('vf-passthrough', resolvedTokenClass),
          root.class
        ),
      }
    }

    if (resolvedTokenClass) {
      return { class: ['vf-passthrough', resolvedTokenClass] }
    }

    return undefined
  })

  /**
   * Options for the language Select rendered in the translate addon.
   */
  const languageOptions = computed(() =>
    Object.entries(el$.languages ?? {}).map(([code, label]) => ({
      code,
      label,
    }))
  )

  // ============== METHODS ===============

  /**
   * Updates the element's active language.
   *
   * @param val The language code to select.
   */
  const setLanguage = (val: string) => {
    el$.language = val
  }

  return {
    ...base,
    useLabelTag,
    tags,
    pager,
    infoTooltipArg,
    isLoading,
    hasIcons,
    hasLanguageAddon,
    renderGroup,
    hasFloat,
    hasIfta,
    hasLabelWrapper,
    rootProps,
    languageOptions,
    setLanguage,
  }
}
