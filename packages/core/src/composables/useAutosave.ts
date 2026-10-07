import { useFormContext } from '#src/contexts'
import {
  getAutosaveModule,
  type AutosaveInstance,
  type MakeAutosaveOptions,
} from '#src/modules/autosave'

import { useExpression } from './useExpression'

/**
 * Configuration options for the `useAutosave` composable — the form-specific
 * wiring options, with the context-dependent members (`form$`,
 * `resolveEndpoint`) resolved by the composable itself.
 */
export type UseAutosaveOptions = Omit<
  MakeAutosaveOptions,
  'form$' | 'resolveEndpoint'
>

/**
 * Wires a form's autosave behavior through the `autosave` module: remote saves
 * to `endpoint` on the configured events and interval (deferred while the form
 * is invalid unless `invalid: true`), and a `local` draft mirror that saves the
 * model to storage on every action, loads it back on mount, and clears it on
 * successful submit. Setup-only: throws when called outside a component setup
 * context. When the `autosave` module is not registered, its inert surface
 * takes over: the `autosave` prop has no effect (with a dev warning) and the
 * returned methods are no-ops.
 *
 * @private
 * @param options Form-specific autosave wiring options.
 */
export function useAutosave(options: UseAutosaveOptions): AutosaveInstance {
  const module = getAutosaveModule()
  const form$ = useFormContext()
  const expression = useExpression()

  return module.makeAutosave({
    ...options,
    form$,
    resolveEndpoint: (url) => expression.resolveIfAllowed('autosave', url),
  })
}
