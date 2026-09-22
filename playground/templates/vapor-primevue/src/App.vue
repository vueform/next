<script setup lang="ts">
import { defineSchema } from '@vueform/primevue/vapor'
import { useTemplateRef } from 'vue'

const form$ = useTemplateRef('form$')

const schema = defineSchema({
  text: {
    type: 'input-text',
    label: 'Hello World',
  },
})
</script>

<template>
  <div>
    <VfForm :schema ref="form$" />
    <pre>{{ form$?.model }}</pre>
  </div>
</template>
