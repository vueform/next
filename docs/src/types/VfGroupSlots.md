```ts
/**
 * Slots available in the VfGroup component.
 */
interface VfGroupSlots extends GroupSlots<VfGroupContext> {
  /**
   * Slot that replaces the wrapper element. Receives the component's classes
   * and parts proxies and the resolved schema.
   */
  wrapper: (scope: {
    /**
     * The resolved schema of the group's child elements.
     */
    resolvedSchema: ResolvedSchema

    /**
     * The group's resolved label.
     */
    label?: string

    /**
     * The component's resolved classes, keyed by part name.
     */
    classes: VfGroupClasses

    /**
     * The component's resolved parts, keyed by part name.
     */
    parts: Partial<VfGroupParts>

    /**
     * The component's part-keyed styling modifiers; apply the `wrapper` bag to
     * the replacement container with `v-bind` so the stacked / wrapped styling
     * keeps working.
     */
    modifiers: VfGroupModifiers
  }) => VNode[]

  /**
   * Slot that replaces the default content. Receives the resolved schema for
   * rendering children.
   */
  default: (scope: {
    /**
     * The resolved schema of the group's child elements.
     */
    resolvedSchema: ResolvedSchema
  }) => VNode[]
}
```
