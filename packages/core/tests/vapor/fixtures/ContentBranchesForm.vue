<script setup lang="ts">
// Exercises the VfLayout content branches: prop addons + icon group,
// loading spinner, layout:false passthrough, and an inline (vapor-compiled)
// addon slot.
</script>

<template>
  <VfForm>
    <VfText
      name="price"
      label="Price"
      addon-before="$"
      addon-after=".00"
      icon-before="search"
    />
    <VfText name="loader" label="Loader" loading />
    <VfText name="promo" :layout="false" placeholder="promo" />
    <VfText name="username" label="Username">
      <template #addonAfter>
        <VfAddon><span data-test="inline-slot">inline slot</span></VfAddon>
      </template>
    </VfText>
  </VfForm>
</template>
