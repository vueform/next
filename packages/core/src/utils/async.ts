import { unref, type MaybeRef } from 'vue'

import { isPlainObject } from './object'

/**
 * Iterates over an array or object sequentially, awaiting each callback.
 *
 * @param arrayOrObject The collection to iterate over.
 * @param callback Async or sync callback invoked for each entry.
 */
export async function asyncForEach<T>(
  arrayOrObject: Record<string, T> | T[],
  callback: (
    value: T,
    key: string | number,
    collection: Record<string, T> | T[]
  ) => Promise<void> | void
): Promise<void> {
  const isObject = isPlainObject(arrayOrObject)
  const values = isObject ? Object.values(arrayOrObject) : arrayOrObject
  const keys = isObject
    ? Object.keys(arrayOrObject)
    : arrayOrObject.map((_, i) => i)

  for (let index = 0; index < values.length; index++) {
    await callback(values[index], keys[index], arrayOrObject)
  }
}

/**
 * Type guard that checks whether a value is a thenable (has a `.then` method).
 *
 * @param value The value to test.
 */
export function isThenable<T>(
  value: T | PromiseLike<T>
): value is PromiseLike<T> {
  return value != null && typeof (value as any).then === 'function'
}

/**
 * Creates a debounced version of a function that delays invocation until after
 * the specified timeout. The returned function exposes a `cancel` method that
 * clears any pending invocation, which callers should invoke on teardown (e.g.
 * `onScopeDispose`) so a queued call cannot fire after disposal.
 *
 * @param func The function to debounce.
 * @param timeout Delay in milliseconds (supports reactive refs).
 */
export function debounce<TThis, TArgs extends unknown[], TResult>(
  func: (this: TThis, ...args: TArgs) => TResult,
  timeout: MaybeRef<string | number>
) {
  let timer: ReturnType<typeof setTimeout> | undefined

  const debounced = function (this: TThis, ...args: TArgs): TResult | void {
    if (timer) clearTimeout(timer)

    const unwrapped = unref(timeout)
    const delay = typeof unwrapped === 'string' ? Number(unwrapped) : unwrapped

    if (!delay || delay <= 0) {
      return func.apply(this, args)
    }

    timer = setTimeout(() => {
      timer = undefined
      func.apply(this, args)
    }, delay)
  }

  return Object.assign(debounced, {
    /**
     * Cancels any pending invocation, clearing the active debounce timer.
     */
    cancel: (): void => {
      if (timer) {
        clearTimeout(timer)
        timer = undefined
      }
    },
  })
}
