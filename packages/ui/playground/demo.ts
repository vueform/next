/**
 * Playground fragment: the demo schema. Copied into a generated playground as
 * `demo.schema.ts` by pg:up.
 */
import { defineSchema } from '@vueform/ui'

export const schema = defineSchema({
  text: {
    type: 'text',
    label: 'Hello World',
  },
})
