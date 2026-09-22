<script setup lang="ts">
import Grid from './Grid.vue'
import Matrix from './Matrix.vue'

const suite = new URLSearchParams(window.location.search).get('suite')
</script>

<template>
  <Grid v-if="suite === 'grid'" />
  <Matrix v-else-if="suite === 'matrix'" />
</template>
