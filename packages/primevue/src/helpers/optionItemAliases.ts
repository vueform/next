/**
 * Maps core makeItems prop names to PrimeVue option* prop names for flat
 * (non-grouped) option lists.
 */
export const flatOptionItemAliases = {
  items: 'options',
  itemValue: 'optionValue',
  itemLabel: 'optionLabel',
  itemDisabled: 'optionDisabled',
  itemConditions: 'optionConditions',
  itemsTrigger: 'optionsTrigger',
  itemsDebounce: 'optionsDebounce',
  transformItems: 'transformOptions',
} as const

/**
 * Maps core makeItems prop names to PrimeVue option* prop names for aliasProps,
 * including group option keys.
 */
export const optionItemAliases = {
  ...flatOptionItemAliases,
  groupLabel: 'optionGroupLabel',
  groupChildren: 'optionGroupChildren',
  groupConditions: 'optionGroupConditions',
} as const
