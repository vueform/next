<script setup lang="ts">
/**
 * Vue-level VfSelect typing (generics, events, slots, prop callbacks, classes /
 * parts). Validated by `pnpm test:dts` (vue-sfc.test.ts typechecks the SFCs and
 * reports each ✅/❌ case as a named test). Failures use `@vue-expect-error`.
 */
import '@vueform/core/components'
import VfSelect from '@vueform/core/components/VfSelect'
import { ref } from 'vue'

const items = [
  { id: 1, label: 'A', foo: () => {} },
  { id: 2, label: 'B', foo: () => {} },
] as const

const modelId = ref<1 | 2 | null>(1)
const modelWrong = ref('nope')
const modelMulti = ref<(1 | 2)[]>([1])
const modelMultiWrong = ref(1)
const defaultId = ref<1 | 2 | null>(2)
</script>

<template>
  <!-- ============================================================ -->
  <!-- Generics — modelValue / default / multiple                     -->
  <!-- ============================================================ -->

  <!-- ✅: model matches itemValue -->
  <VfSelect name="modelOk" :items="items" item-value="id" v-model="modelId" :default="defaultId" />

  <!-- ❌: model does not match itemValue -->
  <!-- @vue-expect-error -->
  <VfSelect name="modelBad" :items="items" item-value="id" v-model="modelWrong" />

  <!-- ✅: multiple → array model -->
  <VfSelect name="multiOk" :items="items" item-value="id" multiple v-model="modelMulti" />

  <!-- ❌: single model when multiple -->
  <!-- @vue-expect-error -->
  <VfSelect name="multiBad" :items="items" item-value="id" multiple v-model="modelMultiWrong" />

  <!-- ============================================================ -->
  <!-- Contextual props (label)                                       -->
  <!-- ============================================================ -->

  <!-- ✅: label callback receives context shape -->
  <VfSelect
    name="labelOk"
    :items="items"
    item-value="id"
    :label="
      (el$) => {
        el$.path
        el$.validate
        el$.form$
        el$.items
        el$.model
        return `Select (${el$.path})`
      }
    "
  />

  <!-- ❌: invalid context member -->
  <!-- @vue-expect-error -->
  <VfSelect name="labelBad" :items="items" item-value="id" :label="(el$) => el$.definitelyNotARealMember" />

  <!-- ============================================================ -->
  <!-- Event handlers                                                 -->
  <!-- ============================================================ -->

  <!-- ✅: event context$ exposes path / validate / form$ / items / model -->
  <VfSelect
    name="evt"
    :items="items"
    item-value="id"
    @change="
      (n, o, el$) => {
        el$.path
        el$.validate
        el$.form$
        el$.items
        el$.model
        n
        o
      }
    "
  />

  <!-- ❌: invalid context member -->
  <!-- @vue-expect-error -->
  <VfSelect name="evtBadMember" :items="items" item-value="id" @change="(_n, _o, el$) => el$.definitelyNotARealMember" />

  <!-- ============================================================ -->
  <!-- Template slot                                                  -->
  <!-- ============================================================ -->

  <!-- ✅: #template receives context shape -->
  <VfSelect name="slot" :items="items" item-value="id">
    <template #template="{ context }">
      {{ context.path }}
      {{ context.validate }}
      {{ context.form$ }}
      {{ context.items }}
      {{ context.model }}
    </template>
  </VfSelect>

  <!-- ✅: scalar items + multiple → model is number[] (SFC widens [1,2,3]) -->
  <VfSelect name="slotScalarMulti" :items="[1, 2, 3]" multiple>
    <template #template="{ context }">
      {{ context.model satisfies number[] }}
      {{ context.props.multiple satisfies boolean | undefined }}
      {{ context.items[0].value satisfies number }}
    </template>
  </VfSelect>

  <!-- ✅: object items + item-value → model is 1 | 2 | null -->
  <VfSelect name="slotObject" :items="items" item-value="id">
    <template #template="{ context }">
      {{ context.model satisfies 1 | 2 | null }}
      {{ context.items[0].value satisfies 1 | 2 }}
    </template>
  </VfSelect>

  <!-- ❌: model is not a string when itemValue is numeric -->
  <VfSelect name="slotModelWrong" :items="items" item-value="id">
    <template #template="{ context }">
      <!-- @vue-expect-error -->
      {{ context.model satisfies string }}
    </template>
  </VfSelect>

  <!-- ❌: invalid context member in #template -->
  <VfSelect name="slotBadMember" :items="items" item-value="id">
    <template #template="{ context }">
      <!-- @vue-expect-error -->
      {{ context.definitelyNotARealMember }}
    </template>
  </VfSelect>

  <!-- ============================================================ -->
  <!-- classes / parts / reclass (object forms)                      -->
  <!-- `part:*` / `class:*` / `reclass:*` attrs are dist-only — see   -->
  <!-- shorthand-attrs-dist.test-d.ts                           -->
  <!-- ============================================================ -->

  <!-- ✅: object forms receive context shape -->
  <VfSelect name="classesPartsOk" :items="items" item-value="id" :classes="{ input: (el$) => (el$.path ? 'ok' : '') }" :reclass="{ input: (el$) => (el$.path ? 'ok' : '') }" :parts="{ input: (el$) => ({ 'data-path': el$.path }) }" />

  <!-- ❌: invalid context member on classes -->
  <!-- @vue-expect-error -->
  <VfSelect name="classesBad" :items="items" item-value="id" :classes="{ input: (el$) => el$.definitelyNotARealMember }" />

  <!-- ❌: invalid context member on parts -->
  <!-- @vue-expect-error -->
  <VfSelect name="partsBad" :items="items" item-value="id" :parts="{ input: (el$) => ({ x: el$.definitelyNotARealMember }) }" />

  <!-- ❌: invalid context member on reclass -->
  <!-- @vue-expect-error -->
  <VfSelect name="reclassBad" :items="items" item-value="id" :reclass="{ input: (el$) => el$.definitelyNotARealMember }" />
</template>
