/**
 * Type-level assertions for the Standard Schema integration:
 * `MatchesSchemaModel` via `defineSchema` / `defineComputedSchema` / `useForm`
 * / `useModel` second/option arguments, and `RulesProp` accepting Standard
 * Schemas. Validated by `pnpm tsc:types`.
 */
import { defineComputedSchema, defineSchema, useForm, useModel, type StandardSchemaV1 } from '@vueform/core'
import '@vueform/core/components'
import { z } from 'zod'

declare const matching: StandardSchemaV1<{ name: string }>
declare const narrower: StandardSchemaV1<{ name: 'a' | 'b' }>
declare const optionalKey: StandardSchemaV1<{ name?: string }>
declare const wrongKey: StandardSchemaV1<{ nam: string }>
declare const wrongType: StandardSchemaV1<{ name: Date }>
declare const untyped: StandardSchemaV1
declare const unionInput: StandardSchemaV1<{ name: string } | { other: number }>
declare const nonObjectInput: StandardSchemaV1<string>
declare const nested: StandardSchemaV1<{
  name: string
  address: { city: string }
  tags: string[]
}>

// ---------------------------------------------------------------------------
// defineSchema — second argument type checking
// ---------------------------------------------------------------------------

// Input matching the model (text model is string | number | null — nullability
// and the wider primitive union are tolerated).
defineSchema({ name: { type: 'text' } }, matching)

// Input narrower than the model (e.g. z.enum) is allowed.
defineSchema({ name: { type: 'text' } }, narrower)

// Optional input keys are tolerated (optionality is runtime's concern).
defineSchema({ name: { type: 'text' } }, optionalKey)

// Untyped Standard Schemas (unknown input) pass vacuously.
defineSchema({ name: { type: 'text' } }, untyped)

// Union inputs degrade gracefully (no per-key check).
defineSchema({ name: { type: 'text' } }, unionInput)

// Nested object + list models compare structurally.
defineSchema(
  {
    name: { type: 'text' },
    address: {
      type: 'group',
      nested: true,
      schema: { city: { type: 'text' } },
    },
    tags: { type: 'list', element: { type: 'text' } },
  },
  nested
)

// @ts-expect-error — input key `nam` does not exist in the model
defineSchema({ name: { type: 'text' } }, wrongKey)

// @ts-expect-error — input type `Date` is incompatible with the text model
defineSchema({ name: { type: 'text' } }, wrongType)

// @ts-expect-error — non-object input cannot match an object model
defineSchema({ name: { type: 'text' } }, nonObjectInput)

// ---------------------------------------------------------------------------
// defineComputedSchema — second argument type checking
// ---------------------------------------------------------------------------

defineComputedSchema(() => ({ name: { type: 'text' } }), matching)

// @ts-expect-error — input key `nam` does not exist in the model
defineComputedSchema(() => ({ name: { type: 'text' } }), wrongKey)

// ---------------------------------------------------------------------------
// useForm — validationSchema option type checking
// ---------------------------------------------------------------------------

useForm({ schema: { name: { type: 'text' } }, validationSchema: matching })

// Note: a mismatched validationSchema makes the typed overload inapplicable,
// so the call falls back to useForm's untyped overload without an error — the
// same pre-existing behavior as an invalid schema. Strict checking happens via
// defineSchema / defineComputedSchema / useModel.

// ---------------------------------------------------------------------------
// useModel — validationSchema option type checking
// ---------------------------------------------------------------------------

useModel({ name: { type: 'text' } }, undefined, matching)

useModel(
  { name: { type: 'text' } },
  undefined,
  // @ts-expect-error — input key `nam` does not exist in the model
  wrongKey
)

// ---------------------------------------------------------------------------
// Real Zod schemas — inferred input types drive the same check
// ---------------------------------------------------------------------------

// Nullability/optionality tolerance: text model is string | number | null.
defineSchema({ name: { type: 'text' } }, z.object({ name: z.string().min(3).nullable().optional() }))

// Narrower input (enum) and partial coverage (extra model keys) are allowed.
defineSchema({ name: { type: 'text' }, other: { type: 'text' } }, z.object({ name: z.enum(['a', 'b']) }))

// Cross-field refinements keep the object input type.
defineSchema(
  {
    password: { type: 'text' },
    confirm: { type: 'text' },
  },
  z.object({ password: z.string(), confirm: z.string() }).refine((data) => data.password === data.confirm)
)

// @ts-expect-error — Zod key `nam` does not exist in the model
defineSchema({ name: { type: 'text' } }, z.object({ nam: z.string() }))

// @ts-expect-error — Zod input `Date` is incompatible with the text model
defineSchema({ name: { type: 'text' } }, z.object({ name: z.date() }))

// ---------------------------------------------------------------------------
// RulesProp — Standard Schemas as element rules
// ---------------------------------------------------------------------------

defineSchema({
  name: { type: 'text', rules: matching },
  email: { type: 'text', rules: ['required', nonObjectInput] },
  company: {
    type: 'text',
    rules: { rules: matching, $if: [['type', '==', 'business']] },
  },
  title: {
    type: 'text',
    translate: true,
    rules: {
      en: { rules: matching, $if: [['type', '==', 'business']] },
      de: { rules: 'required', $if: [['type', '==', 'business']] },
    },
  },
})

export {}
