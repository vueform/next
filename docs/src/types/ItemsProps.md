```ts
/**
 * Props for elements that resolve option items from arrays, objects, endpoints,
 * or functions.
 *
 * `itemValue` is split across two generics so Vue can contextually type the
 * mapper's `item` argument from `items` while still inferring the return type
 * into the model:
 *
 * - `TItemValueKey` — string property key
 * - `TItemValueReturn` — mapper return type (defaults to `unknown` = unset)
 */
interface ItemsProps<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TItemValueReturn = unknown,
  TContext = any,
> extends /* @vue-ignore */ ItemsGenericsBrand<
  TItems,
  TItemValueKey,
  TGroupChildren,
  TItemValueReturn
> {
  /**
   * The option items for the element.
   */
  items?: MaybeRef<TItems>

  /**
   * Resolves the label for an item. A string key for property lookup, or a
   * function returning the label string. Not allowed for plain scalar arrays or
   * plain object/record maps.
   */
  itemLabel?: ItemKeyProp<TItems, TGroupChildren, string>

  /**
   * Resolves the value for an item. A string key for property lookup, or a
   * function returning the value. Not allowed for plain scalar arrays or plain
   * object/record maps.
   *
   * Typed as `(TItemValueKey & AllowedItemValueKey) | AllowedItemValueKey |
   * ((item) => TItemValueReturn)` so:
   *
   * - string keys infer into `TItemValueKey` through the intersection, which also
   *   rejects keys missing from the item shape (the generic itself is only
   *   bounded by the simple `ItemValueProp`, so validation must happen here)
   * - keys remain assignable on the defaulted `ElementSchema` / `FormSchema`
   *   surface where `TItemValueKey` is still `undefined`
   * - mapper return types infer into `TItemValueReturn`
   * - the `item` parameter stays concrete and is contextually typed even for bare
   *   inline arrows (whose return type cannot drive generics under Vue's
   *   single-pass inference — annotate the param or use a named function for
   *   full model inference)
   */
  itemValue?: AllowsItemKeyProps<TItems> extends true
    ? | (TItemValueKey & AllowedItemValueKey<TItems, TGroupChildren>)
      | AllowedItemValueKey<TItems, TGroupChildren>
      | ((item: RawItemOf<TItems, TGroupChildren>) => TItemValueReturn)
    : never

  /**
   * Determines whether an item is disabled. A string key for property lookup,
   * or a function returning a `ConditionalProp`. Not allowed for plain scalar
   * arrays or plain object/record maps.
   */
  itemDisabled?: ItemKeyProp<
    TItems,
    TGroupChildren,
    ConditionalProp<TContext> | undefined
  >

  /**
   * Determines whether an item is available. A string key for property lookup,
   * or a function returning a `ConditionalProp`. Items whose conditions are not
   * met are omitted from the list. Not allowed for plain scalar arrays or plain
   * object/record maps.
   */
  itemConditions?: ItemKeyProp<
    TItems,
    TGroupChildren,
    ConditionalProp<TContext> | undefined
  >

  /**
   * Resolves the label for a group. A string key for property lookup on the
   * group object, or a function returning the label string. Not allowed for
   * plain scalar arrays or plain object/record maps.
   */
  groupLabel?: GroupKeyProp<TItems, string>

  /**
   * Resolves the children items for a group. A string key for property lookup
   * on the group object, or a function returning the children in any
   * `ItemsProp` format. Not allowed for plain scalar arrays or plain
   * object/record maps.
   *
   * The intersection arm infers keys into `TGroupChildren` while rejecting keys
   * missing from the group shape (the generic itself is only bounded by the
   * simple `GroupChildrenProp`). The bare `AllowedGroupChildren` arm keeps keys
   * assignable on the defaulted `ElementSchema` / `FormSchema` surface where
   * `TGroupChildren` is still `undefined`.
   */
  groupChildren?: AllowsItemKeyProps<TItems> extends true
    ? | (TGroupChildren & AllowedGroupChildren<TItems>)
      | AllowedGroupChildren<TItems>
    : never

  /**
   * Determines whether a group is available. A string key for property lookup
   * on the group object, or a function returning a `ConditionalProp`. Groups
   * whose conditions are not met are omitted entirely. Not allowed for plain
   * scalar arrays or plain object/record maps.
   */
  groupConditions?: GroupKeyProp<TItems, ConditionalProp<TContext> | undefined>

  /**
   * Custom HTTP headers to include when loading items from an endpoint.
   */
  headers?: Record<string, string>

  /**
   * The HTTP method to use when loading items from an endpoint. Defaults to
   * `'GET'`.
   */
  method?: string

  /**
   * The source that triggers re-resolution of function-based items. Accepts an
   * array of element paths whose values are watched, a `Ref`, or a function
   * used as a watch getter. When omitted, function-based items are only
   * re-resolved when the `items` prop reference itself changes.
   */
  itemsTrigger?: ConditionsTriggerProp<TContext>

  /**
   * The debounce delay in milliseconds applied before re-resolving
   * function-based items when the `itemsTrigger` source changes. Defaults to no
   * debounce (immediate re-resolution).
   */
  itemsDebounce?: number

  /**
   * Transforms data received from an endpoint into the items format. When
   * `items` is a string (endpoint URL), the HTTP response data is passed
   * through this function before normalization.
   */
  transformItems?: (data: any) => any[] | Record<string, any>
}
```
