import {
  computed,
  proxyRefs,
  ref,
  shallowRef,
  toRef,
  unref,
  watch,
  type ComputedRef,
  type MaybeRef,
} from 'vue'

import { useComponentContext } from '#core/contexts'
import {
  defineEvents,
  type EventListener,
  type TypeEmitsToOptions,
} from '#core/helpers'
import type { ConditionalProp } from '#core/modules/conditions'
import { getValidationModule } from '#core/modules/validation'
import type {
  ComponentProp,
  ElementName,
  EmitsToProps,
  NamedElementSchema,
  PageName,
  PageProp,
  ValidateOnProp,
} from '#core/types'
import { resolveIcon, typedEntries } from '#core/utils'

import {
  useConfig,
  useRootDom,
  useDynamicPropFactory,
  useFallbackProp,
  type VueformChildren,
  useRouter,
} from './'

/**
 * Event map for pager navigation actions.
 */
type PagerEmits = {
  /**
   * Fired after a page is selected.
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated away from.
   */
  select: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired after a step transition (next or back).
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated away from.
   */
  step: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired after navigating to the previous page.
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated away from.
   */
  back: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired after advancing to the next page.
   *
   * @param newPage The page being navigated to.
   * @param oldPage The page being navigated away from.
   */
  next: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired when all pages are validated and the pager completes.
   */
  finish: []

  /**
   * Fired when a page fails validation during navigation.
   *
   * @param page The page that failed validation.
   */
  invalid: [page: ResolvedPage]

  /**
   * Fired before a page selection is applied. Return `false` to cancel.
   *
   * @param newPage The page about to be navigated to.
   * @param oldPage The page about to be navigated away from.
   */
  beforeSelect: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired before a step transition. Return `false` to cancel.
   *
   * @param newPage The page about to be navigated to.
   * @param oldPage The page about to be navigated away from.
   */
  beforeStep: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired before navigating back. Return `false` to cancel.
   *
   * @param newPage The page about to be navigated to.
   * @param oldPage The page about to be navigated away from.
   */
  beforeBack: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired before advancing to the next page. Return `false` to cancel.
   *
   * @param newPage The page about to be navigated to.
   * @param oldPage The page about to be navigated away from.
   */
  beforeNext: [newPage: ResolvedPage, oldPage: ResolvedPage]

  /**
   * Fired before the pager finishes. Return `false` to cancel.
   */
  beforeFinish: []
}

/**
 * Configuration options for the usePager composable.
 */
type UsePagesOptions = {
  /**
   * Whether pages must be completed in order. When `true`, users cannot skip
   * ahead to unvisited pages.
   */
  sequential?: MaybeRef<boolean>

  /**
   * Whether to integrate with browser history via `pushState`, enabling
   * back/forward navigation.
   */
  history?: MaybeRef<boolean | undefined>

  /**
   * Whether the pager is active. When `false`, pager behavior is disabled.
   */
  active?: MaybeRef<boolean | undefined>

  /**
   * The children registry providing access to registered child element
   * instances.
   */
  children: VueformChildren

  /**
   * A computed array of page schemas, each containing the page's element props
   * and component definition.
   */
  schema: ComputedRef<
    {
      props: NamedElementSchema
      component: ComponentProp
    }[]
  >
} & Partial<EmitsToProps<PagerEmits>>

/**
 * A fully resolved page object containing its metadata, navigation state,
 * validation helpers, and keyboard/focus handlers.
 */
export type ResolvedPage = {
  /**
   * The resolved label text for the page tab.
   */
  label: string | undefined

  /**
   * The metadata object from the page prop's tuple form (including `label`).
   * `undefined` when the page prop is a plain text value.
   */
  meta: Record<string, any> | undefined

  /**
   * The element names contained in this page.
   */
  elements: ElementName[]

  /**
   * The unique name identifying this page.
   */
  name: PageName

  /**
   * The zero-based index of this page in the page list.
   */
  index: number

  /**
   * The HTML `id` for the page's tab element (accessibility).
   */
  pageId: string

  /**
   * The HTML `id` for the page's panel element (accessibility).
   */
  panelId: string

  /**
   * The tab's `tabindex` value for keyboard navigation.
   */
  tabindex: number

  /**
   * Whether the page is currently available (visible).
   */
  available: boolean | boolean

  /**
   * Whether this page is the currently selected page.
   */
  selected: boolean

  /**
   * Whether the page has been completed (validated without errors and not the
   * current page).
   */
  completed: boolean

  /**
   * Whether the page is enabled for navigation (based on sequential progress).
   */
  enabled: boolean

  /**
   * Whether the page has validation errors.
   */
  invalid: boolean

  /**
   * Whether the page is busy validating or processing an event.
   */
  loading: boolean

  /**
   * The page's element component context, if registered.
   */
  el$: any | undefined

  /**
   * Validates all elements within this page and returns whether it passed.
   */
  validate: () => Promise<boolean>

  /**
   * Resets the validation state for all elements within this page.
   */
  unvalidate: () => void

  /**
   * Selects this page, making it the active page.
   */
  select: () => void

  /**
   * Handles keyboard navigation events on the page tab.
   *
   * @param $event The keyboard event to handle.
   */
  keydown: ($event: KeyboardEvent) => void

  /**
   * Focuses the page tab for keyboard navigation.
   */
  focus: () => void

  /**
   * Blurs the page tab, removing keyboard focus.
   */
  blur: () => void
}

