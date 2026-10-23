# Adversarial tests only

This folder holds **adversarial tests exclusively** — tests whose subject is hostile, malformed, or untrusted input, an abuse path, or a leak/containment guarantee. Every test simulates an attack (or pins a defense against one) and its docblock names the threat and the measure. This rule is strict: a test that doesn't qualify does not belong here, even when it exercises the `security` module.

A test belongs here when its subject is one of:

- **Hostile input** — crafted schemas, breakout payloads, smuggled URL schemes, polluted prototypes, forged or malformed server responses, tampered storage, ReDoS values.
- **An abuse path** — reaching a sink or capability the attacker shouldn't (component mounting, HTML rendering, prop reads, cross-origin requests, storage keys).
- **Leak containment** — credentials, sensitive values, or internal state never reaching logs, disk, the wire, or rendered output.
- **A fail-closed behavior** that stops any of the above.

A minimal positive control is allowed **only** as the counterpart of a containment assertion (proving the defense doesn't over-block or that a deny test isn't passing vacuously).

Everything else lives elsewhere, even when it concerns the security module:

- Option semantics, pattern grammars, configuration fidelity, opt-out contracts, DX warnings → `tests/integration/modules/security.test.ts`
- The no-module regime (noop surface, orphan-option warnings, production fail-closed semantics of misconfiguration) → `tests/integration/modules/security-noop.test.ts`
- Cipher/draft feature behavior → `tests/integration/modules/draft-ciphers.test.ts`
- CSP nonce plumbing (a deployment guarantee, not an attack surface) → `tests/integration/presentation/csp-nonce.test.ts`
- Validation-rule mechanics → the rule's own suite in `tests/integration/rules/`

The docs link this folder as the proof behind the security chapter's guarantees (`docs/src/guide/security.md`), so keeping it purely adversarial is a documentation contract, not just housekeeping.
