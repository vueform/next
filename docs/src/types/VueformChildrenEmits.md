```ts
/**
 * Event map for child element registration and unregistration.
 */
type VueformChildrenEmits = {
  /**
   * A child element has been registered at the given path.
   *
   * @param path The full path of the registered child element.
   * @param context$ The registered child element's component context.
   */
  register: [path: string, context$: any]
  /**
   * A child element has been unregistered from the given path.
   *
   * @param path The full path of the unregistered child element.
   * @param instance The specific instance being unregistered, when the removal
   *   should be identity-guarded.
   */
  unregister: [path: string, instance?: any]
}
```
