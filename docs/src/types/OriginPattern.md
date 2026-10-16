```ts
/**
 * A parsed wildcard `allowOrigins` entry. Exactly two forms compile:
 * `scheme://*.host` (any subdomain, at any depth — never the apex host itself)
 * and `scheme://host:*` (that exact host on any port). A wildcard never widens
 * the scheme.
 */
interface OriginPattern {
  protocol: string
  host: string
  anySub: boolean
  anyPort: boolean
  port: string
}
```
