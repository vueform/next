<script setup lang="ts">
const items = { a: 'A', b: 'B' }
</script>

<template>
  <VfSelect name="select" label="Select" :options="items" default="a" />
  <!-- @vue-expect-error the default must be one of the options' keys -->
  <VfSelect name="narrowed" label="Narrowed" :options="items" default="z" />
</template>
