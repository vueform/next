```ts
/**
 * Slots available in the VfCheckboxes component.
 */
interface VfCheckboxesSlots<
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
> extends CheckboxesSlots<
  VfCheckboxesContext<
    VfCheckboxesProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TModel,
      TItemValueReturn
    >
  >
> {
  /**
   * Slot that replaces the default checkboxes rendering.
   *
   * @param scope The default slot's params.
   */
  default: (scope: {
    /**
     * The shared checkbox name attribute.
     */
    checkboxName: string

    /**
     * Whether the checkboxes are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * Resolved flat checkbox items.
     */
    items: ResolvedItem<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >[]

    /**
     * Resolved checkbox groups.
     */
    groups: ResolvedGroup<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >[]

    /**
     * Whether items are rendered as groups.
     */
    grouped: boolean
  }) => VNode[]

  /**
   * Slot that replaces each option group when items are grouped.
   *
   * @param scope The group slot's params.
   */
  group: (scope: {
    /**
     * The shared checkbox name attribute.
     */
    checkboxName: string

    /**
     * Whether the checkboxes are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * The resolved option group.
     */
    group: ResolvedGroup<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >

    /**
     * The group fieldset's resolved bindings (part overrides for this group's
     * fieldset element); apply with `v-bind`.
     */
    bindings: VfCheckboxesResolvedBindings['group']
  }) => VNode[]

  /**
   * Slot that replaces each entire `VfCheckbox` child.
   *
   * @param scope The item slot's params.
   */
  item: (scope: {
    /**
     * The shared checkbox name attribute.
     */
    checkboxName: string

    /**
     * Whether the checkboxes are disabled.
     */
    disabled: boolean

    /**
     * The element's resolved label.
     */
    label: string | undefined

    /**
     * The resolved checkbox item.
     */
    item: ResolvedItem<
      ItemValueOf<TItems, TItemValueKey, TGroupChildren, TItemValueReturn>,
      RawItemOf<TItems, TGroupChildren>
    >

    /**
     * The item's resolved bindings (part overrides for this item's VfCheckbox
     * child); apply with `v-bind`.
     */
    bindings: VfCheckboxesResolvedBindings['item']
  }) => VNode[]

  /**
   * Slot that replaces each individual checkbox input rendering.
   *
   * Child checkboxes always use the default `true` / `false` values; the
   * holder's item value is resolved by name, not passed as `trueValue`.
   *
   * @inherits VfCheckbox.default
   */
  checkbox: (
    scope: Parameters<VfCheckboxSlots<true, false>['default']>[0]
  ) => VNode[]

  /**
   * Slot that replaces the text/label of each individual checkbox.
   *
   * @inherits VfCheckbox.text
   */
  text: (scope: Parameters<VfCheckboxSlots['text']>[0]) => VNode[]
}
```
