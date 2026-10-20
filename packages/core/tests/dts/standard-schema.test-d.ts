/**
 * Type-level tests for the Standard Schema integration: `MatchesSchemaModel`
 * via `defineSchema` / `defineComputedSchema` / `useForm` / `useModel`
 * second/option arguments, and `RulesProp` accepting Standard Schemas. Run by
 * `pnpm test-dts`.
 */
import {
  defineComputedSchema,
  defineSchema,
  useForm,
  useModel,
  type FormSchema,
  type StandardSchemaV1,
} from '@vueform/core'
import { describe, test } from 'vitest'
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

describe('defineSchema — second argument type checking', () => {
  test('accepts compatible Standard Schemas', () => {
    // Input matching the model (text model is string | number | null —
    // nullability and the wider primitive union are tolerated).
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
  })

  test('rejects incompatible Standard Schemas', () => {
    // @ts-expect-error — input key `nam` does not exist in the model
    defineSchema({ name: { type: 'text' } }, wrongKey)

    // @ts-expect-error — input type `Date` is incompatible with the text model
    defineSchema({ name: { type: 'text' } }, wrongType)

    // @ts-expect-error — non-object input cannot match an object model
    defineSchema({ name: { type: 'text' } }, nonObjectInput)
  })
})

describe('defineComputedSchema — second argument type checking', () => {
  test('accepts matching and rejects mismatched Standard Schemas', () => {
    defineComputedSchema(() => ({ name: { type: 'text' } }), matching)

    // @ts-expect-error — input key `nam` does not exist in the model
    defineComputedSchema(() => ({ name: { type: 'text' } }), wrongKey)
  })
})

describe('useForm — validationSchema option type checking', () => {
  test('accepts a matching validationSchema (with extra props)', () => {
    useForm({ schema: { name: { type: 'text' } }, validationSchema: matching })

    useForm({
      schema: { name: { type: 'text' } },
      validationSchema: matching,
      id: 'register',
    })
  })

  test('rejects a mismatched validationSchema instead of silently falling back to the untyped overload', () => {
    // @ts-expect-error — input key `nam` does not exist in the model
    useForm({ schema: { name: { type: 'text' } }, validationSchema: wrongKey })

    // @ts-expect-error — input type `Date` is incompatible with the text model
    useForm({ schema: { name: { type: 'text' } }, validationSchema: wrongType })
  })

  test('ref/computed schemas are unwrapped and genuinely checked', () => {
    const computedSchema = defineComputedSchema(() => ({
      name: { type: 'text' },
    }))

    useForm({ schema: computedSchema, validationSchema: matching })

    // @ts-expect-error — input key `nam` does not exist in the model
    useForm({ schema: computedSchema, validationSchema: wrongKey })
  })

  test('record-map items produce literal-union models, checked like defineSchema', () => {
    useForm({
      schema: { country: { type: 'select', items: { us: 'US', de: 'DE' } } },
      validationSchema: z.object({ country: z.enum(['us', 'de']) }),
    })

    useForm({
      schema: { country: { type: 'select', items: { us: 'US', de: 'DE' } } },
      // @ts-expect-error — `string` is wider than the 'us' | 'de' literal model
      validationSchema: z.object({ country: z.string() }),
    })
  })

  test('array items widen to primitive models, so backend-typical inputs fit', () => {
    useForm({
      schema: { country: { type: 'select', items: ['us', 'de'] } },
      validationSchema: z.object({ country: z.string() }),
    })
  })

  test('dynamic and schema-less usage stays loose (vacuous check)', () => {
    useForm()
    useForm({})

    const dynamicSchema = {} as FormSchema
    useForm({ schema: dynamicSchema, validationSchema: wrongKey })
  })
})

describe('useModel — validationSchema option type checking', () => {
  test('accepts matching and rejects mismatched Standard Schemas', () => {
    useModel({ schema: { name: { type: 'text' } }, validationSchema: matching })

    useModel({
      schema: { name: { type: 'text' } },
      // @ts-expect-error — input key `nam` does not exist in the model
      validationSchema: wrongKey,
    })
  })
})

describe('real Zod schemas — inferred input types drive the same check', () => {
  test('accepts compatible Zod schemas', () => {
    // Nullability/optionality tolerance: text model is string | number | null.
    defineSchema(
      { name: { type: 'text' } },
      z.object({ name: z.string().min(3).nullable().optional() })
    )

    // Narrower input (enum) and partial coverage (extra model keys) are
    // allowed.
    defineSchema(
      { name: { type: 'text' }, other: { type: 'text' } },
      z.object({ name: z.enum(['a', 'b']) })
    )

    // Cross-field refinements keep the object input type.
    defineSchema(
      {
        password: { type: 'text' },
        confirm: { type: 'text' },
      },
      z
        .object({ password: z.string(), confirm: z.string() })
        .refine((data) => data.password === data.confirm)
    )
  })

  test('rejects incompatible Zod schemas', () => {
    // @ts-expect-error — Zod key `nam` does not exist in the model
    defineSchema({ name: { type: 'text' } }, z.object({ nam: z.string() }))

    // @ts-expect-error — Zod input `Date` is incompatible with the text model
    defineSchema({ name: { type: 'text' } }, z.object({ name: z.date() }))
  })
})

describe('RulesProp — Standard Schemas as element rules', () => {
  test('accepts Standard Schemas in all rules forms', () => {
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
  })
})
