```ts
/**
 * A Vue component extended with Vueform-specific options (`name` and
 * `element`).
 *
 * Besides Vue's `Component`, this also admits plain call signatures: generic
 * `<script setup>` SFCs compile to a function type whose `ctx` parameter is
 * narrower than `FunctionalComponent`'s, so they never match `Component`
 * structurally even though they are valid components at runtime.
 */
type VueformComponent = (
  Component<any, any, any> | ((props: any, ctx?: any, ...args: any[]) => any)
) & {
  /**
   * Whether the component is a form element (participates in form data and
   * validation).
   */
  element?: boolean

  /**
   * Whether the element supports `default`-value expression tracking (template
   * strings like `'{other} …'` that resolve from the model and auto-update).
   */
  expressionable?: boolean

  /**
   * Model metadata: returns the element's null (empty) value derived from its
   * raw schema-entry props. Used by `useModel`'s schema walk to build the model
   * without mounting components.
   *
   * @param props The element's raw schema-entry props.
   */
  nullValue?: (props: Record<string, any>) => any

  /**
   * Model metadata: returns a container element's unified child structure
   * (`ModelChildren`) derived from its raw schema-entry props. Leaf elements
   * omit it.
   *
   * @param props The element's raw schema-entry props.
   */
  children?: (props: Record<string, any>) =>
    | {
        flat?: boolean
        array?: boolean
        entries: Record<string, Record<string, any>>
      }
    | undefined
}
```
