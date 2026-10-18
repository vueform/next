# DevTools Plugin

Official Vue DevTools plugin for Vueform: a **Vueform** inspector listing every mounted form with its elements and their live data, state, and validation.

Development-only by design: production builds resolve the package's `production` export condition to an inert stub, so the implementation never enters the module graph, and bundlers without condition support fall back to an inline `NODE_ENV` guard. In development the inspector (and `@vue/devtools-api`, the **Third-party** column below) loads lazily as its own chunk. What a production bundle pays for the plugin is the **Vueform** column: effectively nothing.

## Bundle Size

<!--@size-start-->

Generated at 2026-10-18T05:35:13.775Z. Sizes are the emitted JS assets of a production Vite build with default settings (esbuild minification, no custom config), measured as deltas against a baseline (full @vueform/ui build with every element, no plugins).

Measured with:

- Node v26.8.2
- `pnpm@10.20.0`
- `vue@3.5.43`
- `vite@8.3.2`
- `@vueform/core@2.0.0-0.7`
- `@vueform/ui@2.0.0-0.7`

## How to interpret results

- **Vueform**: the plugin's own code. If your project already uses the third-party dependency listed under **Deps**, this is all the plugin adds.
- **Third-party**: the dependency itself, built into the same app on its own, without the Vueform plugin.
- **Total**: Vueform + Third-party — what the plugin adds if the dependency is not already in your project.

<details open>
<summary><h3>Gzip</h3></summary>

| Plugin | Vueform | Third-party | Total | Deps |
| --- | --- | --- | --- | --- |
| [`@vueform/devtools@2.0.0-0.7`](https://github.com/vueform/devtools) | -19.24&nbsp;kB | 19.33&nbsp;kB | 0.08&nbsp;kB | [`@vue/devtools-api@7.7.10`](https://www.npmjs.com/package/@vue/devtools-api) |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Plugin | Vueform | Third-party | Total | Deps |
| --- | --- | --- | --- | --- |
| [`@vueform/devtools@2.0.0-0.7`](https://github.com/vueform/devtools) | -14.97&nbsp;kB | 15.04&nbsp;kB | 0.07&nbsp;kB | [`@vue/devtools-api@7.7.10`](https://www.npmjs.com/package/@vue/devtools-api) |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Plugin | Vueform | Third-party | Total | Deps |
| --- | --- | --- | --- | --- |
| [`@vueform/devtools@2.0.0-0.7`](https://github.com/vueform/devtools) | -54.94&nbsp;kB | 55.16&nbsp;kB | 0.22&nbsp;kB | [`@vue/devtools-api@7.7.10`](https://www.npmjs.com/package/@vue/devtools-api) |

</details>

<!--@size-end-->
