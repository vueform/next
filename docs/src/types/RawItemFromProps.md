```ts
type RawItemFromProps<P> = RawItemOf<
  ItemsGenericsOf<P>['items'],
  ItemsGenericsOf<P>['groupChildren']
>
```
