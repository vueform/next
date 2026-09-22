<script setup lang="ts">
// No @vueform/* imports here: the same App.vue is used by every scenario, so
// only main.ts may pull in Vueform, plugins or their third-party deps.
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
