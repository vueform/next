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
 * - **Configured intent without the module** (`allowHtml`, `allowComponents`,
 *   `allowOrigins` entries, `banAttrs`, `safePropRefs`, ciphers — a config
 *   that reads like
 *   policy): in development the surface stays permissive so the app remains
 *   workable, and `createVueform()`'s orphan-`$security`-options warning names
 *   the fix at startup. In production the same state **fails closed** instead —
 *   HTML escapes, components don't resolve, requests are blocked, prop bags
 *   come back empty, ciphers throw — and the misconfiguration can never ship
 *   looking enforced while it isn't. (`allowOrigins: ['*']` is not intent to
 *   restrict: permissive behavior is exactly its configured semantics.)
 *
 * Normal operation is identical in both environments; only the misconfiguration
 * state differs.
 *
 * @param config The config of the instance the noop stands in for.
 */
function noopSecurity(config: VueformConfig): SecurityModule
```
