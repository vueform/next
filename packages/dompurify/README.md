# DOMPurify Plugin

Official `dompurify` plugin for Vueform.

## Bundle Size

<!--@size-start-->

Generated at 2026-10-18T05:35:15.438Z. Sizes are the emitted JS assets of a production Vite build with default settings (esbuild minification, no custom config), measured as deltas against a baseline (full @vueform/ui build with every element, no plugins).

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
| [`@vueform/dompurify@2.0.0-0.7`](https://github.com/vueform/dompurify) | 0.12&nbsp;kB | 10.23&nbsp;kB | 10.36&nbsp;kB | [`isomorphic-dompurify@3.23.0`](https://www.npmjs.com/package/isomorphic-dompurify) |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Plugin | Vueform | Third-party | Total | Deps |
| --- | --- | --- | --- | --- |
| [`@vueform/dompurify@2.0.0-0.7`](https://github.com/vueform/dompurify) | 0.26&nbsp;kB | 8.80&nbsp;kB | 9.06&nbsp;kB | [`isomorphic-dompurify@3.23.0`](https://www.npmjs.com/package/isomorphic-dompurify) |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Plugin | Vueform | Third-party | Total | Deps |
| --- | --- | --- | --- | --- |
| [`@vueform/dompurify@2.0.0-0.7`](https://github.com/vueform/dompurify) | 0.36&nbsp;kB | 26.95&nbsp;kB | 27.31&nbsp;kB | [`isomorphic-dompurify@3.23.0`](https://www.npmjs.com/package/isomorphic-dompurify) |

</details>

<!--@size-end-->