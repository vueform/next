<script setup lang="ts">
import { ref } from 'vue'

const model = ref<Record<string, any>>({ country: '' })
</script>

<template>
  <VfForm v-model="model">
    <VfText name="country" label="Country" />
    <VfText
      name="state"
      label="State"
      :conditions="[['country', '==', 'us']]"
    />
  </VfForm>
</template>