/**
 * The public API surface returned by `usePager`, providing page state,
 * navigation methods, validation, and event subscription.
 */
export type Pager = {
  /**
   * The name of the currently selected page.
   */
  page: PageName | undefined

  /**
   * The name of the previously selected page.
   */
  oldPage: PageName | undefined

  /**
   * The zero-based index of the currently selected page.
   */
  index: number

  /**
   * Whether the pager is active and should render pages.
   */
  active: boolean

  /**
   * The index of the last enabled page (used in sequential mode to track
   * progress).
   */
  lastEnabled: number

  /**
   * Whether any page is currently loading (busy or has an event in progress).
   */
  loading: boolean

  /**
   * Whether any page has validation errors.
   */
  invalid: boolean

  /**
   * Whether pages must be navigated in sequential order.
   */
  sequential: boolean | undefined

  /**
   * The array of resolved page objects containing metadata, state, and methods
   * for each page.
   */
  pages: ResolvedPage[]

  /**
   * The next available page after the current one, or undefined if none exists.
   */
  nextPage: ResolvedPage | undefined

  /**
   * The previous available page before the current one, or undefined if none
   * exists.
   */
  previousPage: ResolvedPage | undefined

  /**
   * The currently selected resolved page object.
   */
  currentPage: ResolvedPage | undefined

  /**
   * The name of the last available page.
   */
  lastPage: PageName | undefined

  /**
   * Selects a page by name or index, optionally reverting enabled state and
   * pushing to browser history.
   *
   * @param name The page name or index to select.
   * @param reverting Whether to allow reverting the last enabled index.
   * @param pushHistory Whether to push the selection to browser history.
   */
  select: (
    name: PageName,
    reverting?: boolean,
    pushHistory?: boolean
  ) => Promise<void>

  /**
   * Advances to the next available page after validating the current one.
   */
  next: () => Promise<void>

  /**
   * Navigates back to the previous available page.
   */
  back: () => Promise<void>

  /**
   * Completes the pager by validating all enabled pages and firing the `finish`
   * event.
   */
  finish: () => Promise<void>

  /**
   * Resets the pager to the first page and unvalidates all subsequent pages.
   */
  reset: () => void

  /**
   * Reverts the pager to a specific page, unvalidating all pages after it.
   *
   * @param page The page name or index to revert to.
   */
  revertTo: (page: PageName) => void

  /**
   * Subscribes a callback to a specific event.
   *
   * @param e The event name.
   * @param callback The handler to invoke when the event fires.
   */
  on: EventListener<TypeEmitsToOptions<PagerEmits>>

  /**
   * Removes a previously registered event callback.
   *
   * @param e The event name.
   * @param callback The handler to remove. Omit to remove all listeners for the
   *   event.
   */
  off: EventListener<TypeEmitsToOptions<PagerEmits>>

  /**
   * Enables all pages up to the given page index, optionally allowing revert to
   * an earlier index.
   *
   * @param page The page name or index to enable up to.
   * @param allowRevert Whether to allow reverting to an earlier enabled index.
   */
  enableUntil: (page: PageName | undefined, allowRevert?: boolean) => void

  /**
   * Returns the resolved page object for the given page name or index.
   *
   * @param page The page name or index to look up.
   */
  getPage: (page: PageName | undefined) => ResolvedPage | undefined
}

/**
 * Manages multi-page form navigation with sequential/free-form modes,
 * validation, history, and keyboard support.
 *
 * @private
 * @param options Pager configuration object.
 */
