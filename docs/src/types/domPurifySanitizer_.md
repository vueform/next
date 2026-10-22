```ts
/**
 * Builds the DOMPurify-backed sanitizer for the security module's sanitize
 * capability (`$security.sanitizer`).
 */
function domPurifySanitizer(
  sanitizeInit: (dp: typeof DOMPurify) => typeof DOMPurify,
  sanitizeOptions: Record<string, any>
): SecuritySanitizer
```
