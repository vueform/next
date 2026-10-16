```ts
/**
 * Recursively widens literals to their primitives: `'1234'` → `string`, `0` →
 * `number`, `false` → `boolean`. Arrays of any shape become `any[]` — an array
 * `nullValue` only says "the model is an array", never what it holds. Object
 * properties turn optional (a model may be partially filled) and widen the same
 * way, dropping `readonly`; functions and remaining types pass through.
 */
type WidenLiteral<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly any[]
        ? any[]
        : T extends (...args: any[]) => any
          ? T
          : T extends object
            ? { -readonly [K in keyof T]?: WidenLiteral<T[K]> }
            : T
```
