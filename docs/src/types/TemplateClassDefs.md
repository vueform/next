```ts
/**
 * A class definition object, or a factory receiving the host's public context
 * and prop refs. Factories are invoked lazily on first class-key access and
 * re-run reactively.
 */
type TemplateClassDefs<T extends ComponentNames> =
  | TemplateClasses<T>
  | ((
      context$: ContextOf<T>,
      propRefs: TemplatePropRefs<T>
    ) => TemplateClasses<T>)
```
