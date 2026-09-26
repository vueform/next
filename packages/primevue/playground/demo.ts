/**
 * Playground fragment: the demo schema. Copied into a generated playground as
 * `demo.schema.ts` by pg:up.
 */
import { defineSchema } from '@vueform/primevue'

export const schema = defineSchema({
  text: {
    type: 'input-text',
    label: 'Hello World',
  },
})
