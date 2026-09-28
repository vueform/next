import { ref, shallowRef } from 'vue'

/**
 * The mounted form's exposed API, filled by App.vue's template ref.
 */
export const form$ = shallowRef<any>(null)

/**
 * The model bound via v-model in the vmodel case.
 */
export const model = ref<Record<string, unknown>>({})
