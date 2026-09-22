```ts
/**
 * Wrap a PrimeVue (VDOM / Options API) component so it can be used safely from
 * vapor-compiled Vueform SFCs.
 *
 * In the main (VDOM) build this is a no-op and returns `component` unchanged —
 * no extra instance layer. In the vapor build / vapor playground / vapor tests
 * (`__VUEFORM_VAPOR__`) it returns a VDOM `defineComponent` + `h()` host: vapor
 * interop mounts the bridge, and the bridge renders PrimeVue in a pure VDOM
 * tree where props, events, slots, and instance methods work normally.
 *
 * Direct vapor → PrimeVue nesting has known interop gaps: props from Options
 * API `extends` chains (e.g. `fluid`) fall through as DOM attributes, some
 * components render as `<!--[object Object]-->`, and tags like `<Button>` /
 * `<Select>` collide with HTML elements under Vapor's case-insensitive check.
 *
 * Parent template refs receive a Proxy of the inner PrimeVue instance so calls
 * like `input.value.show()` keep working. The proxy is marked `__v_skip` so
 * Vue's reactivity traverse does not walk the Options API instance graph (which
 * is circular and overflows the stack).
 *
 * Template aliases such as `VdomPrimeSelect` still resolve correctly in VDOM
 * mode — resolution uses the script binding, not `component.name`.
 */
function vdomPrime<C extends Component>(
  component: C,
  name = `Pv${componentName(component)}`
): C
```
