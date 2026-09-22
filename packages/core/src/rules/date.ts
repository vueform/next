import { useDate } from '~/composables'
import { createRule } from '~/helpers'

export const date = createRule('date', (value, ctx) =>
  useDate(value, undefined, ctx.vueform).isValid()
)
