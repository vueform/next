# Plugins

Plugins extend a Vueform app with capabilities the core leaves out — an expression evaluator, an HTML sanitizer, date and HTTP adapters. Most wrap a heavier third-party library, so they're opt-in, registered once via `plugins` in `createVueform()`, and features like dates come in several flavors so Vueform can **reuse** the library your app already ships instead of adding another one. Each plugin has its own page with installation and configuration. Plugins marked *coming soon* are planned but not published yet.

<div class="plugin-index">

## Date

Date adapters replace the built-in native adapter, adding custom format parsing and locale-aware formatting — see the [date](/guide/date) guide.

| Plugin | Description |
| --- | --- |
| [`@vueform/luxon`](/plugins/luxon) | Luxon date adapter for parsing, formatting, and manipulating dates. *(coming soon)* |
| [`@vueform/date-fns`](/plugins/date-fns) | date-fns date adapter for parsing, formatting, and manipulating dates. *(coming soon)* |
| [`@vueform/dayjs`](/plugins/dayjs) | Day.js date adapter for parsing, formatting, and manipulating dates. *(coming soon)* |

## Debugging

Development-only tooling that surfaces mounted forms and their live state in Vue DevTools.

| Plugin | Description |
| --- | --- |
| [`@vueform/devtools`](/plugins/devtools) | Vue DevTools form inspector (development-only, dropped from production builds). |

## Expression

Expression engines evaluate the `{...}` expressions in props, computed values, and conditions — see the [expressions](/guide/expressions) guide.

| Plugin | Description |
| --- | --- |
| [`@vueform/expr-eval`](/plugins/expr-eval) | Expression evaluator for conditions and computed values. |

## HTTP

HTTP adapters replace the built-in fetch adapter behind form submits, uploads, and remote requests — see the [http](/guide/http) guide.

| Plugin | Description |
| --- | --- |
| [`@vueform/axios`](/plugins/axios) | Axios HTTP adapter. *(coming soon)* |
| [`@vueform/ofetch`](/plugins/ofetch) | ofetch HTTP adapter. *(coming soon)* |

## I18n

I18n bridges connect Vueform's locale system to the app's translation library — see the [locales](/guide/locales) guide.

| Plugin | Description |
| --- | --- |
| [`@vueform/vue-i18n`](/plugins/vue-i18n) | Connects Vueform's locale system to vue-i18n. *(coming soon)* |

## Security

Sanitize engines clean HTML before the areas the security policy allows render it — see the [security](/guide/security) guide.

| Plugin | Description |
| --- | --- |
| [`@vueform/dompurify`](/plugins/dompurify) | DOMPurify-backed HTML sanitization. |

</div>
