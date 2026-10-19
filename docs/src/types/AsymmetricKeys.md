```ts
/**
 * Collects the shared keys where both the part and the aspect member are
 * functional but their parameter tuples differ — the aggregate resolves every
 * aspect with ONE argument list, so functional signatures must match per part.
 * (A static member under a functional part, or a functional classes member
 * under a static part, is allowed: the aggregate resolves plain bags as-is.)
 */
type AsymmetricKeys<T, TParts> = {
  [K in keyof T & keyof TParts]: NonNullable<TParts[K]> extends (
    ...args: infer A
  ) => any
    ? NonNullable<T[K]> extends (...args: infer B) => any
      ? [A, B] extends [B, A]
        ? never
        : K
      : never
    : never
}[keyof T & keyof TParts]
```
