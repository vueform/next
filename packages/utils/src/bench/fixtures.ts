/**
 * Shared parametric schema builders for the bench files.
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
 * The same N text elements split evenly across `steps` pages.
 */
export function steppedText(n: number, steps = 10): Schema {
  const schema = flatText(n)

  Object.values(schema).forEach((element, i) => {
    element.page = `Step ${Math.floor((i * steps) / n) + 1}`
  })

  return schema
}

/**
 * Fresh values for all N elements, distinct per call.
 */
let generation = 0

export function allValues(n: number): Record<string, string> {
  generation++
  const values: Record<string, string> = {}

  for (let i = 0; i < n; i++) {
    values[`el_${i}`] = `v${generation}_${i}`
  }

  return values
}

/**
 * N text elements nested `depth` groups deep: `g_0.g_1….el_i`. Exercises the
 * container paths (registration, dataPath resolution, nested rollups).
 */
export function nestedText(n: number, depth = 3): Schema {
  let schema: Schema = flatText(n)

  for (let d = depth - 1; d >= 0; d--) {
    schema = {
      [`g_${d}`]: { type: 'group', nested: true, schema },
    } as Schema
  }

  return schema
}

/**
 * A list of `rows` initial rows, each row carrying `perRow` text fields.
 */
export function listSchema(rows: number, perRow = 2): Schema {
  const row: Record<string, unknown> = {}
  for (let i = 0; i < perRow; i++) {
    row[`f_${i}`] = { type: 'text' }
  }

  return {
    items: {
      type: 'list',
      initial: rows,
      schema: row,
    },
  }
}

/**
 * An array of `rows` row values for `listSchema(rows, perRow)`.
 */
export function listValues(
  rows: number,
  perRow = 2
): Record<string, unknown>[] {
  generation++
  const result: Record<string, unknown>[] = []
  for (let r = 0; r < rows; r++) {
    const row: Record<string, unknown> = {}
    for (let i = 0; i < perRow; i++) {
      row[`f_${i}`] = `v${generation}_${r}_${i}`
    }
    result.push(row)
  }
  return result
}
