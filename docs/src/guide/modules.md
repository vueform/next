---
outline: [2,3]
---

# Modules

Everything Vueform does beyond its data layer — validation, conditions, HTTP, dates, locales, theming — is a **module**, an implementation the core looks up by key on the [Vueform instance](/guide/vueform-instance) instead of importing directly. The core only defines the interface each key must satisfy, so whatever is registered under a key is what runs. That makes modules dependency injection at the framework level, and the lever for two things — bundle size, because unused modules stay out of the build, and control, because any built-in behavior can be replaced without touching the rest.

## Registering Modules

The pre-configured entries — `@vueform/ui/origin` and `@vueform/ui/material` — register every built-in module, so there is nothing to do there. The bare `@vueform/ui` entry registers none, and you pass them under the `modules` config option yourself:

```ts
import { createVueform } from '@vueform/ui'
import { model, validation, conditions } from '@vueform/ui/modules'

createVueform({
  modules: { model, validation, conditions },
})
```

The rest of a bare setup — components, rules, adapters, and what each part costs — is covered in [code-splitting](/guide/code-splitting#modular-setup).

`modules` merges per key over the entry's set, so on a pre-configured entry passing one key replaces only that module and keeps every other built-in — the mechanism [swapping a module](#swapping-a-module) builds on.

Each module reads its options from a `$`-prefixed config key named after it — `$http`, `$conditions`, `$security`, and so on — listed in [configuration](/guide/configuration#module-options). A non-empty `$<name>` object in your config without a registered `<name>` module warns at `createVueform()` in development, since the options read as if they were in effect.

Modules are created once inside `createVueform()` onto `vueform.modules`, and `vueform.module()` can add one later until the instance is installed — see [two phases](/guide/vueform-instance#two-phases) and [registering after creation](/guide/vueform-instance#registering-after-creation).

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
| [`devtools`](/plugins/devtools) | A Vue DevTools form inspector, development-only | Nothing is tracked. |

`devtools` is the one module that isn't part of `@vueform/ui/modules` — it ships with the `@vueform/devtools` plugin, which registers it outside production.

## Leaving a Module Out

`model` is the one module Vueform can't run without, since every other module builds on the data layer. The bare entry's `createVueform` doesn't type-check a config without `modules.model`, and one that slips past TypeScript throws at `createVueform()`.

Every other module is optional, and a missing one never fails at `createVueform()`. Consumers read an inert stand-in in its place, so the outcome is one of two kinds, per the table's last column:

- Most degrade to "the feature isn't there" — conditions are met, everything is valid, strings stay literal. Where a config or prop shows clear intent — `rules` set, a `tokens` prop passed, a locale switch, history tracking turned on — development warns once.
- `http` and `date` have no sensible fallback, so they fail at the point of use. An `http` request rejects — getting the client never throws, so forms that never hit the network keep working — and `date` throws as soon as a date is needed.

`security` is the one exception where configuration changes the outcome, because a policy configured without the module fails closed in production — see [the security module](/guide/security#the-security-module).

## Adapters and Plugins

Some modules separate the feature from the engine behind it. The engine is a slot in the module's `$`-options, so you can change what powers a feature while the module, its consumers, and its types stay as they are. The slots come in three kinds:

- **Required engines** — [`$http.adapter`](/guide/http#switching-the-adapter), [`$date.adapter`](/guide/date#custom-adapters), and [`$expression.adapter`](/guide/expressions#the-expression-engine). These modules ship no default engine. The pre-configured entries wire `fetchHttpAdapter`, `nativeDateAdapter`, and `pathExpressionAdapter`, while a [bare setup](/guide/code-splitting#modular-setup) has to wire them itself. Without one, requests reject, dates throw, and expressions stay inert with a dev warning.
- **Replacement backends** — [`$locale.adapter`](/guide/locales#custom-locale-backend) and [`$router.adapter`](/guide/multi-page-forms#browser-history). These modules have a built-in implementation, and the adapter — a function from the module's options to the full module surface — replaces it wholesale.
- **Capability engines** — [`$security.sanitizer`](/guide/security#html-sanitization) and `$security.encrypt` / `decrypt`. None is built in. Without a sanitizer, HTML renders raw — silently while `allowHtml` is unset; with it set, with a dev warning in development and rendering empty in production.

A plugin's `config` hook runs before the modules are created, so a plugin can fill a slot — or register a whole module. [`@vueform/expr-eval`](/plugins/expr-eval) sets the expression engine, [`@vueform/dompurify`](/plugins/dompurify) sets `$security.sanitizer`, and [`@vueform/devtools`](/plugins/devtools) adds `modules.devtools` in development. The hook itself is covered in [plugins](/guide/plugins#extending-the-registries).

When an adapter slot covers your need, fill it instead of replacing the module — the slot swaps the engine while everything built around it keeps working.

## Reaching a Module

Inside components, use the module composables, which resolve the app's instance by injection — `useHttp()` returns an `HttpInstance` from the http module, `useLocale()` and `useSecurity()` return their module, and `useDate()` creates a `DateInstance`. Each module's chapter owns its usage. Outside a setup context, pass the instance explicitly (`useHttp(vueform)`) or use `vueform.$http` / `$locale` / `$date` — see [outside a setup context](/guide/vueform-instance#outside-a-setup-context).

Every module also has a doorway function — `getConditionsModule(vueform?)`, `getLocaleModule(vueform?)`, and so on, exported from `@vueform/ui` — returning the registered module or its inert stand-in. `getDateModule` and `getModelModule` throw instead, since those two have no stand-in. The matching `has<Name>Module(vueform?)` tells whether one is registered, which is the check for code that should behave differently when a capability is absent — custom elements, plugins.

Raw access is `vueform.modules.<name>` (`useVueformContext().modules.<name>` in a component), which is `undefined` for unregistered modules.

## Swapping a Module

A module definition is a plain object with a `create` function and optional [`install` and `getCSS` hooks](#authoring-a-module), typed as `VueformModule<T>`. `create({ vueform })` runs once per `createVueform()`, and its return value becomes `vueform.modules.<key>`. Consumers only ever reach the module through that key, so any object satisfying the key's interface — `ConditionsModule`, `HttpModule`, `LocaleModule`, … — is a drop-in replacement:

```ts
import { createVueform } from '@vueform/ui/origin'
import type { LocaleModule } from '@vueform/ui'

createVueform({
  modules: {
    locale: {
      create: ({ vueform }): LocaleModule =>
        createMyLocale(vueform.config.$locale),
    },
  },
})
```

Because `modules` merges per key, only `locale` is replaced here — every other built-in of `@vueform/ui/origin` stays registered. Inside `create`, the resolved config is `vueform.config` and the module's own options are `vueform.config.$<name>`.

To change a single member instead of the whole surface, delegate to the built-in. Import its definition from `@vueform/ui/modules`, call its `create`, and override on the result:

```ts
import { createVueform } from '@vueform/ui/origin'
import { locale } from '@vueform/ui/modules'

createVueform({
  modules: {
    locale: {
      create: (ctx) => {
        const original = locale.create(ctx)
        const t = original.t

        original.t = (tag, params) => {
          trackTranslation(tag)
          return t(tag, params)
        }

        return original
      },
    },
  },
})
```

Override on the returned object rather than spreading it into a new one — some surfaces expose getters (the locale module's `tags`), and a spread freezes them to their current value.

A module that depends on another resolves it at call time with `get<Name>Module(vueform)`, never inside `create`. Modules are created in key order, so anything read in `create` may not exist yet, while call-time lookups make registration order irrelevant. A definition without a `create` function throws at `createVueform()`.

## Authoring a Module

A brand-new capability needs the parts every built-in has:

- **Interface** — a type describing what `create` returns. This is the surface consumers program against.
- **Typing** — three interfaces augmented through `declare module`. `VueformModules` types the registration key, `VueformInstanceModules` types `vueform.modules.<key>`, and `VueformConfig` types the `$`-options (the user-facing config derives from it):

  ```ts
  import type { VueformModule } from '@vueform/ui'
  import type { AnalyticsModule, AnalyticsModuleOptions } from './analytics'

  declare module '@vueform/core' {
    interface VueformModules {
      analytics?: VueformModule<AnalyticsModule>
    }

    interface VueformInstanceModules {
      analytics?: AnalyticsModule
    }

    interface VueformConfig {
      $analytics: AnalyticsModuleOptions
    }
  }
  ```

- **Options key** — name it `$<key>` after the module. Every `$`-prefixed config key counts as a module options bag, which is what makes the [orphan-options warning](#registering-modules) work for custom modules too.
- **Doorway and stand-in** — a `getAnalyticsModule` / `hasAnalyticsModule` pair plus an inert stand-in the getter serves when the module is absent (or a throw, when no fallback makes sense), and optionally a composable.

Two optional hooks run on the app side. `install({ app, vueform })` runs at `app.use()` — the theme module injects its styles there, and devtools sets up its inspector. `getCSS({ vueform })` contributes CSS to `vueform.getCSS()` and `getStyleTag()` — see [styles on the server](/guide/vueform-instance#styles-on-the-server).

For a working reference, most folders in [`packages/core/src/modules`](https://github.com/vueform/next/tree/main/packages/core/src/modules) follow the same layout — `definition.ts`, `create*.ts`, `module.ts` for the doorway, `types.ts`, and `noop.ts` where the module degrades.
