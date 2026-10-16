import { useDate } from '#src/composables'
import { createRule } from '#src/helpers'

/**
 * Validates that the value is a valid date, parsed with the configured
 * date adapter.
 *
 * @category Type
 * @related date_format, after, before
 */
export const date = createRule('date', (value, ctx) =>
  useDate(value, undefined, ctx.vueform).isValid()
)
