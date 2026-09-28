<script setup lang="ts">
/**
 * The canonical form's control subset as inline global components — no imports,
 * no schema. This proves the plugin's global registration and the
 * `GlobalComponents` augmentation (template prop typing) end to end. Group/list
 * inline composition is feature territory and stays out.
 */
const items = { a: 'A', b: 'B' }
</script>

<template>
  <VfForm>
    <VfInputText name="text" label="Text" rules="required" />
    <VfSelect name="select" label="Select" :options="items" default="a" />
    <VfCheckboxGroup name="checkboxes" label="Checkboxes" :options="items" />
  </VfForm>
</template>
