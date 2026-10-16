```ts
/**
 * Resolves a raw ref value into an expression-aware computed.
 *
 * @param key The expression allow-list key.
 * @param prop The dynamic prop value ref to resolve.
 * @param options Resolution options.
 */
function useDynamicProp(
  key: string,
  prop: Ref<any>,
  options: UseDynamicPropOptions<void, any> & { string: true }
): ComputedRef<string>

function useDynamicProp(
  key: string,
  prop: Ref<any>,
  options: UseDynamicPropOptions<void, any> & { number: true }
): ComputedRef<number | undefined>

function useDynamicProp(
  key: string,
  prop: Ref<any>,
  options: UseDynamicPropOptions<void, any> & { date: true }
): ComputedRef<Date | undefined>

function useDynamicProp(
  key: string,
  prop: Ref<any>,
  options: UseDynamicPropOptions<void, any> & { icon: true }
): ComputedRef<string | undefined>

function useDynamicProp<V = void, T = any>(
  key: string,
  prop: Ref<T>,
  options?: UseDynamicPropOptions<V, UnwrapDynamicProp<T>>
): ComputedRef<ResolvedValue<V, T> | undefined>

/**
 * Resolves a `DProp` from a props object into an expression-aware computed. The
 * computed's value type is inferred from the prop's declared type, or the
 * `transform` option's return type when provided.
 *
 * @param name The prop name (key in the props object).
 * @param props The component props object.
 * @param options Resolution options.
 */
function useDynamicProp<
  P extends Record<string, any>,
  K extends keyof P & string,
>(
  name: K,
  props: P,
  options: UseDynamicPropOptions<void, UnwrapDynamicProp<P[K]>> & {
    string: true
  }
): ComputedRef<string>

function useDynamicProp<
  P extends Record<string, any>,
  K extends keyof P & string,
>(
  name: K,
  props: P,
  options: UseDynamicPropOptions<void, UnwrapDynamicProp<P[K]>> & {
    number: true
  }
): ComputedRef<number | undefined>

function useDynamicProp<
  P extends Record<string, any>,
  K extends keyof P & string,
>(
  name: K,
  props: P,
  options: UseDynamicPropOptions<void, UnwrapDynamicProp<P[K]>> & {
    date: true
  }
): ComputedRef<Date | undefined>

function useDynamicProp<
  P extends Record<string, any>,
  K extends keyof P & string,
>(
  name: K,
  props: P,
  options: UseDynamicPropOptions<void, UnwrapDynamicProp<P[K]>> & {
    icon: true
  }
): ComputedRef<string | undefined>

function useDynamicProp<
  V = void,
  P extends Record<string, any> = Record<string, any>,
  K extends keyof P & string = keyof P & string,
>(
  name: K,
  props: P,
  options?: UseDynamicPropOptions<V, UnwrapDynamicProp<P[K]>>
): ComputedRef<ResolvedValue<V, P[K]> | undefined>
```
