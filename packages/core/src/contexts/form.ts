import { useComponentContext } from '#src/contexts'
import { createContext } from '#src/helpers'
import type { FormContext } from '#src/types'

const [_useFormContext, provideFormContext] =
  createContext<FormContext>('vueform-form')

/**
 * Creates and provides the form context from the current component context.
 */
export function createFormContext(): FormContext {
  const form$ = useComponentContext() as FormContext

  provideFormContext(form$)

  return form$
}

/**
 * Injects the nearest ancestor form's context, providing access to form state,
 * submission, validation, and child elements.
 *
 * @context
 */
export function useFormContext(): FormContext | undefined {
  return _useFormContext()
}
