```ts
/**
 * The module surface's cipher shape: an app-provided `SecurityCipher`, the
 * identity passthrough, or the fail-closed cipher, which resolves `undefined`
 * so the consuming feature treats the value as unpersistable / unreadable
 * (a half-configured pair in production, or configured ciphers without the
 * module).
 */
type SecurityModuleCipher = (
  value: string,
  purpose: string
) => string | undefined | Promise<string | undefined>
```
