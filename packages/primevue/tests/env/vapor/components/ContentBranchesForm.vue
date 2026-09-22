<script setup lang="ts">
// Exercises the VfLayout content branches: prop addons + icon group,
// loading spinner, layout:false passthrough, and an inline (vapor-compiled)
// addon slot.
</script>

<template>
  <VfForm>
    <VfInputText
      name="price"
      label="Price"
      addon-before="$"
      addon-after=".00"
      icon-before="search"
    />
    <VfInputText name="loader" label="Loader" loading />
    <VfInputText name="promo" :layout="false" placeholder="promo" />
    <VfInputText name="username" label="Username">
      <template #addonAfter>
        <VfAddon><span data-test="inline-slot">inline slot</span></VfAddon>
      </template>
    </VfInputText>
  </VfForm>
</template>
