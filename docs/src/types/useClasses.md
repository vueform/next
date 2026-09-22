```ts
/**
 * Registers class definitions on the nearest Vueform component from a custom
 * template or slot. A key you set **replaces** the component's own value for
 * that key (the last definition wins per key); keys you leave out keep the
 * component's value. The result still resolves through the regular chain, so
 * user `classes` / `reclass` props, defaults, and presets apply on top. Keys
 * the component doesn't define (e.g. an `icon` node only the template renders)
 * are accepted and resolve the same way.
 *
 * Returns the host's `context.classes` proxy, typed with the built-in keys plus
 * the keys the definitions introduce — so the template can bind its own keys
 * type-safely without augmenting the component's `Classes` interface.
 *
 * @param name The host component name, used for type inference.
 * @param defs Class definition objects or factories over the host context.
 */
function useClasses<T extends ComponentNames, D extends TemplateClassDefs<T>[]>(
  name: T,
  ...defs: D
): TemplateClassesOf<T, D>
```
