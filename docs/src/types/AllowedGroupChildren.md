```ts
/**
 * Allowed keys / mappers for `groupChildren`. When the group shape is unknown
 * (e.g. unconstrained `ItemsProp`), fall back to a loose string / mapper so the
 * prop stays assignable to runtime `GroupChildren` (`(group: any) => …`).
 */
type AllowedGroupChildren<TItems> = [GroupOf<TItems>] extends [never]
  ? string | ((group: any) => any[] | Record<string, any>)
  : | Extract<keyof GroupOf<TItems>, string>
    | ((group: GroupOf<TItems>) => any[] | Record<string, any>)
```
