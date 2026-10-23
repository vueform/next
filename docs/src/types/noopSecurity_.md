```ts
/**
 * The security surface used when the `security` module is not registered. The
 * module family's rule applies: an absent module means the feature is absent —
 * `validation` absent counts everything valid, `security` absent enforces
 * nothing. Two regimes:
 *
 * - **No configured intent**: fully permissive. HTML renders in every area
 *   (unsanitized — there is no engine), any component name resolves, requests
 *   are unrestricted, prop bags and persisted values pass through untouched.
 *   Deliberately omitting the module is the documented way to opt out of the
 *   protections wholesale — URL scheme checks and CSS containment included.
 *   (Prototype-key guards still apply — they are invariants, not policy — and
 *   slot HTML is inserted with the platform's own `innerHTML` semantics, so
 *   `<script>` elements stay inert regardless.)
 * - **Configured intent without the module**: every policy option defaults
 *   open, so for each of them — `allowHtml`, `allowComponents`,
 *   `allowOrigins`, `banAttrs`, `allowProps`, the ciphers — mere presence is
 *   the intent, `[]` and permissive spellings (`['*']`, `['**']`) included:
 *   whoever touches the policy cares about it. In development the surface
 *   stays permissive so the app remains workable, and `createVueform()`'s
 *   orphan-`$security`-options warning names the fix at startup. In
 *   production the same state **fails closed** instead — HTML escapes,
 *   components don't resolve, requests stay on the app's own origin, prop
 *   bags come back empty, prop references don't resolve, ciphers resolve
 *   `undefined` — and the misconfiguration can never ship looking enforced
 *   while it isn't.
 *
 * Normal operation is identical in both environments; only the misconfiguration
 * state differs.
 *
 * @param config The config of the instance the noop stands in for.
 */
function noopSecurity(config: VueformConfig): SecurityModule
```
