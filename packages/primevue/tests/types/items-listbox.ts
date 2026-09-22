/*
 * Compile-time assertions for PrimeVue VfListbox options → model inference.
 */
import {
  defineSchema,
  type ElementContextByPath,
  type SchemaToModel,
} from '@vueform/core'
import '@/components/VfListbox/unstyled'

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false
type Expect<T extends true> = T

defineSchema({
  bad: {
    type: 'listbox',
    options: [1, 2, 3],
    // @ts-expect-error string model with number options
    modelValue: 'foo',
  },
  good: {
    type: 'listbox',
    options: [1, 2, 3],
    modelValue: 1,
  },
  goodMulti: {
    type: 'listbox',
    options: [1, 2, 3],
    multiple: true,
    modelValue: [1, 2],
  },
})

const _modelSchema = defineSchema({
  single: {
    type: 'listbox',
    options: [1, 2, 3],
  },
  objs: {
    type: 'listbox',
    options: [
      { id: 1, label: 'A' },
      { id: 2, label: 'B' },
    ],
    optionValue: 'id',
  },
  multi: {
    type: 'listbox',
    options: [1, 2, 3],
    multiple: true,
  },
})

type Model = SchemaToModel<typeof _modelSchema>
type _single = Expect<Equal<Model['single'], 1 | 2 | 3 | null>>
type _objs = Expect<Equal<Model['objs'], 1 | 2 | null>>
type _multi = Expect<Equal<Model['multi'], (1 | 2 | 3)[]>>

type FindMulti = ElementContextByPath<typeof _modelSchema, 'multi'>
type _find = Expect<Equal<FindMulti['value'], (1 | 2 | 3)[]>>

type _all = _single | _objs | _multi | _find
void null as any as _all
