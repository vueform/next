import { useDate } from '@core/composables'
import { createRule } from '@core/helpers'

export const date = createRule('date', (value, ctx) =>
  useDate(value, undefined, ctx.vueform).isValid()
)
