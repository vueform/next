/**
 * Joins the ids that currently describe an element into a single
 * `aria-describedby` value, or `undefined` when none apply.
 *
 * @param ids Candidate ids; falsy entries are skipped.
 */
export const buildDescribedBy = (ids: (string | null | undefined | false)[]) =>
  ids.filter((id): id is string => !!id).join(' ') || undefined
