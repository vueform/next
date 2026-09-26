import { computed, nextTick, ref, toRef, unref, useSlots, watch } from 'vue'
import type { makeElement } from '#core/features'
import type {
  BreakpointsColumns,
  ColumnKeys,
  ColumnsObject,
  ColumnsPlain,
  ColumnsProp,
  ColumnsValue,
  ElementName,
  PageProp,
  ResolvedColumns,
  ReturnsOf,
  TProp,
} from '#core/types'
import {
  useCurrentElement,
  useDynamicProp,
  useGlobals,
  useExpression,
} from '#core/composables'
import { useComponentContext } from '#core/contexts'
import { defineFeature } from '#core/helpers'
import { clone, isTopInViewport, rootDomOf } from '#core/utils'

/**
 * Configuration for the element factory providing core lifecycle, state, and
 * composition for a form element.
 */
type MakeViewOptions = {
  props: {
    name: ElementName
    columns: ColumnsProp | undefined
    page: PageProp | undefined
    label: TProp | undefined
    help: TProp | undefined
    description: TProp | undefined
    id: TProp | undefined
    hideLabel: boolean | undefined

    /**
     * Custom Vue components to use for named slots.
     */
    slots: Record<string, any> | undefined

    /**
     * The floating label of the element.
     */
    floating?: TProp

    /**
     * The float label of the element.
     */
    floatLabel?: TProp

    /**
     * The in-field top aligned label of the element.
     */
    ifta?: TProp

    /**
     * @write
     */
    placeholder?: TProp
    displayName?: TProp
  }
  deps: ReturnsOf<[[typeof makeElement, ['id', 'container', 'form$', 'path']]]>
}

function hasBreakpoints(
  v: ColumnsValue | BreakpointsColumns | undefined | void
): v is BreakpointsColumns {
  return (
    !!v &&
    typeof v === 'object' &&
    !('container' in v) &&
    !('label' in v) &&
    !('wrapper' in v)
  )
}

function normalizeColumns(cols: ColumnsPlain | ColumnsObject | undefined) {
  const obj: Partial<Record<string, string | number>> =
    !cols || typeof cols !== 'object' ? { container: cols || 12 } : cols

  const result: Partial<Record<ColumnKeys | 'group' | 'full', number>> = {}

  if (obj.container) {
    result.container = Number(obj.container)
  }

  if (obj.label) {
    const label = Number(obj.label)
    result.label = label
    result.group = label <= 0 || label >= 12 ? 12 : 12 - label
  }

  if (obj.wrapper) {
    result.wrapper = Number(obj.wrapper)
  }

  result.full = 12

  return result
}

/**
 * Core factory for all form elements, composing identity, path, conditions,
 * template, layout, columns, and focus.
 *
 * @param options Factory options containing element props.
 */
