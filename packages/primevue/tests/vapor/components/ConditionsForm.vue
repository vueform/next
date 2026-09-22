<script setup lang="ts">
import { ref } from 'vue'

const model = ref<Record<string, any>>({ country: '' })
</script>

<template>
  <VfForm v-model="model">
    <VfInputText name="country" label="Country" />
    <VfInputText
      name="state"
      label="State"
      :conditions="[['country', '==', 'us']]"
    />
  </VfForm>
</template>
