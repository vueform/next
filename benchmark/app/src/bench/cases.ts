import { nextTick } from 'vue'
import { form$ } from '../state'
import { allValues, flatText, steppedText } from './schemas'

/**
 * One benchmark case as it runs inside the page. `mount` cases time the
 * mount itself; `iterate` cases mount untimed, then time repetitions of
 * `iterate()` — one logical operation each, awaited through Vue's flush so
 * the cost includes the DOM update the operation causes.
 */
export interface CaseSpec {
  schema: (n: number) => Record<string, unknown>
  formProps?: Record<string, unknown>
  /** Bind an active v-model to the form. */
  vmodel?: boolean
  measure: 'mount' | 'iterate'
  /** Grab DOM/handles once, after the untimed mount (iterate cases). */
  prepare?: (n: number) => void
  iterate?: (n: number, iteration: number) => Promise<void>
}

let targetInput: HTMLInputElement

function prepareInput() {
  const inputs = document.querySelectorAll<HTMLInputElement>('#app input')
  targetInput = inputs[Math.floor(inputs.length / 2)]

  if (!targetInput) {
    throw new Error('[bench] no input element found after mount')
  }
}

async function dispatchInput(iteration: number) {
  targetInput.value = `typed ${iteration}`
  targetInput.dispatchEvent(new InputEvent('input', { bubbles: true }))
  await nextTick()
}

export const CASES: Record<string, CaseSpec> = {
  'render-text': {
    schema: flatText,
    measure: 'mount',
  },

  'render-steps': {
    schema: (n) => steppedText(n),
    formProps: { stepped: true },
    measure: 'mount',
  },

  'input-text': {
    schema: flatText,
    measure: 'iterate',
    prepare: prepareInput,
    iterate: (_n, i) => dispatchInput(i),
  },

  'input-text-vmodel': {
    schema: flatText,
    vmodel: true,
    measure: 'iterate',
    prepare: prepareInput,
    iterate: (_n, i) => dispatchInput(i),
  },

  'update-all': {
    schema: flatText,
    measure: 'iterate',
    iterate: async (n, i) => {
      form$.value.update(allValues(n, i))
      await nextTick()
    },
  },
}
