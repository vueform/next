import { unref, watch } from 'vue'

import { warn, isDev } from '#src/utils'

import type {
  AutosaveInstance,
  AutosaveModule,
  MakeAutosaveOptions,
} from './types'

// Never mutated — shared by every caller.
const inertInstance: AutosaveInstance = {
  autosave: async () => undefined,
  saveDraft: async () => false,
  getDraft: async () => undefined,
  restoreDraft: async () => false,
  discardDraft: () => undefined,
}

/**
 * The inert autosave surface used when the `autosave` module is not registered
 * — the `autosave` and `draft` props have no effect (with a one-time dev
 * warning when either is set) and the form context methods (`autosave`,
 * `saveDraft`, `getDraft`, `restoreDraft`, `discardDraft`) are no-ops.
 */
export const noopAutosave: AutosaveModule = {
  makeAutosave: (options: MakeAutosaveOptions) => {
    if (isDev()) {
      let warned = false

      watch(
        () => !!unref(options.autosave) || !!unref(options.draft),
        (value) => {
          if (!value || warned) return
          warned = true

          warn(
            'The `autosave` and `draft` props require the `autosave` module; register it via `createVueform({ modules: { autosave } })`.'
          )
        },
        { immediate: true }
      )
    }

    return inertInstance
  },
}
