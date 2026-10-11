import { useDate } from '#src/composables'
import { createRule } from '#src/helpers'

export const date = createRule('date', (value, ctx) =>
  useDate(value, undefined, ctx.vueform).isValid()
)
