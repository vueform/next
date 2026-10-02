<script setup lang="ts">
/**
 * Vue-level items → model / key-prop inference cases for VfSelect. Validated by
 * `pnpm test:dts` (vue-sfc.test.ts typechecks the SFCs and reports each ✅/❌
 * case as a named test). Failures use `@vue-expect-error`.
 */
import '@vueform/core/components'
import VfSelect from '@vueform/core/components/VfSelect'
import { ref } from 'vue'

type Item8 = { value: string | number; label: string }
type Item15 = { value: string | number; label: string }

const i1 = ['foo', 123]
const i2 = ['foo', 'baz'] as const
const i3 = { foo: 'Foo', 3: 'Bar' } as Record<string | number, string>
const i4 = { foo: 'Foo', 3: 'Bar' }
const i5 = [{ value: 'foo', label: 'Foo' }] as Record<string, string>[]
const i6 = [{ value: 'foo', label: 'Foo' }] as Record<string, string | number>[]
// prettier-ignore
const i7 = [{ value: 'foo', label: 'Foo' }, { value: 123, label: 'Bar' }]
// prettier-ignore
const i8: Item8[] = [{ value: 'foo', label: 'Foo' }, { value: 123, label: 'Bar' }]
const i9 = [{ value: 'foo', label: 'Foo' }] as Record<string, string | number>[]
// prettier-ignore
const i10 = [{ value: 'foo', label: 'Foo', disabled: true, conditions: '' }]
// prettier-ignore
const i12 = [{ label: 'Foo', items: [{ value: 'foo', label: 'Foo' }] }] as { label: string; items: Record<string, string>[] }[]
// prettier-ignore
const i13 = [{ label: 'Foo', items: [{ value: 'foo', label: 'Foo' }] }] as { label: string; items: Record<string, string | number>[] }[]
// prettier-ignore
const i14 = [{ label: 'Foo', items: [{ value: 'foo', label: 'Foo' }, { value: 123, label: 'Bar' }] }]
// prettier-ignore
const i15: { label: string; items: Item15[] }[] = [{ label: 'Foo', items: [{ value: 'foo', label: 'Foo' }, { value: 123, label: 'Bar' }] }]
// prettier-ignore
const i16 = [{ label: 'Foo', conditions: '', items: [{ id: 123, name: 'Foo', if: '', on: false }] }]

const v1a = ref('foo')
const v1b = ref(123)
const v1c = ref(true)
const v2a = ref<'foo' | 'baz' | null | undefined>('foo')
const v2b = ref('foo')
const v3a = ref('foo')
const v3b = ref<string | number>(123)
const v3c = ref(true)
const v4a = ref<'foo' | 3 | null | undefined>('foo')
const v4b = ref('foo')
const v5a = ref({ bar: 'bar' })
const v5b = ref('bar')
const v6a = ref(123)
const v6b = ref(true)
const v6c = ref(123)
const v6d = ref('foo')
const v7a = ref({ value: 123, label: 'Bar', bar: 'Bar' })
const v7b = ref({ value: true, label: 'Bar', bar: 'Bar' })
const v8a = ref(123)
const v8b = ref(true)
const v8d = ref(123)
const v8e = ref(true)
const v8f = ref(123)
const v8g = ref('foo')
const v8h = ref(123)
const v8i = ref('foo')
const v8j = ref(123)

const v12a = ref({ bar: 'bar' })
const v12b = ref('bar')
const v13a = ref(123)
const v13b = ref(true)
const v13c = ref(123)
const v13d = ref('foo')
const v14a = ref({ value: 123, label: 'Bar', bar: 'Bar' })
const v14b = ref({ value: true, label: 'Bar', bar: 'Bar' })
const v15a = ref(123)
const v15b = ref(true)
const v15d = ref(123)
const v15e = ref(true)
const v15f = ref(123)
const v15g = ref('foo')
const v15h = ref(123)
const v15i = ref('foo')
const v15j = ref(123)

