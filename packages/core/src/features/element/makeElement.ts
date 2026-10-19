import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRef,
  unref,
  watch,
  type Ref,
} from 'vue'

import {
  useChildren,
  useConfig,
  useCurrentName,
  useDynamicProp,
  useRootDom,
  useConditions,
} from '#src/composables'
import {
  createContainerContext,
  createElementContext,
  useContainerContext,
  useFormContext,
} from '#src/contexts'
import { defineFeature } from '#src/helpers'
import {
  type ConditionalProp,
  type ConditionsTriggerProp,
} from '#src/modules/conditions'
import { getModelModule } from '#src/modules/model'
import type { ComponentProp, ElementName, TProp } from '#src/types'
import { isClient, pickRefs } from '#src/utils'

/**
 * Configuration for the element factory providing core lifecycle, state, and
 * composition for a form element.
 */
type MakeElementOptions<Type extends string = string> = {
  props: {
    type: Type | undefined
    name: ElementName
    template: ComponentProp | undefined | null
    conditions: ConditionalProp | undefined
    conditionsTrigger: ConditionsTriggerProp | undefined
    conditionsDebounce: number | undefined
    id: TProp | undefined
    detached: boolean | undefined
    slots: Record<string, any> | undefined
  }
}

export const makeElement = defineFeature(() => {
  /**
   * Core factory for all form elements, composing identity, path, conditions,
   * template, layout, columns, and focus.
   *
   * @param options Factory options containing element props.
   */
  function makeElement<
    Type extends string = string,
    P extends MakeElementOptions<Type>['props'] =
      MakeElementOptions<Type>['props'],
  >({ props }: { props: P }) {
    const refs = pickRefs(props, ['type', 'name'])

    /**
     * The element's type identifier (e.g. "text", "checkbox", "select").
     */
    const type = refs.type as Ref<Type>

    if (!type.value) {
      throw new Error('Prop `type` must be specified for an element')
    }

    createElementContext()

    const conf = useConfig()

    /**
     * Reference to the component's root DOM element.
     */
    const $el = useRootDom()

    /**
     * The parent form's context, providing access to form-level state and
     * methods.
     */
    const form$ = useFormContext()

    /**
     * The resolved Vue component name for this element.
     */
    const componentName = useCurrentName()

    /**
     * The element's name as a string ref.
     */
    const name = toRef(() => String(props.name))

    // ================ ID ==================

    /**
     * A unique auto-generated identifier for the element.
     */
    const uid = ref(conf.uid())

    /**
     * The resolved element id, using the id prop or falling back to the
     * auto-generated uid.
     */
    const id = useDynamicProp(
      'id',
      toRef(() => props.id || uid.value),
      {
        string: true,
      }
    )

    // ============= CONTAINER ==============

    /**
     * The container context providing path, model, and registration methods for
     * child elements.
     */
    let container = props.detached ? undefined : useContainerContext()

    if (!container) {
      // Standalone element (no form above): a bare store is enough to back the
      // synthetic root container — no v-model binding or attachment applies.
      const store = getModelModule().makeModelStore()

      container = createContainerContext({
        type: 'root',
        id,
        model: store.model,
        register: (_instance, _path, dataPath, initialModel) => {
          if (dataPath) store.register(dataPath, initialModel)
        },
        unregister: (_instance, dataPath) => {
          if (dataPath) store.unregister(dataPath)
        },
        update: store.set,
        subscribe: store.subscribe,
      })
    }

    // =============== PATH =================

    /**
     * The element's dot-notation path in the form tree (e.g. "user.name").
     */
    const path = computed(
      () =>
        `${container.path.value !== '' ? `${container.path.value}.` : ''}${props.name}`
    )

    // ============== CHILDREN ==============

    /**
     * The child element registry providing registration, unregistration, and
     * reactive child lists.
     */
    const children = useChildren(path)

    // ============= CONDITIONS =============

    const conditionsResult = useConditions(
      toRef(() => props.conditions),
      {
        path,
        trigger: toRef(() => props.conditionsTrigger),
        debounce: toRef(() => props.conditionsDebounce),
      }
    )

    /**
     * Whether the element is available (not hidden by conditional logic).
     */
    const available = computed(() => {
      if (container !== undefined && !container?.available.value) return false
      if (props.conditions == null || (form$ && !form$?.model)) return true

      return conditionsResult.value
    })

    const pager = unref(container.pager)

    /**
     * Whether the element's view has been loaded (used for lazy rendering
     * optimization).
     */
    const viewLoaded = ref(!conf.lazy)

    /**
     * Whether the element is currently visible, based on availability,
     * container visibility, and pager state.
     */
    const visible = computed(() => {
      if ((!container.visible.value && !viewLoaded.value) || !available.value)
        return false
      return (!pager?.active || pager?.page === props.name) && available.value
    })

    const hasIdleCallback = isClient && 'requestIdleCallback' in window

    const onIdle = (cb: () => void) =>
      hasIdleCallback
        ? window.requestIdleCallback(cb)
        : setTimeout(() => nextTick(cb), 300)

    const cancelIdle = (id: number) =>
      hasIdleCallback ? window.cancelIdleCallback(id) : clearTimeout(id)

    if (conf.lazy) {
      // The pending callback keeps its closure — and through the ref's
      // subscribers, the element's render graph — alive until the browser goes
      // idle. A busy page that mounts and unmounts many elements (route
      // changes, a benchmark loop) never gets there, so cancel it on unmount
      // instead of letting unmounted elements pile up until idle time.
      let idleId: number | undefined

      onMounted(() => {
        idleId = onIdle(() => {
          idleId = undefined
          viewLoaded.value = true
        }) as number
      })

      onBeforeUnmount(() => {
        if (idleId !== undefined) {
          cancelIdle(idleId)
          idleId = undefined
        }
      })

      watch(
        visible,
        (n, o) => {
          if (viewLoaded.value) return
          if (n && !o) viewLoaded.value = true
        },
        { immediate: true }
      )
    }

    // ============= GENERIC NAME ===========

    /**
     * A human-readable name resolved from displayName, label, floating,
     * placeholder, or the element's name prop.
     */
    const genericName = computed(() => String(props.name))

    return {
      $el,
      type,
      name,
      componentName,
      form$,
      uid,
      id,
      container,
      path,
      children,
      available,
      visible,
      viewLoaded,
      genericName,
    }
  }

  return makeElement
})
