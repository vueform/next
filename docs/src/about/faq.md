Now I want to refactor useDate.

const date: DateInstance = useDate()

I should be able to do useDate(d: Date).

By default it should use the native adapter.

In config i should be able to do:

```ts
type DateAdapter = (data: any) => DateInstance

const myDateAdapter: DateAdapter = (date: Date | string): DateInstance => { ... }

config.$date.adapter = myDateAdapter
```

DateAdapter should be imported from vueform.

Refactor it.
