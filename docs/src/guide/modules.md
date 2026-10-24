---
outline: [2,3]
---

# Modules

Everything Vueform does beyond its data layer — validation, conditions, HTTP, dates, locales, theming — is a **module**, an implementation the core looks up by key on the [Vueform Instance](/guide/vueform-instance) instead of importing directly. The core only defines the interface each key must satisfy, so whatever is registered under a key is what runs. That makes modules dependency injection at the framework level, and the lever for two things — bundle size, because unused modules stay out of the build, and control, because any built-in behavior can be replaced without touching the rest.

## Registering Modules

The [pre-configured entries](/guide/code-splitting#pre-configured-entries) (e.g. `@vueform/ui/origin`) register every built-in module, so there is nothing to do there. The bare `@vueform/ui` entry in [modular setup](/guide/code-splitting#modular-setup) registers none, and you pass them under the `modules` config option yourself:

```ts
import { createVueform } from '@vueform/ui'
import { model, validation, conditions } from '@vueform/ui/modules'

createVueform({
  modules: { model, validation, conditions },
})
```

The rest of a bare setup — components, rules, adapters, and what each part costs — is covered in [code-splitting](/guide/code-splitting#modular-setup).

`modules` merges per key over the entry's set, so on a pre-configured entry passing one key replaces only that module and keeps every other built-in — the mechanism [swapping a module](/guide/in-depth-modules#swapping-a-module) builds on.

Each module reads its options from a `$`-prefixed config key named after it — `$http`, `$conditions`, `$security`, and so on — listed in [configuration](/guide/configuration#module-options). A non-empty `$<name>` object in your config without a registered `<name>` module warns in development, since the options read as if they were in effect.

## The Built-in Modules

Most modules are documented where their feature lives, so the table links each one to its home:

| Module | Provides | Without it |
| --- | --- | --- |
| [`model`](/guide/model) | The form data layer | Required — see [leaving a module out](#leaving-a-module-out). |
| [`validation`](/guide/validation) | Rules and validators | Everything counts as valid — warns once in dev when an element has `rules`. |
| [`conditions`](/guide/conditions) | Conditional availability and conditional props | Every condition counts as met. |
| [`expression`](/guide/expressions) | `{...}` templates and expression conditions | Strings pass through as literal text — warns once in dev when a feature needs an engine. |
| [`autosave`](/guide/autosave) | Remote autosave and local drafts | The `autosave` and `draft` props have no effect (warns once in dev), and the form's autosave and draft methods no-op. |
| [`http`](/guide/http) | Network requests | Every request rejects with a "not registered" error. |
| [`date`](/guide/date) | Date parsing and comparison | `useDate()`, date conditions, date rules, and date expression functions throw. |
| [`locale`](/guide/locales) | Framework strings and localization | Built-in strings show their raw tags, locale maps fall back to their first entry, and switching the locale warns in dev. |
| [`theme`](/guide/themes-tokens) | Token CSS generation, injection, and dark mode | No token CSS is generated or injected — a `tokens` prop warns once in dev. |
| [`router`](/guide/multi-page-forms#browser-history) | Browser-history sync for multi-page forms | Navigation doesn't touch the URL — warns once in dev when history tracking is enabled. |
| [`security`](/guide/security) | HTML/component gating, sanitization, origin policy, ciphers | Nothing is enforced — see [the security module](/guide/security#the-security-module). |

## Leaving a Module Out

`model` is the one module Vueform can't run without, since every other module builds on the data layer. The [bare entry](/guide/code-splitting#modular-setup)'s `!createVueform` doesn't type-check a config without `modules.model` and throws at runtime.

**Every other module is optional**, and a missing one never breaks the code. Consumers read an inert stand-in in its place, so the outcome is one of two kinds, per the table's last column:

- Most degrade to "the feature isn't there" — conditions are met, everything is valid, strings stay literal. Where a config or prop shows clear intent — `rules` set, a `tokens` prop passed, a locale switch, history tracking turned on — development warns once.
- `http` and `date` have no sensible fallback, so they fail at the point of use. An `http` request rejects — getting the client never throws, so forms that never hit the network keep working — and `date` throws as soon as a date is needed.

`security` is the one exception where configuration changes the outcome, because a policy configured without the module fails closed in production — see [the security module](/guide/security#the-security-module).

Replacing a module's engine, swapping one out, or writing your own is covered in [In-Depth Modules](/guide/in-depth-modules).
