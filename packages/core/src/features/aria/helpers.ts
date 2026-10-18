import type { A11yLayoutBags } from './types'

/**
 * Joins the ids that currently describe an element into a single
 * `aria-describedby` value, or `undefined` when none apply.
 *
 * @param ids Candidate ids; falsy entries are skipped.
 */
export const buildDescribedBy = (ids: (string | null | undefined | false)[]) =>
  ids.filter((id): id is string => !!id).join(' ') || undefined

/**
 * Binding bags for the layout-rendered parts (label, help, description,
 * error) so slot users replacing those regions keep the id relationships the
 * input's `aria-describedby` points at.
 *
 * @param ids Resolved ids of the layout regions.
 */
export const buildLayoutBags = (ids: {
  labelId: string
  helpId: string
  descriptionId: string
  errorId: string
}): A11yLayoutBags => ({
  label: { id: ids.labelId },
  help: { id: ids.helpId },
  description: { id: ids.descriptionId },
  error: { id: ids.errorId, role: 'alert' },
})
