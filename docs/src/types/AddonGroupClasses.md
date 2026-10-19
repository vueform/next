```ts
/**
 * Class definitions for elements that wrap their input in an addon group
 * container.
 */
interface AddonGroupClasses {
  /**
   * The addon group wrapper element.
   */
  addonGroup: ClassValue

  /**
   * An individual addon rendered before the input. Functional per addon — the
   * backing definition that keys `bindings.addonBefore(…)` as a resolver.
   *
   * @param addon The addon item definition.
   * @param index The addon's position index.
   */
  addonBefore: (addon: AddonItem, index: number) => ClassValue

  /**
   * An individual addon rendered after the input. Functional per addon — the
   * backing definition that keys `bindings.addonAfter(…)` as a resolver.
   *
   * @param addon The addon item definition.
   * @param index The addon's position index.
   */
  addonAfter: (addon: AddonItem, index: number) => ClassValue
}
```
