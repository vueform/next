# DOMPurify

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | [Security](/plugins/#security) |
| **Dependencies** | <!-- @plugin:deps -->[`isomorphic-dompurify`](https://www.npmjs.com/package/isomorphic-dompurify)<!-- /@plugin:deps --> |
| **Bundle size** | <!-- @size:plugin -->0.12 kB *(10.36 kB with 3rd party deps)*<!-- /@size --> |

</div>

Isomorphic DOMPurify wrapper used by Vueform for HTML sanitization.

## Installation

::: code-group

```bash [npm]
npm install @vueform/dompurify
```

```bash [pnpm]
pnpm add @vueform/dompurify
```

```bash [yarn]
yarn add @vueform/dompurify
```

```bash [bun]
bun add @vueform/dompurify
```

:::

```ts
import { createVueform } from '@vueform/ui'
import dompurify from '@vueform/dompurify'

createVueform({
  plugins: [dompurify()], // [!code highlight]
})
```

## Usage

Registering the plugin installs DOMPurify as the [security module](/guide/security#the-security-module)'s sanitize engine ([`$security.sanitizer`](/guide/configuration#security)) — HTML rendered in the areas the security policy allows passes through it from then on. A `sanitizer` already set in the config wins over the plugin. The policy itself — which areas may render HTML and the rest of the `$security` options — is documented in the [Security](/guide/security) guide.

Two `$security` options, available only with this plugin, configure the engine:

```ts
createVueform({
  plugins: [dompurify()],
  $security: {
    sanitizeOptions: { ALLOWED_TAGS: ['b', 'i', 'a'] },
    sanitizeInit: (DOMPurify) => {
      DOMPurify.addHook('afterSanitizeAttributes', (node) => { /* ... */ })
      return DOMPurify
    },
  },
})
```

| Option | Description |
| --- | --- |
| `sanitizeOptions` | Passed directly to `DOMPurify.sanitize()` as the config object. |
| `sanitizeInit` | Receives the DOMPurify instance before first use — add hooks, set global config. |

## Source

[packages/dompurify](https://github.com/vueform/next/tree/main/packages/dompurify)
