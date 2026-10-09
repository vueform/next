<script setup lang="ts">
/**
 * The shared smoke page, mounted by every fixture's thin shell. It renders the
 * canonical schema form AND the same form built from inline global components,
 * and exposes `window.__smoke` for the Playwright specs.
 */
import { onMounted, ref } from 'vue'

import { schema } from './schema'
import SmokeFormInline from './SmokeFormInline.vue'

const form$ = ref<any>(null)

function onSubmit(payload: unknown) {
  window.__smoke.submitted = payload
  // Cancel the endpoint step — smoke asserts the payload, not a backend.
  return false
}

onMounted(() => {
  window.__smoke = {
    submitted: null,
    vaporActive: window.__SMOKE_VAPOR_APP__ === true,
    finds: (name: string) => Boolean(form$.value?.find(name)),
    model: () => form$.value?.model ?? null,
  }
})
</script>

<template>
  <main>
    <section data-smoke="schema-form">
      <h2>Schema form</h2>
      <VfForm ref="form$" :schema="schema" @submit="onSubmit" />
    </section>
    <section data-smoke="inline-form">
      <h2>Inline form</h2>
      <SmokeFormInline />
    </section>
  </main>
</template>
