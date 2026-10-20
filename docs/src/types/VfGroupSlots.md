```ts
/**
 * Slots available in the VfGroup component.
 */
interface VfGroupSlots extends GroupSlots<VfGroupContext> {
  /**
   * Slot that replaces the wrapper element. Receives the wrapper part's
   * resolved bindings and the resolved schema.
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
     * The wrapper element's resolved bindings (part overrides and stacked /
     * wrapped markers); apply with `v-bind`.
     */
    bindings: PartBindings<'wrapper', VfGroupParts, VfGroupBindings>
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
