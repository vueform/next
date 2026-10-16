```ts
/**
 * PrimeVue AutoComplete events and slots to forward from the Vueform adapter to
 * the underlying PrimeVue component.
 */
const forwards: {
  readonly events: readonly [
    'value-change',
    'option-select',
    'option-unselect',
    'dropdown-click',
    'clear',
    'before-show',
    'before-hide',
    'show',
    'hide',
  ]
  readonly slots: readonly [
    'chip',
    'header',
    'footer',
    'option',
    'optiongroup',
    'content',
    'loader',
    'empty',
    'dropdownicon',
    'chipicon',
    'clearicon',
    'dropdown',
  ]
}
```
