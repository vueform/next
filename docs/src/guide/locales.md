---
outline: [2,3]
---

# Locales

Locales translate the framework's own strings: validation errors, step buttons, screen-reader labels. A locale is a flat record of translation tags — keys like `rule_required_error` or `steps_next` mapping to translated text. Whenever Vueform displays a built-in string, it looks the tag up in the active locale; the same locale also drives which entry a [locale-keyed `TextProp`](/guide/translating-props) picks.

## Registering Locales

Vueform ships the following locales, exported from `@vueform/ui`:

<!-- #region available-locales -->

| Code | Name |
| --- | --- |
| `de_DE` | 🇩🇪 Deutsch |
| `en_US` | 🇺🇸 English |
| `hu_HU` | 🇭🇺 Magyar |

<!-- #endregion available-locales -->

The pre-configured entry (`@vueform/ui/origin`) registers `en_US` out of the box; pass more under `locales` and set the active one with `locale`:

```ts
import { createVueform } from '@vueform/ui/origin'
import { de_DE } from '@vueform/ui/locales'

createVueform({
  locales: { de_DE },
  locale: 'de_DE',
})
```

With the bare `@vueform/ui` entry, no locale is pre-registered — you provide every locale yourself and can leave out the ones you don't use. When only one locale is registered it becomes the active one automatically, no `locale` needed:

```ts
import { createVueform } from '@vueform/ui'
import { de_DE } from '@vueform/ui/locales'

createVueform({
  locales: { de_DE },
})
```

A locale is just a flat object, so writing your own means providing the tags in your language — start from a shipped one as a reference.

## Fallback Locale

`fallbackLocale` is consulted whenever a tag is missing from the active locale. That makes partial locales practical — override just the strings you care about and let everything else fall through:

```ts
import { createVueform } from '@vueform/ui'
import { en_US } from '@vueform/ui/locales'

const fr_FR = {
  steps_back: 'Retour',
  steps_next: 'Suivant',
  steps_finish: 'Terminer',
  rule_required_error: 'Le champ {attribute} est requis.',
}

createVueform({
  locales: { fr_FR, en_US },
  locale: 'fr_FR',
  fallbackLocale: 'en_US', // [!code highlight]
})
```

When a tag is missing from both the active and the fallback locale, the raw tag string is returned as-is.

## Changing the Active Locale

Read and switch the locale from anywhere with `useLocale` — `locale` is a reactive ref of the current code and `setLocale(code)` switches it, re-rendering every form:

```ts
import { useLocale } from '@vueform/ui'

const { locale, setLocale } = useLocale()

locale.value        // 'en_US'
setLocale('fr_FR')
```

Alternatively, the `locale` config option accepts a Vue `ref` instead of a string — pass one when the source of truth lives outside Vueform (a Pinia store, a URL param):

```ts
import { ref } from 'vue'
import { createVueform } from '@vueform/ui'
import { en_US } from '@vueform/ui/locales'

const locale = ref('en_US')

createVueform({
  locales: { en_US, fr_FR },
  locale, // [!code highlight]
})

locale.value = 'fr_FR'
```

## Extending or Overriding Tags

Locales are plain objects — spread one and override the keys you care about. The same trick registers custom tags for your own strings:

```ts
import { createVueform } from '@vueform/ui'
import { en_US } from '@vueform/ui/locales'

const en_US_custom = {
  ...en_US,
  steps_next: 'Continue',
  steps_finish: 'Submit',
  welcome_title: 'Welcome back',
}

createVueform({
  locales: { en_US: en_US_custom },
})
```

## Using Locale Tags

Look tags up from your own code through `useLocale`. `t(tag, params?)` resolves against the active locale with fallback, returning the tag itself when it's missing from both:

```ts
const { t, tags } = useLocale()

t('steps_next')   // resolved string
tags.steps_next   // reactive access to the merged fallback + active record
```

### Parameters

Tag values can contain `{placeholder}` tokens, substituted from `t()`'s second argument:

```ts
const en_US_custom = {
  ...en_US,
  welcome: 'Welcome, {name}!',
}

t('welcome', { name: 'John' })
t('rule_min_string_error', { attribute: 'Name', min: 5 })
```

The token pattern is the `localeParamPattern` config option (default `/\{(\w+)\}/g`). Swap it when your translation files follow a different convention — the regex's first capture group must yield the parameter name:

```ts
createVueform({
  localeParamPattern: /:(\w+)/g, // :name style
})
```

::: tip
Already running [Vue I18n](/plugins/vue-i18n)? Its plugin replaces Vueform's locale backend with your existing vue-i18n instance, so messages, the active locale, and parameter syntax all come from one place.
:::
