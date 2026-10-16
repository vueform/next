```ts
/**
 * Whether item/group key props are allowed for the given `items` shape.
 *
 * Gates `itemValue`, `itemLabel`, `itemDisabled`, `itemConditions`,
 * `groupLabel`, `groupChildren`, and `groupConditions`.
 *
 * Based on the unwrapped `items` shape only (not `groupChildren`), so an
 * invalid `groupChildren` value cannot disable enforcement of the other key
 * props.
 *
 * - Allowed for arrays of objects, endpoint URLs, and the unconstrained
 *   `ItemsProp` default.
 * - Forbidden for plain scalar arrays and plain object/record maps, which use a
 *   synthetic `{ value, label }` shape at runtime — those key props are not
 *   meaningful there.
 */
type AllowsItemKeyProps<TItems> =
  IsDefaultItems<TItems> extends true
    ? true
    : UnwrappedItems<TItems> extends infer D
      ? D extends string
        ? true
        : D extends readonly (infer E)[]
          ? E extends Record<string, any>
            ? true
            : false
          : IsPlainRecord<D> extends true
            ? false
            : true
      : true
```
