```ts
/**
 * The call signature a part's aggregate binding resolves with: the parameters
 * of its first functional ASPECT member (modifiers, a11y, classes — the
 * symmetry doctrine makes them identical), or `never` when the key is static.
 *
 * Deliberately ignores the part member: the runtime decides a key's mode from
 * the registered aspect definitions (part overrides are dual-surface wrappers
 * that cannot signal it), so deriving the typed mode from the same surfaces
 * keeps types and runtime equal by construction. A functional part key with
 * no functional aspect member types as a static bag — calling it is a type
 * error, which is the compiler telling you to add the backing definition.
 */
type BindingArgsOf<P, C, M, A> = M extends (...args: infer R) => any
  ? R
  : A extends (...args: infer R) => any
    ? R
    : C extends (...args: infer R) => any
      ? R
      : never
```
