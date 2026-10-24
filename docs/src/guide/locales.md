---
outline: [2,3]
---

# Locales

Vueform never hard-codes its own strings. Validation messages, wizard buttons, the file-picker caption, and screen-reader labels are all **tags** looked up in the active locale, so switching the locale re-translates every form on the spot. The same active locale also picks the right entry of every [locale map](/guide/translating-props) on your own props.

## Registering Locales

Vueform ships with the following locales, exported from `@vueform/ui/locales`:

<!-- #region available-locales -->

| Code | Name |
| --- | --- |
| `de_DE` | 🇩🇪 Deutsch |
| `en_US` | 🇺🇸 English |
| `hu_HU` | 🇭🇺 Magyar |

<!-- #endregion available-locales -->

The pre-configured entries (`@vueform/ui/origin` and `@vueform/ui/material`) register `en_US` and set it active. The `locales` config option **replaces** that map — it never adds to it — so to offer another language next to English, list both:

```ts
import { createVueform } from '@vueform/ui/origin'
import { en_US, de_DE } from '@vueform/ui/locales'

createVueform({
  locales: { en_US, de_DE },
  locale: 'de_DE',
})
```

`locale` names the active code, and an empty `locale` falls back to the first registered key. The pre-configured entries pre-set it to `'en_US'`, though — replace `locales` with a map that has no `en_US` and the active code points at nothing, leaving every built-in string as its raw tag. Set `locale` whenever `en_US` isn't in your map.

