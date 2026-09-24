<script setup lang="ts">
import { ref } from 'vue'

const model = ref<Record<string, any>>({ name: '' })
</script>

<template>
  <VfForm v-model="model">
    <VfInputText name="name" label="Name" />
  </VfForm>
  <pre data-test="model">{{ model.name }}</pre>
</template>
