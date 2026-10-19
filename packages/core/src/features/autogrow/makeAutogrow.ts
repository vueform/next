import { nextTick, onMounted, onBeforeUnmount, watch } from 'vue'

import { type makeInput, type makeTData } from '#src/features'
import { defineFeature } from '#src/helpers'
import type { ReturnsOf } from '#src/types'

/**
 * Configuration for the autogrow factory that auto-resizes a textarea to fit
 * its content.
 */
type MakeAutogrowOptions = {
  props: {
    autogrow: boolean | undefined
  }
  deps: ReturnsOf<
    [[typeof makeInput, ['inputRef']], [typeof makeTData, ['value']]]
  >
}

/**
 * Provides automatic height adjustment for textarea elements. When enabled, the
 * textarea grows and shrinks to match its content, responding to value changes,
 * paste events, and programmatic updates.
 *
 * @param options Factory options containing autogrow props and dependencies.
 */
export const makeAutogrow = defineFeature(
  () =>
    ({ props, deps }: MakeAutogrowOptions) => {
      const { inputRef, value } = deps

      // ============== METHODS ===============

      /**
       * Adjusts the textarea height to match its scroll height. Temporarily
       * resets height to allow shrinking, then sets it to the content's scroll
       * height.
       */
      const autosize = () => {
        const el = inputRef.value as HTMLTextAreaElement | undefined
        if (!el || !props.autogrow) return

        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
      }

      /**
       * Handles paste events by scheduling an autosize after the pasted content
       * is applied.
       */
      const handlePaste = () => {
        nextTick(autosize)
      }

      // ================ HOOKS ===============

      onMounted(() => {
        if (!props.autogrow) return
        const el = inputRef.value as HTMLTextAreaElement | undefined
        if (!el) return

        el.addEventListener('paste', handlePaste)
        nextTick(autosize)
      })

      onBeforeUnmount(() => {
        const el = inputRef.value as HTMLTextAreaElement | undefined
        if (!el) return
        el.removeEventListener('paste', handlePaste)
      })

      // ============== WATCHERS ==============

      watch(
        () => value.value,
        () => {
          if (!props.autogrow) return
          nextTick(autosize)
        }
      )

      watch(
        () => props.autogrow,
        (val) => {
          if (val) {
            nextTick(autosize)
          } else {
            const el = inputRef.value as HTMLTextAreaElement | undefined
            if (el) el.style.height = ''
          }
        }
      )

      return {
        autosize,
      }
    }
)
