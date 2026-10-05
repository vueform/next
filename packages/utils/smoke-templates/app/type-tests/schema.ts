/**
 * defineSchema (type level): valid schemas are accepted const-narrowed, unknown
 * element types and wrong prop value types are rejected, and `items` narrows
 * the entry's own value props. Negative cases spread the canonical schema's
 * entries, so nothing here hardcodes adapter type strings. (Excess/unknown
 * props are currently accepted by design — several entry props take passthrough
 * values — so there is no excess-prop assertion.)
 */
import { defineSchema } from '../adapter'
import { schema } from '../schema'
import type { Equal, Expect } from './helpers'

const _ok = defineSchema({
  text: { ...schema.text },
  select: { ...schema.select },
})

// The schema stays const-narrowed (no widening to string).
type _ConstType = Expect<
  Equal<(typeof _ok)['text']['type'], (typeof schema)['text']['type']>
>

defineSchema({
  bad: {
    // @ts-expect-error 'teleporter' is not a registered element type
    type: 'teleporter',
  },
})

// A known prop with a wrong value type is rejected (the error lands on the
// whole schema argument via ExactValidatedSchema).
// @ts-expect-error rules must not be a number
defineSchema({
  text: { ...schema.text, rules: 123 },
})

// Adapter-specific narrowing assertions (e.g. items keys narrowing the
// select's default in the ui adapter) live in the adapter's own
// tests/smoke/shared/type-tests/ fragments.
