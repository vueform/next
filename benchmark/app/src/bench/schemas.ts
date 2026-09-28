/**
 * Parametric schema builders. Elements carry a label and a placeholder so
 * each one exercises its full machinery, not a bare input.
 */

type Schema = Record<string, Record<string, unknown>>

export function flatText(n: number): Schema {
  const schema: Schema = {}

  for (let i = 0; i < n; i++) {
    schema[`el_${i}`] = {
      type: 'text',
      label: `Field ${i}`,
      placeholder: `Value ${i}`,
    }
  }

  return schema
}

/**
 * The same N text elements split evenly across `steps` pages of a stepped
 * form (element k of N lands on page floor(k * steps / N)).
 */
export function steppedText(n: number, steps = 10): Schema {
  const schema = flatText(n)

  Object.values(schema).forEach((element, i) => {
    element.page = `Step ${Math.floor((i * steps) / n) + 1}`
  })

  return schema
}

/** Fresh values for all N elements, distinct per iteration. */
export function allValues(n: number, iteration: number): Record<string, string> {
  const values: Record<string, string> = {}

  for (let i = 0; i < n; i++) {
    values[`el_${i}`] = `v${iteration}_${i}`
  }

  return values
}
