import { useFormContext } from '#src/contexts'
import {
  getAutosaveModule,
  type AutosaveInstance,
  type MakeAutosaveOptions,
} from '#src/modules/autosave'

import { useExpression } from './useExpression'

/**
 * Configuration options for the `useAutosave` composable.
 */
export type UseAutosaveOptions = Omit<
  MakeAutosaveOptions,
  'form$' | 'resolveEndpoint'
>

/**
 * Wires a form's autosave behavior through the `autosave` module: remote saves
 * on the configured events and interval, and a local draft mirror. Setup-only:
 * throws when called outside a component setup context.
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
