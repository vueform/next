<script setup lang="ts">
// Root component for every benchmark mount. It is compiled by the vapor SFC
// compiler with `features.vapor` on or off depending on BENCH_MODE, so the
// same file serves both modes. Props arrive through an app-level provide
// (root props are not reactive), and the exposed form context is handed back
// through a callback for the same reason.
//
// The provided state is a shallowReactive object rather than a ref on
// purpose: in dev (non-inline) template compilation, vapor's setup-state
// proxy does not auto-unwrap refs, so `state.props` property access is the
// only form that behaves identically in every compile mode.
import { inject, useTemplateRef, watchEffect } from 'vue'

const bench = inject('bench$') as {
  state: { props: Record<string, any>; vmodel: boolean; model?: any }
  setForm: (form$: any) => void
}

const state = bench.state
const form$ = useTemplateRef<any>('form$')

watchEffect(() => {
  bench.setForm(form$.value)
})
</script>

<template>
  <!--
    v-model mounts get a real, dedicated per-prop binding. Writing the model
    back by replacing the whole `v-bind` object instead would, in vapor mode,
    invalidate every prop dependency of the form on each update and produce
    pathological, unrepresentative numbers. `state.vmodel` never changes after
    mount, so the v-if picks a branch exactly once.
  -->
  <VfForm
    v-if="state.vmodel"
    ref="form$"
    v-bind="state.props"
    v-model="state.model"
  />
  <VfForm v-else ref="form$" v-bind="state.props" />
</template>
