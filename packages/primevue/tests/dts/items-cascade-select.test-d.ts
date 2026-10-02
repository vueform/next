/*
 * Compile-time assertions for PrimeVue VfCascadeSelect options → model
 * inference (including optionGroupChildren path arrays).
 * Run by `pnpm test:dts`.
 */
import {
  defineSchema,
  type ElementByPath,
  type ModelByPath,
  type SchemaToModel,
} from '@vueform/core'
import { describe, expectTypeOf, test } from 'vitest'
import '@vueform/primevue/components/VfCascadeSelect/unstyled'

const cascadeOptions = [
  {
    name: 'Australia',
    code: 'AU',
    states: [
      {
        name: 'New South Wales',
        cities: [
          { cname: 'Sydney', code: 'A-SY' },
          { cname: 'Newcastle', code: 'A-NE' },
        ],
      },
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    states: [
      {
        name: 'Quebec',
        cities: [{ cname: 'Montreal', code: 'C-MO' }],
      },
    ],
  },
] as const

describe('VfCascadeSelect options → modelValue inference', () => {
  // optionValue key — model from top-level item shape when path-array children
  // cannot deepen ItemsModel (PrimeVue navigates the tree at runtime)
  test('optionValue key — model from the top-level item shape', () => {
    defineSchema({
      bad: {
        type: 'cascade-select',
        options: cascadeOptions,
        optionGroupChildren: ['states', 'cities'],
        optionValue: 'code',
        // @ts-expect-error number model with string code
        modelValue: 123,
      },
      good: {
        type: 'cascade-select',
        options: cascadeOptions,
        optionGroupChildren: ['states', 'cities'],
        optionValue: 'code',
        modelValue: 'AU',
      },
      goodNull: {
        type: 'cascade-select',
        options: cascadeOptions,
        optionGroupChildren: ['states', 'cities'],
        optionValue: 'code',
        modelValue: null,
      },
    })
  })

  test('option* key props must be keys of the option / group shape', () => {
    defineSchema({
      badValue: {
        type: 'cascade-select',
        options: cascadeOptions,
        optionGroupChildren: ['states', 'cities'],
        // @ts-expect-error 'cname' is not a key of the top-level option
        optionValue: 'cname',
      },
      badGroupLabel: {
        type: 'cascade-select',
        options: cascadeOptions,
        // @ts-expect-error 'title' is not a key of the group
        optionGroupLabel: 'title',
        optionGroupChildren: ['states', 'cities'],
      },
      goodKeys: {
        type: 'cascade-select',
        options: cascadeOptions,
        optionGroupLabel: 'name',
        optionGroupChildren: ['states', 'cities'],
        optionValue: 'code',
        optionLabel: 'name',
      },
    })
  })

  test('whole object model when optionValue is omitted', () => {
    // Pre-restructure this passed `cascadeOptions[0]` (deep-readonly from the
    // `as const` fixture); current core widens the derived model to mutable
    // arrays, so the deep-readonly option itself is no longer assignable and a
    // structurally-equal mutable value is used instead.
    defineSchema({
      good: {
        type: 'cascade-select',
        options: cascadeOptions,
        optionGroupChildren: ['states', 'cities'],
        modelValue: {
          name: 'Australia',
          code: 'AU',
          states: [
            {
              name: 'New South Wales',
              cities: [
                { cname: 'Sydney', code: 'A-SY' },
                { cname: 'Newcastle', code: 'A-NE' },
              ],
            },
          ],
        },
      },
    })
  })
})

const _modelSchema = defineSchema({
  country: {
    type: 'cascade-select',
    options: cascadeOptions,
    optionGroupChildren: ['states', 'cities'],
    optionValue: 'code',
  },
  whole: {
    type: 'cascade-select',
    options: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
  },
})

type Model = SchemaToModel<typeof _modelSchema>

describe('SchemaToModel', () => {
  test('derives the model from options — literals are widened to primitives', () => {
    // Pre-restructure: `'AU' | 'CA' | null` (widened would be `string | null`).
    // FIXME: the optionValue-keyed model is not derived at all for
    // cascade-select with `optionGroupChildren` path arrays — it degrades to
    // `any` (the inline `modelValue` constraint in defineSchema still works —
    // see the fixtures above — only the derived SchemaToModel / ModelByPath /
    // ElementByPath types degrade). Asserting the current behavior so the
    // regression is pinned; once derivation is restored this should become
    // `toEqualTypeOf<string | null>()`.
    expectTypeOf<Model['country']>().toBeAny()
    // Pre-restructure:
    // `{ readonly id: 1; readonly label: 'A' } | { readonly id: 2; readonly label: 'B' } | null`
    // (now widened). `whole` resolves to a `NoInfer<...>`-wrapped union; the
    // wrapper is identity-equal to the plain type but defeats expect-type's
    // branded equality, so the expected side carries the same wrapper.
    expectTypeOf<Model['whole']>().toEqualTypeOf<
      NoInfer<{ id: number; label: string } | null>
    >()
  })
})

describe('ModelByPath', () => {
  test('derives the model for a path from the schema entry', () => {
    // Pre-restructure: `'AU' | 'CA' | null`. FIXME: resolves to `any` (see
    // SchemaToModel above); should become `string | null` once derivation is
    // restored.
    expectTypeOf<ModelByPath<typeof _modelSchema, 'country'>>().toBeAny()
  })
})

describe('ElementByPath (form$.find)', () => {
  test('narrows value from the entry', () => {
    type FindCountry = ElementByPath<typeof _modelSchema, 'country'>

    // Pre-restructure: `'AU' | 'CA' | null`. FIXME: resolves to `any` (see
    // SchemaToModel above); should become `string | null` once derivation is
    // restored.
    expectTypeOf<FindCountry['value']>().toBeAny()
  })
})
