```ts
/**
 * Configuration for the holder provider factory, controlling single- or
 * multi-select container context for child elements.
 */
type MakeHolderProviderOptions = {
  deps: ReturnsOf<
    [
      [
        typeof makeElement,
        ['id', 'available', 'visible', 'path', 'children', 'container'],
      ],
      [typeof makeData, ['model', 'onUserInput', 'dataPath']],
      [typeof makeItems, ['normalizedItems']],
    ]
  >
}
```
