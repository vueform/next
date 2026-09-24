<script setup lang="ts">
import { defineSchema } from '@vueform/primevue'

const schema = defineSchema({
  text: {
    type: 'input-text',
  },
})
</script>

<template>
  <div>
    <VfForm :schema />
  </div>
</template>
