import { createRule } from '#src/helpers'

/**
 * Marks the field as nullable, skipping other validation rules when the value
 * is empty.
 *
 * @category Presence
 * @related filled, required
 */
export const nullable = createRule('nullable', () => true)
