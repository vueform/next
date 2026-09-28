/**
 * Adapter-specific narrowing (type level): in this adapter, a select entry's
 * `items` keys narrow its own value props — a default outside the items must
 * not typecheck.
 */
import { defineSchema } from '@vueform/ui'
import { schema } from '../schema'

defineSchema({
  select: {
    ...schema.select,
    // @ts-expect-error the default must be one of the items' keys
    default: 'z',
  },
})

export {}
