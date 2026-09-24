import { computed, ref } from 'vue'
import { type makeDisabled, type makeRData } from '@core/features'
import { defineFeature } from '@core/helpers'
import type { ReturnsOf } from '@core/types'

/**
 * Configuration for the sortable factory enabling drag-and-drop reordering of
 * container items.
 */
type MakeSortableOptions = {
  props: {
    /**
     * @write
     */
    sort: boolean | undefined
  }
  deps: ReturnsOf<
    [
      [typeof makeRData, ['items', 'sort', 'dragIndex', 'dropIndex']],
      [typeof makeDisabled, ['disabled']],
    ]
  >
}

/**
 * Provides drag-and-drop reordering for container elements such as lists and
 * matrices.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeSortable = defineFeature(
  () =>
    ({ props, deps }: MakeSortableOptions) => {
      const { items, sort, dragIndex, dropIndex, disabled } = deps

      /**
       * Ref to the container's root DOM element, used for drag-and-drop bounds
       * detection.
       */
      const list = ref()

      let listBounds: Partial<DOMRect> = {}

      /**
       * Whether the sort handle should be rendered. Returns `false` when the
       * element is disabled or the optional sortable guard is falsy.
       */
      const canSort = computed(() => {
        if (disabled.value) return false
        return !!props.sort
      })

      /**
       * Initiates drag-and-drop reordering for the item at the given data
       * index.
       *
       * @param e The drag event.
       * @param index The data index of the item being dragged.
       */
      const handleDragStart = (e: DragEvent, index: number) => {
        e.dataTransfer!.effectAllowed = 'move'
        dragIndex.value = index
        if (!list.value) return
        listBounds = list.value.getBoundingClientRect()
        document.addEventListener('dragover', handleDocumentDragOver)
      }

      /**
       * Updates the current drop target during drag-and-drop. `index` is the
       * hovered row's live display position; the dragged item moves straight to
       * it (its origin position included, so it can be dropped back home).
       * `dragIndex` stays the canonical data index that feeds `move`/`sort` as
       * the source.
       *
       * @param e The drag event (unused).
       * @param index The hovered row's display position.
       */
      const handleDragEnter = (_e: DragEvent, index: number) => {
        dropIndex.value = index
      }

      /**
       * Completes the drag-and-drop operation by sorting the dragged item to
       * the drop position.
       *
       * @param e The drop event (unused).
       */
      const handleDrop = (_e: DragEvent) => {
        if (dragIndex.value !== undefined && dropIndex.value !== undefined) {
          sort(dragIndex.value, dropIndex.value)
        }
      }

      /**
       * Cleans up drag-and-drop state after the operation ends.
       */
      const handleDragEnd = () => {
        dragIndex.value = undefined
        dropIndex.value = undefined
        listBounds = {}
        document.removeEventListener('dragover', handleDocumentDragOver)
      }

      /**
       * Prevents default dragover behavior on the container to allow drops.
       *
       * @param e The dragover event.
       */
      const handleWrapperDragOver = (e: DragEvent) => e.preventDefault()

      /**
       * The stable id rendered at the current drop position (in the live
       * display order), or `undefined` when not hovering over a valid target.
       * The list template compares this against each row's id to flag the drop
       * target.
       */
      const dropTarget = computed(() =>
        dropIndex.value != null ? items.value[dropIndex.value]?.id : undefined
      )

      const handleDocumentDragOver = (e: MouseEvent) => {
        const { pageX, pageY } = e
        const { x, y, width, height } = listBounds

        if (
          x === undefined ||
          y === undefined ||
          width === undefined ||
          height === undefined
        )
          return

        const inBox =
          pageX >= x && pageX <= x + width && pageY >= y && pageY <= y + height

        if (!inBox) {
          dropIndex.value = undefined
        }
      }

      return {
        list,
        canSort,
        dropTarget,
        handleDragStart,
        handleDragEnter,
        handleDrop,
        handleDragEnd,
        handleWrapperDragOver,
      }
    }
)
