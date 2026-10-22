```ts
/**
 * An app-provided encryption or decryption function. Receives the value and a
 * purpose tag identifying the call site (e.g. `'draft'`), so one
 * implementation can serve every feature that encrypts — branching per purpose
 * if it ever needs to. May be async (Web Crypto).
 */
type SecurityCipher = (
  value: string,
  purpose: string
) => string | Promise<string>
```
