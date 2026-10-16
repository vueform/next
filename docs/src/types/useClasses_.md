```ts
/**
 * Registers class definitions on the nearest Vueform component from a custom
 * template or slot. A key you set replaces the component's own value for that
 * key; keys you leave out keep the component's value. Returns the host's
 * classes object, typed with the built-in keys plus the keys the definitions
 * introduce.
 *
 * @param name The host component name, used for type inference.
 * @param defs Class definition objects or factories over the host context.
 */
function useClasses<T extends ComponentNames, D extends TemplateClassDefs<T>[]>(
  name: T,
  ...defs: D
): TemplateClassesOf<T, D>
```
