import { defineSchema } from '@vueform/ui'

const valid = defineSchema({
  select: {
    type: 'select',
    items: { a: 'A', b: 'B' },
    default: 'a',
  },
})

defineSchema({
  select: {
    ...valid.select,
    // @ts-expect-error the default must be one of the items' keys
    default: 'z',
  },
})
