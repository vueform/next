<script setup lang="ts">
import { ref } from 'vue'

const model = ref<Record<string, any>>({ email: '' })
</script>

<template>
  <VfForm v-model="model">
    <VfText name="email" label="Email" />
  </VfForm>
  <pre data-test="model">{{ model.email }}</pre>
</template>
