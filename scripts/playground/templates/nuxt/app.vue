<script setup lang="ts">
import { defineSchema } from '@vueform/ui'

const schema = defineSchema({
  text: {
    type: 'text',
  },
})
</script>

<template>
  <div>
    <VfForm :schema />
  </div>
</template>
