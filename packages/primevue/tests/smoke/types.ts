import { defineSchema } from '@vueform/primevue'

const valid = defineSchema({
  select: {
    type: 'select',
    options: { a: 'A', b: 'B' },
    default: 'a',
  },
})

defineSchema({
  select: {
    ...valid.select,
    // @ts-expect-error the default must be one of the options' keys
    default: 'z',
  },
})
