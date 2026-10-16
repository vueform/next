```ts
/**
 * Configuration for the checkbox name factory resolving the HTML name
 * attribute.
 */
type MakeCheckboxNameOptions = {
  props: {
    /**
     * Overrides the HTML `name` attribute for the checkbox input.
     */
    checkboxName: TProp | undefined
  }

  deps: ReturnsOf<[[typeof makeElement, ['container', 'path']]]>
}
```
