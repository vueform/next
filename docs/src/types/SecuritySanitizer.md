```ts
/**
 * The engine behind the security module's sanitize_ capability — a function
 * taking raw HTML and returning the safe output (e.g. the DOMPurify wrapper).
 * Engine slots are per-capability, never module-wide: a sanitizer knows nothing
 * about the module's other capabilities (like the encryption ciphers), and a
 * future externally-backed capability would get its own slot.
 */
type SecuritySanitizer = (html: string) => string
```
