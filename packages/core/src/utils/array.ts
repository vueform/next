/**
 * Extracts the array portion from a type that may include non-array members.
 */
type ArrayPart<T> = Extract<NonNullable<T>, readonly any[]>

/**
 * Checks whether an array type contains only string elements.
 */
type IsStringArray<T> = T extends readonly string[] ? true : false

/**
 * Return type for converting values to array items.
 */
type ToArrayItemsReturn<
  TItems,
  TValueKey extends string,
  TLabelKey extends string,
> = [ArrayPart<TItems>] extends [never]
  ? Array<{ [K in TValueKey]: string } & { [K in TLabelKey]: string }>
  : IsStringArray<ArrayPart<TItems>> extends true
    ? Array<{ [K in TValueKey]: string } & { [K in TLabelKey]: string }>
    : ArrayPart<TItems>

/**
 * Joins two values into an array, concatenating if either is already an array.
 *
 * @param a First value or array.
 * @param b Second value or array.
 */
export function joinMaybeArrays(a: any, b: any) {
  return Array.isArray(a) ? a.concat(b) : Array.isArray(b) ? [a, ...b] : [a, b]
}

/**
 * Wraps a value in an array if it is not already an array.
 *
 * @param input The value or array.
 */
export function toArray<T extends unknown>(input: T | T[]) {
  return Array.isArray(input) ? input : [input]
}

/**
 * Converts an object or array of items into a normalized array format with
 * configurable value and label keys.
 *
 * @param items The items as a record or array.
 * @param valueKey The key name for values in the output array.
 * @param labelKey The key name for labels in the output array.
 */
export function toArrayItems<
  const TValueKey extends string = 'value',
  const TLabelKey extends string = 'label',
  TItems extends
    | Record<string, string>
    | readonly string[]
    | readonly Record<string, any>[]
    | undefined =
    | Record<string, string>
    | readonly string[]
    | readonly Record<string, any>[]
    | undefined,
>(
  items: TItems,
  valueKey: TValueKey = 'value' as TValueKey,
  labelKey: TLabelKey = 'label' as TLabelKey
): ToArrayItemsReturn<TItems, TValueKey, TLabelKey> {
  if (!items) {
    return [] as any
  }

  if (Array.isArray(items)) {
    if (items.length > 0 && typeof items[0] === 'string') {
      return items.map((item) => ({
        [valueKey]: item,
        [labelKey]: item,
      })) as any
    }

    return items as any
  }

  return Object.entries(items).map(([value, label]) => ({
    [valueKey]: value,
    [labelKey]: label,
  })) as any
}

/**
 * Returns a new array with an item moved from one index to another.
 *
 * @param array The source array.
 * @param fromIndex The index to move from.
 * @param toIndex The index to move to.
 */
export function move(
  array: any[],
  fromIndex: number | undefined,
  toIndex: number | undefined
) {
  if (
    fromIndex === undefined ||
    toIndex === undefined ||
    fromIndex === toIndex ||
    fromIndex < 0 ||
    fromIndex >= array.length ||
    toIndex < 0 ||
    toIndex > array.length
  ) {
    return array
  }

  const newArray = [...array]
  const [item] = newArray.splice(fromIndex, 1)

  newArray.splice(toIndex, 0, item)

  return newArray
}