const i17 = '/endpoint'
const i18 = () => [{ value: 'foo', label: 'Foo' }]
const i19 = async () => {
  await new Promise((resolve) => setTimeout(() => resolve([]), 0))
  return [{ value: 'foo', label: 'Foo' }]
}
const i20 = [{ value: 'foo', label: 'Foo' }]

const d17a = ref({ value: 'value' })
const d17b = ref('value')

const v17a = ref({ value: 'value' })
const v17b = ref({ value: 'value' })
const v17c = ref('value')
const v18a = ref({ value: 'bar', label: 'Bar', bar: 'bar' })
const v18b = ref('value')
const v19a = ref({ value: 'bar', label: 'Bar', bar: 'bar' })
const v19b = ref('value')
// prettier-ignore
const v20a = ref([{ value: 'foo', label: 'Foo', foo: 'foo'}, { value: 'bar', label: 'Bar', bar: 'bar'}])
const v20b = ref({ value: 'bar', label: 'Bar', bar: 'bar' })
const v20c = ref([{ value: 123, label: 'Foo' }])
</script>

<template>
  <!-- ============================================================ -->
  <!-- Primitive arrays                                             -->
  <!-- ============================================================ -->

  <!-- ✅: model matches loose type of string -->
  <VfSelect name="s1a" :items="i1" v-model="v1a" :default="v1a" />

  <!-- ✅: model matches loose type of number -->
  <VfSelect name="s1b" :items="i1" v-model="v1b" :default="v1b" />

  <!-- ❌: model does not match loose type -->
  <!-- @vue-expect-error -->
  <VfSelect name="s1c" :items="i1" v-model="v1c" :default="v1c" />

  <!-- ✅: not key props -->
  <VfSelect name="s1d" :items="i1" />

  <!-- ❌: item-value is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s1e" :items="i1" item-value="value" />

  <!-- ❌: item-label is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s1f" :items="i1" item-label="value" />

  <!-- ❌: item-disabled is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s1g" :items="i1" item-disabled="disabled" />

  <!-- ❌: item-conditions is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s1h" :items="i1" item-conditions="conditions" />

  <!-- ❌: group-label is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s1i" :items="i1" group-label="label" />

  <!-- ❌: group-children is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s1j" :items="i1" group-children="items" />

  <!-- ❌: group-conditions is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s1k" :items="i1" group-conditions="items" />

  <!-- ✅: and model matches -->
  <VfSelect name="s2a" :items="i2" v-model="v2a" :default="v2a" />

  <!-- ❌: and model is too loose -->
  <!-- @vue-expect-error -->
  <VfSelect name="s2b" :items="i2" v-model="v2b" :default="v2b" />

  <!-- ============================================================ -->
  <!-- Object maps                                                  -->
  <!-- ============================================================ -->

  <!-- ✅: model matches loose type of string -->
  <VfSelect name="s3a" :items="i3" v-model="v3a" :default="v3a" />

  <!-- ✅: model matches loose type of number -->
  <VfSelect name="s3b" :items="i3" v-model="v3b" :default="v3b" />

  <!-- ❌: model does not match loose type -->
  <!-- @vue-expect-error -->
  <VfSelect name="s3c" :items="i3" v-model="v3c" :default="v3c" />

  <!-- ✅: no key props -->
  <VfSelect name="s3d" :items="i3" />

  <!-- ❌: item-value is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s3e" :items="i3" item-value="value" />

  <!-- ❌: item-label is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s3f" :items="i3" item-label="value" />

  <!-- ❌: item-disabled is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s3g" :items="i3" item-disabled="disabled" />

  <!-- ❌: item-conditions is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s3h" :items="i3" item-conditions="conditions" />

  <!-- ❌: group-label is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s3i" :items="i3" group-label="label" />

  <!-- ❌: group-children is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s3j" :items="i3" group-children="items" />

  <!-- ❌: group-conditions is defined -->
  <!-- @vue-expect-error -->
  <VfSelect name="s3k" :items="i3" group-conditions="items" />

  <!-- ✅: model matches -->
  <VfSelect name="s4a" :items="i4" v-model="v4a" :default="v4a" />

  <!-- ❌: model is too loose -->
  <!-- @vue-expect-error -->
  <VfSelect name="s4b" :items="i4" v-model="v4b" :default="v4b" />

  <!-- ============================================================ -->
  <!-- Arrays of loose objects — unset itemValue                    -->
  <!-- ============================================================ -->

  <!-- ✅: model shape loosely matches -->
  <VfSelect name="s5a" :items="i5" v-model="v5a" :default="v5a" />

  <!-- ❌: model shape is not an object -->
  <!-- @vue-expect-error -->
  <VfSelect name="s5b" :items="i5" v-model="v5b" :default="v5b" />

  <!-- ============================================================ -->
  <!-- Arrays of loose objects — itemValue is set                   -->
  <!-- ============================================================ -->

  <!-- ✅: item-value is string and model matches any of the loose object values shape -->
  <VfSelect name="s6a" :items="i6" v-model="v6a" :default="v6a" item-value="any" />

  <!-- ❌: item-value is string and model does not match any of the loose object values shape -->
  <!-- @vue-expect-error -->
  <VfSelect name="s6b" :items="i6" v-model="v6b" :default="v6b" item-value="any" />

  <!-- ✅: item-value is function returning number and model matches it -->
  <VfSelect name="s6c" :items="i6" v-model="v6c" :default="v6c" :item-value="() => 123" />

  <!-- ❌: item-value is function returning number and model does not match it -->
  <!-- @vue-expect-error -->
  <VfSelect name="s6d" :items="i6" v-model="v6d" :default="v6d" :item-value="() => 123" />

  <!-- ============================================================ -->
  <!-- Arrays of strict objects — unset itemValue                   -->
  <!-- ============================================================ -->

  <!-- ✅: model matches -->
  <VfSelect name="s7a" :items="i7" v-model="v7a" :default="v7a" />

  <!-- ❌: model does not match -->
  <!-- @vue-expect-error -->
  <VfSelect name="s7b" :items="i7" v-model="v7b" :default="v7b" />

  <!-- ============================================================ -->
  <!-- Arrays of strict objects — itemValue is set                  -->
  <!-- ============================================================ -->

  <!-- ✅: item-value is a valid string that model matches -->
  <VfSelect name="s8a" :items="i8" v-model="v8a" :default="v8a" item-value="value" />

  <!-- ❌: item-value is a valid string that model does not match -->
  <!-- @vue-expect-error -->
  <VfSelect name="s8b" :items="i8" v-model="v8b" :default="v8b" item-value="value" />

  <!-- ❌: item-value is an invalid string  -->
  <!-- @vue-expect-error -->
  <VfSelect name="s8c" :items="i8" item-value="not_value" />

  <!-- ✅: item-value is an annotated function returning value and model matches -->
  <VfSelect name="s8d" :items="i8" v-model="v8d" :default="v8d" :item-value="(item: Item8) => item.value" />

  <!-- ❌: item-value is an annotated function returning value and model does not match -->
  <!-- @vue-expect-error -->
  <VfSelect name="s8e" :items="i8" v-model="v8e" :default="v8e" :item-value="(item: Item8) => item.value" />

  <!-- ❌: item-value is a non-annoted function returning value but model matches -->
  <!-- @vue-expect-error -->
  <VfSelect name="s8f" :items="i8" v-model="v8f" :default="v8f" :item-value="(item) => item.value" />

  <!-- ✅: item-value is function with any item and returns type that model matches -->
  <VfSelect name="s8g" :items="i8" v-model="v8g" :default="v8g" :item-value="(i: any): string => (i ? 'foo' : 'bar')" />

  <!-- ✅: item-value is function with any item and returns type that model does not match -->
  <!-- @vue-expect-error -->
  <VfSelect name="s8h" :items="i8" v-model="v8h" :default="v8h" :item-value="(i: any): string => (i ? 'foo' : 'bar')" />

  <!-- ✅: item-value is function with unknown item and returns type that model matches -->
  <VfSelect name="s8i" :items="i8" v-model="v8i" :default="v8i" :item-value="(i: unknown) => (i && typeof i === 'object' && 'value' in i && typeof i.value === 'string' ? i.value : undefined)" />

  <!-- ✅: item-value is function with unknown item and returns type that model does not match -->
  <!-- @vue-expect-error -->
  <VfSelect name="s8j" :items="i8" v-model="v8j" :default="v8j" :item-value="(i: unknown) => (i && typeof i === 'object' && 'value' in i && typeof i.value === 'string' ? i.value : undefined)" />

  <!-- ============================================================ -->
  <!-- Arrays of loose objects — key props                          -->
  <!-- ============================================================ -->

  <!-- ✅: item-label is any string prop -->
  <VfSelect name="s9a" :items="i9" item-label="any" />

  <!-- ✅: item-disabled is any string prop -->
  <VfSelect name="s9b" :items="i9" item-disabled="any" />

  <!-- ✅: item-conditions is any string prop -->
  <VfSelect name="s9c" :items="i9" item-conditions="any" />

  <!-- ✅: group-label is any string prop -->
  <VfSelect name="s9d" :items="i9" group-label="any" />

  <!-- ✅: group-children is any string prop -->
  <VfSelect name="s9f" :items="i9" group-children="any" />

  <!-- ✅: group-conditions is any string prop -->
  <VfSelect name="s9g" :items="i9" group-conditions="any" />

  <!-- ============================================================ -->
  <!-- Arrays of strict objects — item key props                    -->
  <!-- ============================================================ -->

  <!-- ✅: item-label is valid string prop -->
  <VfSelect name="s10a" :items="i10" item-label="label" />

  <!-- ❌: item-label is invalid string prop -->
  <!-- @vue-expect-error -->
  <VfSelect name="s10a" :items="i10" item-label="any" />

  <!-- ✅: item-disabled is valid string prop -->
  <VfSelect name="s10b" :items="i10" item-disabled="disabled" />

  <!-- ❌: item-disabled is invalid string prop -->
  <!-- @vue-expect-error -->
  <VfSelect name="s10b" :items="i10" item-disabled="any" />

  <!-- ✅: item-conditions is valid string prop -->
  <VfSelect name="s10c" :items="i10" item-conditions="conditions" />

  <!-- ❌: item-conditions is invalid string prop -->
  <!-- @vue-expect-error -->
  <VfSelect name="s10c" :items="i10" item-conditions="any" />

  <!-- ============================================================ -->
  <!-- Grouped arrays of loose objects — unset itemValue            -->
  <!-- ============================================================ -->

  <!-- ✅: model shape loosely matches -->
  <VfSelect name="s12a" :items="i12" group-label="label" group-children="items" v-model="v12a" :default="v12a" />

  <!-- ❌: model shape is not an object -->
  <!-- @vue-expect-error -->
  <VfSelect name="s12b" :items="i12" group-label="label" group-children="items" v-model="v12b" :default="v12b" />

  <!-- ============================================================ -->
  <!-- Grouped arrays of loose objects — itemValue is set           -->
  <!-- ============================================================ -->

  <!-- ✅: item-value is string and model matches any of the loose object values shape -->
  <VfSelect name="s13a" :items="i13" group-label="label" group-children="items" v-model="v13a" :default="v13a" item-value="any" />

  <!-- ❌: item-value is string and model does not match any of the loose object values shape -->
  <!-- @vue-expect-error -->
  <VfSelect name="s13b" :items="i13" group-label="label" group-children="items" v-model="v13b" :default="v13b" item-value="any" />

  <!-- ✅: item-value is function returning number and model matches it -->
  <VfSelect name="s13c" :items="i13" group-label="label" group-children="items" v-model="v13c" :default="v13c" :item-value="() => 123" />

  <!-- ❌: item-value is function returning number and model does not match it -->
  <!-- @vue-expect-error -->
  <VfSelect name="s13d" :items="i13" group-label="label" group-children="items" v-model="v13d" :default="v13d" :item-value="() => 123" />

  <!-- ============================================================ -->
  <!-- Grouped arrays of strict objects — unset itemValue           -->
  <!-- ============================================================ -->

  <!-- ✅: model matches -->
  <VfSelect name="s14a" :items="i14" group-label="label" group-children="items" v-model="v14a" :default="v14a" />

  <!-- ❌: model does not match -->
  <!-- @vue-expect-error -->
  <VfSelect name="s14b" :items="i14" group-label="label" group-children="items" v-model="v14b" :default="v14b" />

  <!-- ============================================================ -->
  <!-- Grouped arrays of strict objects — itemValue is set          -->
  <!-- ============================================================ -->

  <!-- ✅: item-value is a valid string that model matches -->
  <VfSelect name="s15a" :items="i15" group-label="label" group-children="items" v-model="v15a" :default="v15a" item-value="value" />

  <!-- ❌: item-value is a valid string that model does not match -->
  <!-- @vue-expect-error -->
  <VfSelect name="s15b" :items="i15" group-label="label" group-children="items" v-model="v15b" :default="v15b" item-value="value" />

  <!-- ❌: item-value is an invalid string  -->
  <!-- @vue-expect-error -->
  <VfSelect name="s15c" :items="i15" group-label="label" group-children="items" item-value="not_value" />

  <!-- ✅: item-value is an annotated function returning value and model matches -->
  <VfSelect name="s15d" :items="i15" group-label="label" group-children="items" v-model="v15d" :default="v15d" :item-value="(item: Item15) => item.value" />

  <!-- ❌: item-value is an annotated function returning value and model does not match -->
  <!-- @vue-expect-error -->
  <VfSelect name="s15e" :items="i15" group-label="label" group-children="items" v-model="v15e" :default="v15e" :item-value="(item: Item15) => item.value" />

  <!-- ❌: item-value is a non-annoted function returning value but model matches -->
  <!-- @vue-expect-error -->
  <VfSelect name="s15f" :items="i15" group-label="label" group-children="items" v-model="v15f" :default="v15f" :item-value="(item) => item.value" />

  <!-- ✅: item-value is function with any item and returns type that model matches -->
  <VfSelect name="s15g" :items="i15" group-label="label" group-children="items" v-model="v15g" :default="v15g" :item-value="(i: any): string => (i ? 'foo' : 'bar')" />

  <!-- ✅: item-value is function with any item and returns type that model does not match -->
  <!-- @vue-expect-error -->
  <VfSelect name="s15h" :items="i15" group-label="label" group-children="items" v-model="v15h" :default="v15h" :item-value="(i: any): string => (i ? 'foo' : 'bar')" />

  <!-- ✅: item-value is function with unknown item and returns type that model matches -->
  <VfSelect name="s15i" :items="i15" group-label="label" group-children="items" v-model="v15i" :default="v15i" :item-value="(i: unknown) => (i && typeof i === 'object' && 'value' in i && typeof i.value === 'string' ? i.value : undefined)" />

  <!-- ✅: item-value is function with unknown item and returns type that model does not match -->
  <!-- @vue-expect-error -->
  <VfSelect name="s15j" :items="i15" group-label="label" group-children="items" v-model="v15j" :default="v15j" :item-value="(i: unknown) => (i && typeof i === 'object' && 'value' in i && typeof i.value === 'string' ? i.value : undefined)" />

  <!-- ============================================================ -->
  <!-- Arrays of strict objects — group key props                   -->
  <!-- ============================================================ -->

  <!-- ✅: group-label is valid string prop -->
  <VfSelect name="s16a" :items="i16" group-label="label" />

  <!-- ❌: group-label is invalid string prop -->
  <!-- @vue-expect-error -->
  <VfSelect name="s16b" :items="i16" group-label="any" />

  <!-- ✅: group-children is valid string prop -->
  <VfSelect name="s16c" :items="i16" group-children="items" />

  <!-- ❌: group-children is invalid string prop -->
  <!-- @vue-expect-error -->
  <VfSelect name="s16d" :items="i16" group-children="any" />

  <!-- ✅: group-conditions is valid string prop -->
  <VfSelect name="s16e" :items="i16" group-conditions="conditions" />

  <!-- ❌: group-conditions is invalid string prop -->
  <!-- @vue-expect-error -->
  <VfSelect name="s16f" :items="i16" group-conditions="any" />

  <!-- ✅: item-label is valid string prop -->
  <VfSelect name="s16g" :items="i16" group-children="items" item-label="name" />

  <!-- ❌: item-label is invalid string prop -->
  <!-- @vue-expect-error -->
  <VfSelect name="s16h" :items="i16" group-children="items" item-label="any" />

  <!-- ✅: item-disabled is valid string prop -->
  <VfSelect name="s16i" :items="i16" group-children="items" item-disabled="on" />

  <!-- ❌: item-disabled is invalid string prop -->
  <!-- @vue-expect-error -->
  <VfSelect name="s16j" :items="i16" group-children="items" item-disabled="any" />

  <!-- ✅: item-conditions is valid string prop -->
  <VfSelect name="s16k" :items="i16" group-children="items" item-conditions="if" />

  <!-- ❌: item-conditions is invalid string prop -->
  <!-- @vue-expect-error -->
  <VfSelect name="s16l" :items="i16" group-children="items" item-conditions="any" />

  <!-- ============================================================ -->
  <!-- Endpoint                                                     -->
  <!-- ============================================================ -->

  <!-- ✅: model defines shape -->
  <VfSelect name="s17a" :items="i17" v-model="v17a" :default="d17a" @change="(n, o) => n.value && o.value" />

  <!-- ❌: default does not match model shape -->
  <!-- @vue-expect-error -->
  <VfSelect name="s17a" :items="i17" v-model="v17b" :default="d17b" />

  <!-- ✅: @change args are wide (SelectEmits); modelValue stays items-aware -->
  <VfSelect name="s17c" :items="i17" v-model="v17c" @change="(n, o) => n.value && o.value" />

  <!-- ============================================================ -->
  <!-- Function                                                     -->
  <!-- ============================================================ -->

  <!-- ✅: model matches items return shape -->
  <VfSelect name="s18a" :items="i18" v-model="v18a" :default="v18a" @change="(n, o) => n?.value && o?.value" />

  <!-- ❌: model does not match items return shape -->
  <!-- @vue-expect-error -->
  <VfSelect name="s18b" :items="i18" v-model="v18b" :default="v18b" />

  <!-- ============================================================ -->
  <!-- Async Function                                               -->
  <!-- ============================================================ -->

  <!-- ✅: model matches items return shape -->
  <VfSelect name="s19a" :items="i19" v-model="v19a" :default="v19a" @change="(n, o) => n?.value && o?.value" />

  <!-- ❌: model does not match items return shape -->
  <!-- @vue-expect-error -->
  <VfSelect name="s19b" :items="i19" v-model="v19b" :default="v19b" />

  <!-- ============================================================ -->
  <!-- Multiple                                                 -->
  <!-- ============================================================ -->

  <!-- ✅: model is an array of the value type -->
  <VfSelect name="s20a" :items="i20" multiple v-model="v20a" :default="v20a" />

  <!-- ❌: model is a single value -->
  <!-- @vue-expect-error -->
  <VfSelect name="s20b" :items="i20" multiple v-model="v20b" :default="v20b" />

  <!-- ❌: model has wrong object shape -->
  <!-- @vue-expect-error -->
  <VfSelect name="s20c" :items="i20" multiple v-model="v20c" :default="v20c" />

  <!-- option slot receives ResolvedItem -->
  <VfSelect name="s21a" :items="[1, 2, 3] as const">
    <template #option="p">
      {{ p.item.value satisfies 1 | 2 | 3 }}
    </template>
  </VfSelect>
  <VfSelect
    name="s21b"
    :items="
      [
        { id: 1, label: 'A' },
        { id: 2, label: 'B' },
      ] as const
    "
    item-value="id"
  >
    <template #option="p">
      {{ p.item.value satisfies 1 | 2 }}
      {{ p.item.$raw?.id satisfies 1 | 2 | undefined }}
    </template>
  </VfSelect>
</template>