The bare `@vueform/ui` entry registers no locales and no `locale` module at all — see [code-splitting](/guide/code-splitting#locales) for the modular setup and [modules](/guide/modules#leaving-a-module-out) for what running without the module means (raw tags, plus a dev warning on locale switches).

The registered set is fixed when `createVueform()` runs, so pass every locale your app offers up front.

## Writing a Locale

A locale is a flat object of tag → string. The built-in tags fall into a handful of families — `rule_*` for validation messages, `steps_*` for wizard navigation, `file_*` for the file-picker button, `sr_*` for screen-reader labels, and `expression_error` for expression engine errors. All shipped locales share the same key set, so `en_US` is the reference when writing a new language.

The same object is how you override built-in wording app-wide — spread a shipped locale and replace the keys you want. Your own tags can live right next to the built-in ones:

```ts
import { createVueform } from '@vueform/ui/origin'
import { en_US } from '@vueform/ui/locales'

createVueform({
  locales: {
    en_US: {
      ...en_US,
      steps_next: 'Continue', // override a built-in tag
      welcome: 'Welcome, {name}!', // add your own
    },
  },
})
```

Overriding a tag changes the wording everywhere. Wording for a single form or element goes through props instead — [`nextLabel`](/guide/multi-page-forms#navigation-bar-options) for a wizard button, or `ruleMessages` for validation messages. How rule names map onto the `rule_*` tags, the typed `_string` / `_numeric` / `_array` / `_file` variants included, is [validation](/guide/validation#locale-tags)'s territory.

### Fallback Locale

A locale doesn't have to be complete. `fallbackLocale` (default `''`, meaning no fallback) is consulted for any tag the active locale lacks, which makes partial locales practical:

```ts
import { createVueform } from '@vueform/ui/origin'
import { en_US } from '@vueform/ui/locales'

const fr_FR = {
  steps_back: 'Retour',
  steps_next: 'Suivant',
  steps_finish: 'Terminer',
  file_button_text: 'Choisir un fichier',
}

createVueform({
  locales: { en_US, fr_FR },
  locale: 'fr_FR',
  fallbackLocale: 'en_US', // [!code highlight]
})
```

A tag resolves active locale → fallback locale → the raw tag string, and an empty-string translation counts as missing and falls through too. The same fallback serves the [locale maps](/guide/translating-props#the-resolution-chain) on your own props.

## Changing the Active Locale

`!useLocale` returns the locale module. Its `locale` is a writable computed ref of the active code, and `setLocale(code)` switches it (`set` is an alias):

```ts
import { useLocale } from '@vueform/ui'

const { locale, setLocale } = useLocale()

locale.value // 'en_US'
setLocale('de_DE')
```

A switch re-resolves every tag and locale map in every form immediately. Validation errors already on screen re-render in the new language without re-running a single rule — see [locale tags](/guide/validation#locale-tags).

The `locale` config option also accepts a `ref`, which keeps the source of truth outside Vueform — a Pinia store, a URL param. The binding is two-way, so writing the ref switches the locale and `setLocale()` writes back into your ref:

```ts
import { ref } from 'vue'
import { createVueform } from '@vueform/ui/origin'
import { en_US, de_DE } from '@vueform/ui/locales'

export const appLocale = ref('en_US')

createVueform({
  locales: { en_US, de_DE },
  locale: appLocale, // [!code highlight]
})
```

Outside a setup context — a store, a route guard — the same module is available as `vueform.useLocale()` on the [instance](/guide/vueform-instance#outside-a-setup-context), or by passing the instance to `useLocale(vueform)`. Inside [event handlers](/guide/event-handlers) and [dynamic prop](/guide/dynamic-props) functions, the received context carries it as `$locale`. On an SSR server the active locale lives on the instance, so a module-scope instance would share it across requests — see [cross-request state](/guide/ssr#cross-request-state).

## Translating in Your Code

The module's `t(tag, params?)` resolves a tag through the same active → fallback → raw-tag chain. Its `tag` argument is typed as `LocaleTag`, so built-in tag names autocomplete while any string is still accepted:

```ts
import { useLocale } from '@vueform/ui'

const { t } = useLocale()

t('steps_next') // 'Next'
t('welcome', { name: 'John' }) // 'Welcome, John!'
```

`tags` is the merged record of the fallback and active locales, and reads from it are reactive. To resolve locale maps in your own code, `localize` and `localizeObject` do what the props machinery does — [translating props](/guide/translating-props) covers them. The full member list is at [`useLocale`](/api/composables/useLocale).

### Parameters

`{name}` tokens in a tag's value are filled from `t()`'s second argument, as `welcome` above shows. A token with no matching param stays in the text as-is. To substitute on a string that isn't a tag, `replaceParams(msg, params)` does the same on its own.

The token syntax itself is the `localeParamPattern` config option (default `/\{(\w+)\}/g`). Its first capture group must yield the parameter name, and it always runs globally — other flags are dropped:

```ts
createVueform({
  localeParamPattern: /:(\w+)/g, // tokens look like :name
})
```

The pattern applies to every string, the shipped locales included — their `{attribute}`, `{min}`, and friends stop resolving under a different syntax unless you rewrite those locales to match.

## Custom Locale Backend

To route Vueform's strings through an i18n system your app already runs, replace the built-in translator wholesale with `$locale.adapter`. An adapter is a `LocaleAdapter` — a function receiving the merged locale options (`locales`, `locale` as a ref, `fallbackLocale`, `localeParamPattern`, plus any other `$locale` overrides) and returning the full `LocaleModule` surface: `locale`, `tags`, `locales`, `fallbackLocale`, `t`, `setLocale`, `set`, `replaceParams`, `localize`, and `localizeObject`.

```ts
import { computed, ref, unref } from 'vue'
import { createVueform } from '@vueform/ui/origin'
import type { LocaleAdapter } from '@vueform/ui'

const myAdapter: LocaleAdapter = (options) => {
  const current = ref(unref(options.locale) || '')
  const setLocale = (code: string) => { current.value = code }

  return {
    locale: computed({ get: () => current.value, set: setLocale }),
    tags: {}, // the merged fallback + active tag record
    locales: options.locales ?? {},
    fallbackLocale: options.fallbackLocale ?? '',
    t: (tag, params) => tag, // translate a tag, filling {param} tokens
    replaceParams: (msg, params) => msg, // substitute tokens in a plain string
    setLocale,
    set: setLocale,
    localize: (msg) => '', // resolve a locale map to a string
    localizeObject: (obj) => ({}), // resolve every value of a { key: localeMap } record
  }
}

createVueform({
  $locale: { adapter: myAdapter }, // [!code highlight]
})
```

Once installed, everything that reads strings goes through it — components, validation messages, the expression engine's error text, `useLocale()`, and `vueform.useLocale()` alike. The rest of the `$locale` keys mirror the top-level options for module-scoped overrides — see [configuration](/guide/configuration#internationalization).
