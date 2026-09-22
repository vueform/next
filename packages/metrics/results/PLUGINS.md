# Bundle size — `plugins`

Generated at 2026-09-16T09:15:19.555Z. Sizes are the emitted JS assets of a production Vite build with default settings (esbuild minification, no custom config), measured as deltas against a baseline (full @vueform/ui build with every element, no plugins).

Measured with:

- Node v26.8.2
- `pnpm@10.20.0`
- `vue@3.5.42`
- `vite@6.4.3`
- `@vueform/core@2.0.0`
- `@vueform/ui@2.0.0`

## How to interpret results

- **Vueform**: the plugin's own code. If your project already uses the third-party dependency listed under **Deps**, this is all the plugin adds.
- **Third-party**: the dependency itself, built into the same app on its own, without the Vueform plugin.
- **Total**: Vueform + Third-party — what the plugin adds if the dependency is not already in your project.

<details open>
<summary><h3>Gzip</h3></summary>

| Plugin | Vueform | Third-party | Total | Deps |
| --- | --- | --- | --- | --- |
| [`@vueform/dompurify@2.0.0`](https://github.com/vueform/dompurify) | 0.15&nbsp;kB | 11.17&nbsp;kB | 11.32&nbsp;kB | [`isomorphic-dompurify@3.19.0`](https://www.npmjs.com/package/isomorphic-dompurify) |
| [`@vueform/expr-eval@2.0.0`](https://github.com/vueform/expr-eval) | 2.52&nbsp;kB | 7.72&nbsp;kB | 10.24&nbsp;kB | [`expr-eval-fork@3.0.3`](https://www.npmjs.com/package/expr-eval-fork) |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Plugin | Vueform | Third-party | Total | Deps |
| --- | --- | --- | --- | --- |
| [`@vueform/dompurify@2.0.0`](https://github.com/vueform/dompurify) | 0.30&nbsp;kB | 9.55&nbsp;kB | 9.85&nbsp;kB | [`isomorphic-dompurify@3.19.0`](https://www.npmjs.com/package/isomorphic-dompurify) |
| [`@vueform/expr-eval@2.0.0`](https://github.com/vueform/expr-eval) | 2.02&nbsp;kB | 6.68&nbsp;kB | 8.71&nbsp;kB | [`expr-eval-fork@3.0.3`](https://www.npmjs.com/package/expr-eval-fork) |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Plugin | Vueform | Third-party | Total | Deps |
| --- | --- | --- | --- | --- |
| [`@vueform/dompurify@2.0.0`](https://github.com/vueform/dompurify) | 0.37&nbsp;kB | 29.56&nbsp;kB | 29.93&nbsp;kB | [`isomorphic-dompurify@3.19.0`](https://www.npmjs.com/package/isomorphic-dompurify) |
| [`@vueform/expr-eval@2.0.0`](https://github.com/vueform/expr-eval) | 6.60&nbsp;kB | 26.41&nbsp;kB | 33.01&nbsp;kB | [`expr-eval-fork@3.0.3`](https://www.npmjs.com/package/expr-eval-fork) |

</details>
