```ts
/**
 * Resolves the element context for a schema path via the registries: the entry
 * at the path is fed back as the registry `TEntry`, so the returned context is
 * fully narrowed by the entry's props (items, translate, …).
 *
 * Unknown paths, unknown types, and union-typed paths fall back to
 * `UnknownElement` (kept cheap — no all-elements context union).
 */
type ElementByPath<T, P extends string> = [FormSchema] extends [T]
  ? UnknownElement
  : GetSchemaEntryByPath<T, P> extends infer El
    ? [El] extends [never]
      ? UnknownElement
      : El extends { type: infer TY extends string }
        ? ElementNameOfType<TY> extends infer N extends ElementNames
          ? [N] extends [never]
            ? UnknownElement
            : IsUnion<N> extends true
              ? UnknownElement
              : ContextOf<N, El>
          : UnknownElement
        : UnknownElement
    : UnknownElement
```