export function usePager(options: UsePagesOptions): Pager {
  const {
    schema,
    children,
    onSelect,
    onStep,
    onBack,
    onNext,
    onFinish,
    onInvalid,
    onBeforeSelect,
    onBeforeStep,
    onBeforeBack,
    onBeforeNext,
    onBeforeFinish,
  } = options

  const { on, off, fire, fireAsync, eventInProgress } =
    defineEvents<PagerEmits>()

  const context$ = useComponentContext()
  const config = useConfig()
  const validation = getValidationModule()
  const makeDynamicProp = useDynamicPropFactory()
  const validateOn = useFallbackProp<ValidateOnProp>('validateOn')
  const root = useRootDom()

  const History = useRouter(
    toRef(() => !!unref(options.history)),
    (state) => select(state?.page || pageName(0), false, false)
  )

  // ================ DATA ================

  const page = ref<PageName | undefined>()
  const pages = shallowRef<ResolvedPage[]>([])
  const oldPage = ref<PageName | undefined>()
  const lastEnabled = ref(0)
  const focused = ref<number | undefined>()
  const sequential = toRef(() => unref(options.sequential))

  // ============== COMPUTED ==============

  const index = computed(() => indexOf(page.value))
  const active = computed(() => unref(options.active) ?? true)
  const loading = computed(() => pages.value.some(({ loading }) => loading))
  const invalid = computed(() => pages.value.some(({ invalid }) => invalid))
  const currentPage = computed(() => getPage(page.value))
  const nextPage = computed(() =>
    pages.value.find((page) => page.index > index.value && page.available)
  )
  const previousPage = computed(() =>
    [...pages.value]
      .reverse()
      .find((page) => page.index < index.value && page.available)
  )
  const lastPage = computed(
    () => [...pages.value].reverse().find((page) => page.available)?.name
  )

  const source = toRef(() =>
    active.value
      ? schema.value.length
        ? schema.value.map(({ props }) => props)
        : children.children$.size
          ? [...children.children$.values()]
          : []
      : []
  )

  // ============== METHODS ===============

  const select = async (
    name: PageName,
    reverting: boolean = false,
    pushHistory: boolean = true
  ) => {
    name = pageName(name)
    if (
      !getPage(name)?.available ||
      eventInProgress.value ||
      page.value === name
    )
      return
    const newPageResolved = getPage(name)!
    const oldPageResolved = currentPage.value!
    if (
      oldPage.value &&
      (await fireAsync('beforeSelect', newPageResolved, oldPageResolved)) ===
        false
    )
      return
    enableUntil(name, reverting)
    page.value = name
    if (oldPage.value) fire('select', newPageResolved, oldPageResolved)
    if (pushHistory) History.push({ page: page.value })
  }

  const next = async () => {
    if (!nextPage.value || (loading.value && index.value === lastEnabled.value))
      return
    const newPageResolved = nextPage.value
    const oldPageResolved = currentPage.value!
    if (!(await fireAsync('beforeNext', newPageResolved, oldPageResolved)))
      return
    if (!currentPage.value?.loading && (await validate('next', true)) === false)
      return
    select(nextPage.value.name)
    fire('next', newPageResolved, oldPageResolved)
  }

  const back = async () => {
    if (!previousPage.value) return
    const newPageResolved = previousPage.value
    const oldPageResolved = currentPage.value!
    if (!(await fireAsync('beforeBack', newPageResolved, oldPageResolved)))
      return
    if (!currentPage.value?.loading && (await validate('back')) === false)
      return
    await History.back()
    select(previousPage.value.name, false, false)
    fire('back', newPageResolved, oldPageResolved)
  }

  const finish = async () => {
    if (nextPage.value || loading.value) return
    if ((await fireAsync('beforeFinish')) === false) return
    fireAsync('finish')
  }

  const validate = async (
    events?: string | string[],
    validateAllBefore: boolean = false
  ) => {
    const shouldValidate =
      !events || validation.hasValidateOnTrigger(validateOn.value, events)

    if (shouldValidate) {
      await currentPage.value?.validate()
      if (currentPage.value?.invalid) {
        fire('invalid', currentPage.value)
        return false
      }
    }

    if (validateAllBefore) {
      if (shouldValidate) {
        for (const page of pages.value.filter(
          (page) => page.index < index.value
        )) {
          await page.validate()

          if (page.invalid) {
            fire('invalid', page)
            return false
          }
        }
      }
    }

    return true
  }

  const reset = () => revertTo(0)

  const revertTo = (page: PageName) => {
    const index = typeof page === 'number' ? page : indexOf(page)

    if (index > -1 && index < lastEnabled.value) {
      for (let i = index; i <= lastEnabled.value; i++) {
        pages.value[i]?.unvalidate()
      }
    }

    select(page, true)
  }

  const makePage = (
    o: {
      page?: PageProp
      name: PageName
      conditions?: ConditionalProp
      available?: ComputedRef<boolean>
    },
    i: number
  ) => {
    const el$ = toRef(() => children.children$.get(o.name))
    const name = toRef(o, 'name')
    const meta = computed(() => {
      const meta =
        typeof o.page === 'function' ? o.page(el$.value || {}) : o.page

      if (!Array.isArray(meta)) {
        return {
          label: meta,
        }
      }

      const pageMeta = { ...meta[0] }

      if (typeof pageMeta.icon === 'string') {
        pageMeta.icon = resolveIcon(config, pageMeta.icon)
      }

      return pageMeta
    })

    const pageInstance = proxyRefs({
      elements: toRef(() => [o.name]),
      available: toRef(() => (el$.value ? el$.value.available : !o.conditions)),
      label: makeDynamicProp(
        'page-label',
        toRef(() => meta.value.label),
        {
          context$,
          localize: true,
          string: true,
        }
      ),
      meta,
      name,
      index: toRef(() => i),
      pageId: toRef(() => `${name.value}__tab`),
      panelId: toRef(() => `${name.value}__panel`),
      selected: toRef(() => page.value === o.name),
      tabindex: toRef(() =>
        focused.value !== undefined
          ? focused.value === i
            ? 0
            : -1
          : page.value === o.name
            ? 0
            : -1
      ),
      completed: toRef(() => i < lastEnabled.value && !!el$.value?.completed),
      enabled: toRef(() => i <= lastEnabled.value),
      invalid: toRef(() => !!el$.value?.invalid),
      loading: toRef(
        () => !!el$.value?.busy || (i === index.value && eventInProgress.value)
      ),
      el$,
      validate: async () =>
        el$.value && 'validate' in el$.value && (await el$.value.validate()),
      unvalidate: () => el$.value.unvalidate(),
      select: () => (!sequential.value || getPage(i)?.enabled ? select(i) : {}),
      keydown: ($event: KeyboardEvent) => handleKeyDown($event, pageInstance),
      focus: () => focus(i),
      blur: () => blur(),
    })

    return pageInstance
  }

  const getPage = (page: PageName | undefined) =>
    page === undefined || !pages.value.length
      ? undefined
      : pages.value[indexOf(page)]

  const pageName = <T extends PageName | undefined>(page: T) =>
    typeof page === 'number' ? pages.value[page]?.name : page

  const indexOf = (page: PageName | undefined) =>
    page === undefined
      ? -1
      : typeof page === 'number'
        ? page
        : Object.values(pages.value)
            .map((s) => s.name)
            .indexOf(page)

  const enableUntil = (page: PageName | undefined, allowRevert = false) => {
    const untilIndex = indexOf(page)
    if (untilIndex === -1 || (lastEnabled.value >= untilIndex && !allowRevert))
      return
    lastEnabled.value = untilIndex
    return untilIndex
  }

  const focus = (index: number) => {
    focused.value = index
  }

  const blur = () => {
    focused.value = undefined
  }

  const handleKeyDown = (e: KeyboardEvent, page: ResolvedPage) => {
    switch (e.key) {
      case 'Enter':
      case 'NumpadEnter':
        e.preventDefault()
        page.select()
        break

      case 'ArrowRight':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'Home':
      case 'End':
        if (focused.value === undefined) return
        e.preventDefault()
        const availablePages = pages.value.filter(({ available }) => available)
        let next: ResolvedPage | undefined

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            next = availablePages[focused.value + 1] || availablePages[0]
            break

          case 'ArrowLeft':
          case 'ArrowUp':
            next =
              availablePages[focused.value - 1] ||
              availablePages[availablePages.length - 1]
            break

          case 'Home':
            next = availablePages[0]
            break

          case 'End':
            next = availablePages[availablePages.length - 1]
            break
        }

        if (!root.value || !next) return
        ;(root.value.querySelector(`#${next.pageId}`) as any)?.focus()
        break
    }
  }

  // ================ HOOKS ===============

  typedEntries({
    select: onSelect,
    step: onStep,
    back: onBack,
    next: onNext,
    finish: onFinish,
    invalid: onInvalid,
    beforeSelect: onBeforeSelect,
    beforeStep: onBeforeStep,
    beforeBack: onBeforeBack,
    beforeNext: onBeforeNext,
    beforeFinish: onBeforeFinish,
  }).forEach(([key, cb]) => !cb || on(key, cb as any))

  // ============== WATCHERS ==============

  watch(page, (n, o) => (oldPage.value = o === undefined ? n : o))

  watch(
    source,
    () => {
      pages.value = source.value.map(makePage)

      if (!pages.value.length) {
        lastEnabled.value = 0
        page.value = undefined
        return
      }

      if (pages.value.length && lastEnabled.value > pages.value.length - 1) {
        lastEnabled.value = pages.value.length - 1
      }

      if (indexOf(page.value) > pages.value.length - 1) {
        page.value = pageName(pages.value.length - 1)
      }

      if (page.value === undefined || !getPage(page.value)?.available) {
        reset()
      }
    },
    { deep: false, immediate: true }
  )

  return proxyRefs({
    page,
    oldPage,

    index,
    active,
    lastEnabled,
    loading,
    invalid,
    sequential,

    pages,
    nextPage,
    previousPage,
    currentPage,
    lastPage,

    select,
    next,
    back,
    finish,
    reset,
    revertTo,
    on,
    off,
    enableUntil,
    getPage,
  })
}
