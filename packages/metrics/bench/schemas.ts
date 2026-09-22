/**
 * Builds a schema with `n` text elements named `t0..t{n-1}`.
 *
 * @param n The number of text elements.
 */
export function textSchema(n: number) {
  const schema: Record<string, any> = {}

  for (let i = 0; i < n; i++) {
    schema[`t${i}`] = { type: 'text', label: `Field ${i}` }
  }

  return schema
}

/**
 * Builds a stepped-form schema with `n` text elements named `t0..t{n-1}`, split
 * evenly across `pages` step groups (`page0..page{pages-1}`). Use with
 * `stepped: true` on the form.
 *
 * @param n The total number of text elements.
 * @param pages The number of steps to distribute the elements across.
 */
export function steppedTextSchema(n: number, pages: number) {
  const schema: Record<string, any> = {}
  const perPage = Math.ceil(n / pages)

  let i = 0
  for (let p = 0; p < pages; p++) {
    const pageSchema: Record<string, any> = {}

    for (let j = 0; j < perPage && i < n; j++, i++) {
      pageSchema[`t${i}`] = { type: 'text', label: `Field ${i}` }
    }

    schema[`page${p}`] = {
      type: 'group',
      page: `Step ${p + 1}`,
      schema: pageSchema,
    }
  }

  return schema
}
