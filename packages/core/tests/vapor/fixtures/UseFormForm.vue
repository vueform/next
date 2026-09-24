<script setup lang="ts">
import { useForm, useModel } from '@vueform/core'

const model$ = useModel({ email: { type: 'text' } })

const [MyForm] = useForm(
  { schema: { email: { type: 'text', label: 'Email' } } },
  model$
)
</script>

<template>
  <component :is="MyForm" />
  <pre data-test="model">{{ model$.model.email }}</pre>
  <pre data-test="adopted">{{ model$.adopted }}</pre>
</template>
