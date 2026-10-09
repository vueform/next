<script setup lang="ts">
const items = { a: 'A', b: 'B' }
</script>

<template>
  <VfSelect name="select" label="Select" :items="items" default="a" />
  <!-- @vue-expect-error the default must be one of the items' keys -->
  <VfSelect name="narrowed" label="Narrowed" :items="items" default="z" />
</template>
