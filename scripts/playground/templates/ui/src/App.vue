<script setup lang="ts">
import { defineSchema } from '@vueform/ui'
import { useTemplateRef } from 'vue'

const form$ = useTemplateRef('form$')

const schema = defineSchema({
  text: {
    type: 'text',
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
