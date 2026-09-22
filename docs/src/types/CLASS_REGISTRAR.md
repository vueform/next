```ts
/**
 * Symbol key under which a component's exposed context carries its class
 * registrar. Lets `useClasses()` called from a custom template or slot add
 * class definitions to the host component without the registrar becoming part
 * of the public context surface.
 */
const CLASS_REGISTRAR: typeof CLASS_REGISTRAR
```
