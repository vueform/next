import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useComponentContext } from '~/contexts'
import type { makeData, makeInteraction } from '~/features'
import { defineFeature, type FeatureEvents } from '~/helpers'
import type { LooseContext, ReturnsOf } from '~/types'

/**
 * @write
 */
interface MakeInputOptions {
  deps: ReturnsOf<
    [[typeof makeData, ['onUserInput', 'update', 'value']]],
    [[typeof makeInteraction, ['handleFocus', 'handleBlur']]]
  >
  events: FeatureEvents<{
    input: [value: any, e: Event | undefined, context$: LooseContext]
  }>
}

/**
 * Configuration for the input factory.
 */
export type MakeInputConfig = {
  /**
   * Whether the registered input's DOM value is the model's own serialization —
   * i.e. copying the DOM value into the model as-is is always safe. When on
   * (the default), `handleInput` may adopt values resolved from native events,
   * and the registered input gains recovery listeners that pick up value
   * changes no bound event reported (change-only autofill, password managers,
   * the composition trailing edge without `v-model`). Blueprints whose DOM
   * shows a _formatted_ representation (masks, formatted dates) must pass
   * `false` — for them the DOM string is display, not data.
   *
   * Accepts a ref/getter so the answer can change at runtime (e.g. a `mask`
   * prop appearing on a text element).
   */
  canonicalDomValue?: MaybeRefOrGetter<boolean>
}

/**
 * Whether a `handleInput` argument is a DOM event rather than a value.
 */
const isEvent = (value: unknown): value is Event =>
  typeof Event !== 'undefined' && value instanceof Event

/**
 * Whether an event belongs to an in-progress IME composition session. Reads
 * both Vue's `v-model` flag (`target.composing` — cleared before the synthetic
 * post-composition `input` is dispatched, so the final report passes) and the
 * native `isComposing` for wirings without `v-model`.
 */
const isComposing = (e: Event) =>
  !!(e.target as any)?.composing || !!(e as InputEvent).isComposing

/**
 * The value Vue bound to an input/option through `:value` (kept on `_value`
 * with its original type), falling back to the DOM string value.
 */
const boundValue = (el: any) => ('_value' in el ? el._value : el.value)

/**
 * Casts a numeric string to a number, keeping non-numeric input as-is — what
 * `v-model` does for `type="number"` inputs.
 */
const looseToNumber = (value: any) => {
  const n = parseFloat(value)
  return isNaN(n) ? value : n
}

/**
 * Loose value comparison for DOM recovery: primitives compare by their string
 * form so a cast difference (`12` vs `"12"` under `v-model.number`) never
 * counts as a missed write, and everything else falls back to identity.
 */
const looselyEqual = (a: any, b: any) => {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a === 'object' || typeof b === 'object') return false
  return String(a) === String(b)
}

/**
 * Resolves the model value a native input/change event carries, mirroring
 * `v-model`: `checked` mapped onto the true/false values for checkboxes, the
 * bound `:value` for radios and select options, a number for `type="number"`
 * inputs, and the DOM value otherwise.
 *
 * @param target The event target (or the input element itself).
 * @param props The element's resolved props (true/false/radio value fallbacks).
 */
const resolveEventValue = (target: any, props: Record<string, any>) => {
  if (target.type === 'checkbox') {
    return target.checked
      ? '_trueValue' in target
        ? target._trueValue
        : (props.trueValue ?? true)
      : '_falseValue' in target
        ? target._falseValue
        : (props.falseValue ?? false)
  }

  if (target.type === 'radio') {
    return '_value' in target
      ? target._value
      : (props.radioValue ?? target.value)
  }

  if (target.tagName === 'SELECT') {
    const selected = Array.from(target.selectedOptions ?? [], boundValue)
    return target.multiple ? selected : (selected[0] ?? null)
  }

  if (target.type === 'number') {
    return looseToNumber(target.value)
  }

  return target.value
}

/**
 * Resolves the file-input value of an event target — the file list for
 * `multiple`, the single file (or `null`) otherwise.
 */
