<script setup lang="ts">
// No @vueform/* or primevue imports here: the same App.vue is used by every
// scenario, including the Vueform-free baseline, so only main.ts may pull
// in Vueform or PrimeVue.
const schema = {
  text: {
    type: 'text',
    label: 'Hello World',
  },
}
</script>

<template>
  <div>
    <VfForm :schema />
  </div>
</template>
