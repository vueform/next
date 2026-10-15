import type { ShallowReactive } from 'vue'

/**
 * Represents a tracked form instance in the devtools registry.
 */
export interface TrackedForm {
  uid: string
  name: string | undefined
  elements$: ShallowReactive<Map<string, any>>
  invalid: boolean
  errors: Record<string, string[]>
}

/**
 * Global registry of all mounted Vueform form instances.
 */
const FORMS = new Map<string, any>()

let refreshCallback: (() => void) | undefined

/**
 * Registers a form context for DevTools tracking.
 *
 * @param uid The form's unique identifier.
 * @param context The form's component context.
 */
export function registerForm(uid: string, context: any) {
  FORMS.set(uid, context)
  refreshCallback?.()
}

/**
 * Unregisters a form context from DevTools tracking.
 *
 * @param uid The form's unique identifier.
 */
export function unregisterForm(uid: string) {
  FORMS.delete(uid)
  refreshCallback?.()
}

/**
 * Returns the global form registry map.
 */
export function getForms() {
  return FORMS
}

/**
 * Sets the callback to invoke when the registry changes.
 *
 * @param cb The refresh callback.
 */
export function onRegistryChange(cb: () => void) {
  refreshCallback = cb
}
