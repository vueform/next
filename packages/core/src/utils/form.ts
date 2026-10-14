import { equals, isPlainObject } from './object'

/**
 * Checks whether a value is a `File` or `Blob` instance (environment-safe).
 *
 * @param value The value to test.
 */
export function isFileValue(value: any): value is File | Blob {
  return (
    (typeof File !== 'undefined' && value instanceof File) ||
    (typeof Blob !== 'undefined' && value instanceof Blob)
  )
}

/**
 * Serializes a plain data object into a `FormData` instance using PHP-style
 * bracket notation for nested keys (e.g. `user[address][city]`, `tags[0]`).
 * Files and Blobs are appended as-is, `null` / `undefined` become empty
 * strings, and all other scalars are stringified.
 *
 * @param data The plain data object to serialize.
 * @param formData An existing `FormData` instance to append to.
 * @param parentKey The parent key prefix used during recursion.
 */
export function toFormData(
  data: Record<string, any>,
  formData = new FormData(),
  parentKey = ''
): FormData {
  for (const [key, value] of Object.entries(data)) {
    const fieldKey = parentKey ? `${parentKey}[${key}]` : key

    if (value === undefined || value === null) {
      formData.append(fieldKey, '')
    } else if (isFileValue(value)) {
      formData.append(fieldKey, value)
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${fieldKey}[${index}]`
        if (isFileValue(item)) {
          formData.append(arrayKey, item)
        } else if (typeof item === 'object') {
          toFormData(item, formData, arrayKey)
        } else {
          formData.append(arrayKey, String(item))
        }
      })
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      toFormData(value, formData, fieldKey)
    } else {
      formData.append(fieldKey, String(value))
    }
  }

  return formData
}

/**
 * Whether a value is considered empty against its null-tree counterpart: blank
 * strings and values equal to their null value are empty; arrays are empty when
 * they have no rows or only empty rows; objects when all values are empty.
 *
 * @param value The model value (or subtree) to check.
 * @param nullNode The corresponding node of the null-value tree.
 */
export function isEmptyValue(value: any, nullNode: any): boolean {
  if (Array.isArray(value)) {
    return (
      !value.length ||
      value.every((row, i) =>
        isEmptyValue(
          row,
          Array.isArray(nullNode) ? (nullNode[i] ?? nullNode[0]) : undefined
        )
      )
    )
  }

  if (isPlainObject(value)) {
    return Object.keys(value).every((key) =>
      isEmptyValue(
        value[key],
        isPlainObject(nullNode) ? nullNode[key] : undefined
      )
    )
  }

  if (nullNode !== undefined && equals(value, nullNode)) return true

  return String(value ?? '').trim() === ''
}
