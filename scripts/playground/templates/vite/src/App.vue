<script setup lang="ts">
import { useTemplateRef } from 'vue'

import { schema } from './demo.schema'

const form$ = useTemplateRef('form$')
</script>

<template>
  <div>
    <VfForm :schema ref="form$" />
    <pre>{{ form$?.model }}</pre>
  </div>
</template>
