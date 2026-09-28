<script setup lang="ts">
import { formProps, schema, useVModel } from './bench/current'
import { form$, model } from './state'

function setForm(el: unknown) {
  form$.value = el
}
</script>

<template>
  <VfForm
    v-if="useVModel"
    v-model="model"
    :schema="schema"
    v-bind="formProps"
    :ref="setForm"
  />
  <VfForm v-else :schema="schema" v-bind="formProps" :ref="setForm" />
</template>
