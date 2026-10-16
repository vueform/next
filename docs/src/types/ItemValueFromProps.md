```ts
type ItemValueFromProps<P> = ItemValueOf<
  ItemsGenericsOf<P>['items'],
  ItemsGenericsOf<P>['itemValueKey'],
  ItemsGenericsOf<P>['groupChildren'],
  ItemsGenericsOf<P>['itemValueReturn']
>
```
