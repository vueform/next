<script setup lang="ts">
const endpoint = (): false => false
</script>

<template>
  <VfForm :endpoint="endpoint">
    <VfInputText name="text" label="Text" rules="required" />
    <VfButton name="submit" text="Submit" action="submit" />
  </VfForm>
</template>
