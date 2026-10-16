```ts
/**
 * Returns the resolved props object `useProps` created for a component
 * instance, or `undefined` when the component doesn't use `useProps`.
 *
 * @param instance The component's instance (VDOM or Vapor).
 * @internal
 */
function getResolvedProps(
  instance: GenericInstance
): Record<string, any> | undefined
```
