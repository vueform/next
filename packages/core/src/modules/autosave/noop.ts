import { unref, watch } from 'vue'
import type {
  AutosaveInstance,
  AutosaveModule,
  MakeAutosaveOptions,
} from './types'
import { warn, isDev } from '#core/utils'

// Never mutated — shared by every caller.
const inertInstance: AutosaveInstance = {
  autosave: async () => undefined,
  clearAutosaved: () => undefined,
  loadAutosaved: async () => false,
}

/**
 * The inert autosave surface used when the `autosave` module is not registered
 * — the `autosave` prop has no effect (with a one-time dev warning when it is
 * set) and the form context methods (`autosave`, `clearAutosaved`,
 * `loadAutosaved`) are no-ops.
 */
export const noopAutosave: AutosaveModule = {
  makeAutosave: (options: MakeAutosaveOptions) => {
    if (isDev()) {
      let warned = false

      watch(
        () => unref(options.autosave),
        (value) => {
          if (!value || warned) return
          warned = true

          warn(
            'The `autosave` prop requires the `autosave` module; register it via `createVueform({ modules: { autosave } })`.'
          )
        },
        { immediate: true }
      )
    }

    return inertInstance
  },
}
