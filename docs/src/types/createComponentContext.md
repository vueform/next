```ts
/**
 * Creates and provides the component's public context: a proxy over the object
 * the component later hands to `defineExpose` (`toRaw(context)`) with Vue's
 * `proxyRefs` semantics — ref members read unwrapped and write through on
 * assignment — plus one rule of its own: a read of a member the blueprint has
 * not assigned yet subscribes to the context's readiness, so effects that saw a
 * half-built sibling (a list row reading another row's model through the
 * registry) re-run once the API is in place.
 *
 * Deliberately not `reactive()`: that would track a dependency per key on the
 * context itself for every property read in every render — a Dep and a Link per
 * key per component on top of the refs' own tracking, measured at +40–85% mount
 * time. The proxy answers Vue's `__v_raw` probe, so `isProxy`, `toRefs`, and
 * `toRaw` work; storing it in a `ref` yields Vue's deep view over the raw
 * object rather than this proxy, as with `shallowReactive`.
 *
 * `form$`, the modules, and the resolved `props` are available from the start.
 * Idempotent within a single setup: a second call on the same instance returns
 * the already-created context (needed when both `useBlueprint` / `useProps`
 * create the context).
 */
function createComponentContext(): UnknownComponent
```