const resolveFileValue = (target: any) =>
  target.multiple ? Array.from(target.files ?? []) : (target.files?.[0] ?? null)

/**
 * Tags eligible for the DOM recovery listeners — the native controls whose
 * value `resolveEventValue` can read back.
 */
const RECOVERABLE_TAGS = ['INPUT', 'TEXTAREA', 'SELECT']

/**
 * Input types the model→DOM write-back applies to: text-like controls where
 * assigning `el.value` is the correct sync. Checkbox/radio/select/file need
 * control-specific assignment — bind `v-model` for those instead.
 */
const isTextLike = (el: Element) =>
  el.tagName === 'TEXTAREA' ||
  (el.tagName === 'INPUT' &&
    !['checkbox', 'radio', 'file'].includes((el as HTMLInputElement).type))

/**
 * Provides the user-input pipeline: the template ref to the underlying input,
 * the unified `handleInput` intent handler, DOM recovery for value changes no
 * bound event reported, and the spreadable binding bags.
 */
export const makeInput = defineFeature(
  (config?: MakeInputConfig) =>
    ({ deps, events }: MakeInputOptions) => {
      const context$ = useComponentContext()

      // ================ REFS ================

      /**
       * Ref to the underlying input element.
       */
      const input = ref()

      /**
       * Whether the registered input's DOM value is the model's own
       * serialization (see `MakeInputConfig`). Gates both `handleInput`'s
       * event-value adoption and the DOM recovery listeners.
       */
      const canonicalDomValue = computed(() =>
        toValue(config?.canonicalDomValue ?? true)
      )

      // ============== METHODS ===============

      /**
       * Registers the underlying input element. Bind it as a function ref in
       * custom templates and slots (`:ref="context.setInputRef"`) — the context
       * members are read-only there, so `input` can't be assigned directly.
       * Receives the element (or component instance) on mount and `null` on
       * unmount, like any function ref.
       *
       * @param el The input element / component instance, or `null`.
       */
      const setInputRef = (el: any) => {
        input.value = el
      }

      /**
       * Fires the `input` event and notifies Vueform of a user-initiated change
       * — what lets `validateOn` distinguish user input from programmatic
       * writes and what expressions untrack on (`untrackOn`).
       */
      const report = (value: any, e?: Event) => {
        events.fire('input', value, e, context$)
        deps.onUserInput()
      }

      /**
       * Handles a user-initiated change end to end. Bind it to the one event
       * that means "the user changed it": `@input` for native text inputs,
       * `@change` for native checkbox / radio / select / file controls,
       * `@update:model-value` for components — alongside `v-model`, or without
       * it.
       *
       * Accepts the new value or the native event carrying it (an event's value
       * is read the way `v-model` reads it); a plain value may pass the
       * originating event as the second argument so composition filtering still
       * applies. Events fired during an IME composition session are ignored —
       * the composed text arrives once, when the session ends.
       *
       * The value is written to the model only when the model doesn't hold it
       * yet — with `v-model` in place this is a pure user-input notification,
       * without it `handleInput` performs the write itself. Values resolved
       * from native events are only adopted while `canonicalDomValue` is on; on
       * formatted inputs (masks) the event carries display text, so only the
       * notification fires, with the current model value as the payload. Either
       * way it reports the input: fires the `input` event with `(value, event,
       * context$)` and triggers `validateOn` / expression untracking. It does
       * **not** touch the interaction states — `visited` and `touched` come
       * from `handleFocus` / `handleBlur`.
       *
       * @param payload The new value, or the native event carrying it.
       * @param e The originating event, when `payload` is a plain value.
       */
      const handleInput = (payload: any, e?: Event) => {
        let value = payload
        let event = e

        if (isEvent(payload)) {
          event = payload
          if (isComposing(event)) return

          const target = event.target as any
          value =
            target?.type === 'file'
              ? resolveFileValue(target)
              : resolveEventValue(target, context$.props ?? {})

          if (!canonicalDomValue.value) {
            // Formatted DOM — the event's string is display, not data. The
            // value channel (`v-model` / the component wiring) owns the
            // write; report with the model's current value.
            report(deps.value.value, event)
            return
          }
        } else if (event && isComposing(event)) {
          return
        }

        if (value !== deps.value.value) deps.update(value)
        report(value, event)
      }

      /**
       * Adopts a DOM value change no bound event reported (change-only
       * autofill, password managers, the composition trailing edge without
       * `v-model`): resolves the node's current value and, only when the model
       * doesn't already hold it, writes and reports it as user input. Silent in
       * every normal flow.
       */
      const recover = (node: Element) => (e: Event) => {
        if ((node as any).composing) return
        const resolved = resolveEventValue(node, context$.props ?? {})
        if (looselyEqual(resolved, deps.value.value)) return
        deps.update(resolved)
        report(resolved, e)
      }

      // ============= WATCHERS ===============

      // DOM recovery listeners on the registered input. Only actual native
      // value-carrying nodes qualify — component instances and wrapper
      // elements registered as the input ref are skipped, as are file inputs
      // (their DOM value is a fakepath string, and autofill never targets
      // them).
      watch(
        [input, canonicalDomValue],
        ([el, canonical], _old, onCleanup) => {
          if (!canonical) return
          if (typeof Element === 'undefined' || !(el instanceof Element)) return
          if (!RECOVERABLE_TAGS.includes(el.tagName)) return
          if ((el as HTMLInputElement).type === 'file') return

          const handler = recover(el)
          el.addEventListener('change', handler)
          el.addEventListener('compositionend', handler)
          onCleanup(() => {
            el.removeEventListener('change', handler)
            el.removeEventListener('compositionend', handler)
          })
        },
        { immediate: true, flush: 'post' }
      )

      // Model → DOM write-back for text-like inputs wired through
      // `inputBindings` (no `v-model`): keeps the DOM in sync with
      // programmatic model changes. Skipped mid-composition and when the
      // value already matches (so the caret is never disturbed while
      // typing); harmlessly idempotent alongside `v-model`.
      watch(
        [deps.value, input, canonicalDomValue],
        ([value, el, canonical]) => {
          if (!canonical) return
          if (typeof Element === 'undefined' || !(el instanceof Element)) return
          if (!isTextLike(el)) return

          const node = el as HTMLInputElement | HTMLTextAreaElement
          if ((node as any).composing) return

          const next = value == null ? '' : String(value)
          if (node.value === next) return
          if (
            looselyEqual(resolveEventValue(node, context$.props ?? {}), value)
          )
            return

          node.value = next
        },
        { immediate: true, flush: 'post' }
      )

      // ================ BAGS ================

      /**
       * Spreadable bindings for a native text-like input rendered without
       * `v-model`: `v-bind="context.inputBindings"` wires the ref, the
       * user-input report (which also performs the write — the DOM recovery and
       * write-back watchers complete the two-way sync), and the interaction
       * listeners.
       */
      const inputBindings = computed(() => ({
        onInput: handleInput,
        ...(deps.handleFocus ? { onFocus: deps.handleFocus } : {}),
        ...(deps.handleBlur ? { onBlur: deps.handleBlur } : {}),
        ref: setInputRef,
      }))

      /**
       * Spreadable bindings for a component input rendered without `v-model`:
       * `v-bind="context.componentBindings"` wires `modelValue`, the
       * `update:modelValue` handler (write + user-input report), and the
       * interaction listeners for components that emit focus / blur.
       */
      const componentBindings = computed(() => ({
        modelValue: deps.value.value,
        'onUpdate:modelValue': (value: any) => handleInput(value),
        ...(deps.handleFocus ? { onFocus: deps.handleFocus } : {}),
        ...(deps.handleBlur ? { onBlur: deps.handleBlur } : {}),
      }))

      return {
        input,
        setInputRef,
        canonicalDomValue,
        handleInput,
        inputBindings,
        componentBindings,
      }
    }
)
