import { createRule } from '@core/helpers'

/**
 * Marks the field as nullable, skipping other validation rules when the value
 * is empty.
 */
export const nullable = createRule('nullable', () => true)
