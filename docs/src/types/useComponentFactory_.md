```ts
/**
 * A factory for components built from schema data. Setup-only; the returned
 * makers are callable anywhere later.
 */
function useComponentFactory(): {
  /**
   * Resolves the component a schema entry renders as: an explicit `component`
   * when allowed, otherwise the `Vf*` element derived from the type. Returns
   * `undefined` when neither resolves.
   *
   * @param schema The schema entry (its `component` key is consulted).
   * @param type The element type deriving the `Vf*` fallback; defaults to the
   *   schema's own `type`.
   */
  makeFromSchema: (
    schema: Record<string, any> | undefined,
    type?: string | undefined
  ) => string | Component | undefined

  /**
   * Creates a functional component rendering one schema string as slot/cell
   * content, resolving expressions and sanitizing HTML. Plain text renders as a
   * bare text node; HTML renders only when the area allows it.
   *
   * @param raw The schema string to render.
   * @param options The rendering options (HTML area, expression key).
   */
  makeFromString: (
    raw: string,
    options: FromStringOptions
  ) => FunctionalComponent
}
```