export const makeLayout = defineFeature(
  () =>
    ({ props, deps }: MakeViewOptions) => {
      const context$ = useComponentContext()
      const { defaultBreakpoint } = useGlobals()
      const expression = useExpression()
      const wrapper = useCurrentElement()
      const vueSlots = useSlots()

      const { id, container, form$, path } = deps

      const columns = ref(clone(props.columns))

      /**
       * Page metadata for stepped/tabbed forms.
       */
      const page = computed(() => props.page)

      /**
       * The resolved label text for the element.
       */
      const label = useDynamicProp(
        'label',
        toRef(() =>
          props.label
            ? props.label
            : !!vueSlots.label || !!props.slots?.label
              ? ''
              : undefined
        ),
        {
          localize: true,
          // Preserve '' for slot-only labels (useDynamicProp maps '' → undefined otherwise)
          transform: (value) => {
            if (value === undefined) {
              return !!vueSlots.label || !!props.slots?.label ? '' : undefined
            }
            return String(value)
          },
        }
      )

      /**
       * The resolved help text for the element.
       */
      const help = useDynamicProp(
        'help',
        toRef(() =>
          props.help
            ? props.help
            : !!vueSlots.help || !!props.slots?.help
              ? '.'
              : undefined
        ),
        {
          localize: true,
          // Keep expression-empty results as '' (useDynamicProp maps '' → undefined)
          string: true,
        }
      )

      /**
       * The resolved description text for the element.
       */
      const description = useDynamicProp(
        'description',
        toRef(() =>
          props.description
            ? props.description
            : !!vueSlots.description || !!props.slots?.description
              ? '.'
              : undefined
        ),
        {
          localize: true,
        }
      )

      /**
       * The DOM id for the element's help text region.
       */
      const helpId = computed(() => `${id.value}__help`)

      /**
       * The DOM id for the element's description text region.
       */
      const descriptionId = computed(() => `${id.value}__description`)

      /**
       * The DOM id for the element's error message region.
       */
      const errorId = computed(() => `${id.value}__error`)

      /**
       * The DOM id for the element's label region.
       */
      const labelId = computed(() => `${id.value}__label`)

      /**
       * Resolved column sizes per breakpoint, normalized into
       * container/label/wrapper/group values.
       */
      const resolvedColumns = computed(() => {
        const raw = unref(columns)
        const cols =
          typeof raw === 'function' ? raw(context$) || undefined : raw

        const resolved: Record<string, Partial<ResolvedColumns>> = {
          [defaultBreakpoint.value]: {
            container: 12,
            label: 12,
            wrapper: 12,
            group: 12,
            full: 12,
          },
        }

        if (hasBreakpoints(cols)) {
          for (const breakpoint in cols) {
            const normalized = normalizeColumns(resolveExpr(cols[breakpoint]))

            if (breakpoint === 'base') {
              Object.assign(resolved[defaultBreakpoint.value], normalized)
            } else {
              resolved[breakpoint] = normalized
            }
          }
        } else {
          Object.assign(
            resolved[defaultBreakpoint.value],
            normalizeColumns(resolveExpr(cols))
          )
        }

        return resolved
      })

      const displayName = useDynamicProp('displayName', props, {
        localize: true,
      })

      /**
       * A human-readable name resolved from displayName, label, floating,
       * placeholder, or the element's name prop.
       */
      const genericName = computed(() =>
        String(
          displayName.value ??
            label.value ??
            props.floating ??
            props.floatLabel ??
            props.ifta ??
            props.placeholder ??
            props.name
        )
      )

      /**
       * Updates the column configuration programmatically.
       *
       * @param v The new column configuration value.
       */
      const updateColumns = (v: any) => (columns.value = clone(v))

      // ============== METHODS ===============

      const wrapExpr = (v: string) => (v.includes('{') ? v : `{${v}}`)

      const resolveExpr = (
        value: ColumnsValue | undefined
      ): ColumnsValue | undefined => {
        if (!expression.installed || !expression.allowed('columns')) {
          if (typeof value === 'string' && value.includes('{')) {
            expression.warn()
          }

          return Number(value ?? 0)
        }

        if (typeof value === 'string') {
          return expression.resolve(wrapExpr(value))
        }

        if (value && typeof value === 'object') {
          const result: ColumnsObject = {}

          for (const key of Object.keys(value) as ColumnKeys[]) {
            const v = value[key]
            result[key] =
              typeof v === 'string' ? expression.resolve(wrapExpr(v)) : v
          }

          return result
        }

        return value
      }

      /**
       * Focuses the first focusable HTML element (input, select, textarea,
       * button, etc.) within the wrapper. Optionally scrolls to the element
       * first.
       *
       * @param scroll Whether to scroll to the element before focusing.
       */
      const focus = async (scroll: boolean | undefined = false) => {
        if (scroll) await scrollTo()

        if (!(wrapper.value instanceof HTMLElement)) return false

        const target = wrapper.value.querySelector(
          'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),' +
            'button:not([disabled]),iframe,[tabindex],[contentEditable=true],trix-editor'
        )

        if (!(target instanceof HTMLElement)) return false

        target.focus()

        return true
      }

      /**
       * Scrolls the window to this element. If the element belongs to a step or
       * tab, that page is selected first before scrolling.
       *
       * @param options Options passed to `Element.scrollIntoView`.
       * @param force When `true`, always scrolls to the element. When `false`,
       *   only scrolls if the element is not already visible in the viewport.
       */
      const scrollTo = async (
        options?: ScrollIntoViewOptions,
        force?: boolean
      ) => {
        const opts = options ?? { behavior: 'smooth' }

        const containerPager = unref(container.pager)

        if (containerPager?.active && containerPager.page !== props.name) {
          containerPager.page = props.name
          await nextTick()
        } else if (form$) {
          const formPager = unref(form$.pager)

          if (formPager?.active) {
            const pageEntry = formPager.pages.find((p: any) =>
              p.elements.includes(path.value.split('.')[0])
            )

            if (pageEntry && !pageEntry.selected) {
              formPager.page = pageEntry.name
              await nextTick()
            }
          }
        }

        const el = rootDomOf(wrapper.value) as HTMLElement | null
        if (!el) return false

        if (!force && isTopInViewport(el)) return false

        el.scrollIntoView(opts)

        return true
      }

      // ============== WATCHERS ==============

      watch(() => props.columns, updateColumns, {
        immediate: false,
        deep: true,
      })

      return {
        page,
        label,
        help,
        description,
        helpId,
        descriptionId,
        errorId,
        labelId,
        resolvedColumns,
        genericName,
        updateColumns,
        focus,
        scrollTo,
      }
    }
)
