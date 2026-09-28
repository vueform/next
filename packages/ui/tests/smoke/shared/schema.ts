/**
 * The canonical smoke schema in this adapter's element vocabulary. The KEYS
 * (text, select, checkboxes, group.city, list.entry, submit) are the shared
 * contract — the harness's specs and type tests are written against them —
 * while the `type` strings are the adapter's own. It touches each registry
 * family once; feature coverage lives in the package tests. Resist growing it.
 */
import { defineSchema } from '@vueform/ui'

export const schema = defineSchema({
  text: { type: 'text', label: 'Text', rules: 'required' },
  select: {
    type: 'select',
    label: 'Select',
    items: { a: 'A', b: 'B' },
    default: 'a',
  },
  checkboxes: { type: 'checkboxes', label: 'Checkboxes', items: { x: 'X', y: 'Y' } },
  group: { type: 'group', schema: { city: { type: 'text', label: 'City' } } },
  list: { type: 'list', schema: { entry: { type: 'text', label: 'Entry' } } },
  submit: { type: 'button', action: 'submit', text: 'Submit' },
})

export type SmokeSchema = typeof schema
