# DevTools

<div class="api-meta">

|  |  |
| --- | --- |
| **Category** | [Debugging](/plugins/#debugging) |
| **Dependencies** | <!-- @plugin:deps -->[`@vue/devtools-api`](https://www.npmjs.com/package/@vue/devtools-api)<!-- /@plugin:deps --> |
| **Bundle size** | <!-- @size:plugin -->0.08 kB<!-- /@size --> |

</div>

Vue DevTools form inspector plugin for Vueform (development-only).

## Installation

::: code-group

```bash [npm]
npm install -D @vueform/devtools
```

```bash [pnpm]
pnpm add -D @vueform/devtools
```

```bash [yarn]
yarn add -D @vueform/devtools
```

```bash [bun]
bun add -D @vueform/devtools
```

:::

```ts
import { createVueform } from '@vueform/ui'
import devtools from '@vueform/devtools'

createVueform({
  plugins: [devtools()], // [!code highlight]
})
```

## Usage

Registering the plugin adds a [Vueform inspector](/guide/model#DevTools) to Vue DevTools. Every mounted form appears in it with its element tree and live state — model, errors, dirty/invalid/validated flags, submit results — refreshing as the form changes.

<img class="light-only" src="/images/devtools-light.webp" alt="The Vueform inspector in Vue DevTools, with a form tree on the left and the selected element's data and state on the right." />
<img class="dark-only" src="/images/devtools-dark.webp" alt="The Vueform inspector in Vue DevTools, with a form tree on the left and the selected element's data and state on the right." />

The plugin is development-only by design. Production builds drop the module — the inspector and `@vue/devtools-api` included — from the bundle entirely, so it's safe to register unconditionally. To turn the inspector off in development too, set `devtools: false` in the config.

## Source

[packages/devtools](https://github.com/vueform/next/tree/main/packages/devtools)
