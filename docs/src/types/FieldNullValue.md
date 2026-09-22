```ts
/**
 * Derives the model / value type from a `nullValue`. The declared empty value
 * describes the kind_ of data, not its exact members — `defineSchema`'s
 * `const` narrowing would otherwise turn `['1234', 'asdf']` into a tuple of
 * those literals and reject every real model value:
 *
 * - `null` — no shape declared, the model is `any`.
 * - string / number / boolean — widened to the primitive.
 * - array — `any[]`, regardless of the declared members.
 * - object — the shape is kept with every key optional; a key that IS provided
 *   must match its declared (widened) property type.
 */
type FieldNullValue<T> = [T] extends [null] ? any : WidenLiteral<T>
```
