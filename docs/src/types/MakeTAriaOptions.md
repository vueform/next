```ts
/**
 * Configuration for the text ARIA factory resolving language-aware describedby
 * and lang attributes.
 */
type MakeTAriaOptions = {
  props: {
    aria: AriaProp | undefined
    help: TProp | undefined
    description: TProp | undefined
  }

  deps: ReturnsOf<
    [
      [typeof makeLayout, ['helpId', 'descriptionId', 'errorId']],
      [typeof makeMultilingual, ['language', 'languageId', 'translatable']],
      [typeof makeData, ['hasError', 'busy', 'required']],
    ]
  >
}
```
