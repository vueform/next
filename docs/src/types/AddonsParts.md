```ts
/**
 * Part definitions for elements that support before/after addons.
 */
interface AddonsParts {
  /**
   * An individual addon rendered before the input.
   *
   * @param addon The addon item definition.
   * @param index The addon's position index.
   * @tag VfAddon
   */
  addonBefore: (addon: AddonItem, index: number) => PartOf<'VfAddon'>

  /**
   * An individual addon rendered after the input.
   *
   * @param addon The addon item definition.
   * @param index The addon's position index.
   * @tag VfAddon
   */
  addonAfter: (addon: AddonItem, index: number) => PartOf<'VfAddon'>
}
```
