/**
 * Shared SSR smoke fixture: a schema touching every user-facing element type,
 * and the per-request app factory from the SSR guide's Custom Vite Setup. The
 * server-render suite runs it under plain Node, the hydration suite over DOM.
 */
import { defineSchema } from '@vueform/ui'
import { createVueform } from '@vueform/ui/origin'
import { createSSRApp } from 'vue'

export const schema = defineSchema({
  text: { type: 'text', label: 'Text', default: 'Server value' },
  textarea: { type: 'textarea', label: 'Textarea' },
  select: { type: 'select', label: 'Select', items: ['One', 'Two', 'Three'] },
  checkbox: { type: 'checkbox', label: 'Checkbox', text: 'Check me' },
  checkboxes: { type: 'checkboxes', label: 'Checkboxes', items: ['a', 'b'] },
  radio: {
    type: 'radio',
    label: 'Radio',
    text: 'Pick me',
    radioValue: 'picked',
  },
  radios: { type: 'radios', label: 'Radios', items: ['x', 'y'] },
  file: { type: 'file', label: 'File' },
  hidden: { type: 'hidden', default: 'invisible' },
  content: { type: 'content', content: 'Static content' },
  group: {
    type: 'group',
    schema: {
      nested: { type: 'text', label: 'Nested text' },
    },
  },
  list: {
    type: 'list',
    label: 'List',
    schema: {
      item: { type: 'text', label: 'List item', default: 'first row' },
    },
  },
  grid: {
    type: 'grid',
    grid: [['Grid cell', { type: 'text', name: 'inGrid' }]],
  },
  matrix: {
    type: 'matrix',
    cols: [{ value: 'a', label: 'Col A' }],
    rows: ['Row 1'],
    inputType: 'radio',
  },
  button: { type: 'button', text: 'Submit it' },
})

export function createApp() {
  const vueform = createVueform()

  const app = createSSRApp({
    template: '<VfForm :schema="schema" />',
    setup: () => ({ schema }),
  })

  app.use(vueform)

  return { app, vueform }
}
