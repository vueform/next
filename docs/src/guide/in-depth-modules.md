---
outline: [2,3]
---

# In-Depth Modules

Every Vueform capability is a [module](/guide/modules) the core resolves by key on the [Vueform Instance](/guide/vueform-instance), and that indirection is a seam you can work with. The same mechanism that serves the built-ins accepts a different engine behind a module, a wholesale replacement, or a module of your own.

## Reaching a Module

Inside components, just import the module composables from `@vueform/ui` — `useHttp()`, `useDate()`, `useLocale()`, `useSecurity()` — and call them with no arguments.

Each resolves the app's [Vueform Instance](/guide/vueform-instance) by [injection](https://vuejs.org/guide/components/provide-inject.html), so what you get back already works according to the configuration that instance was created with. Each module's chapter owns its usage. The same composables also work outside a setup context, passed the instance explicitly or bound to it — see [Outside a Setup Context](/guide/vueform-instance#outside-a-setup-context).

## Adapters and Plugins

Some modules separate the feature from the engine behind it. The engine is a slot in the module's `$`-options, so you can change what powers a feature while the module, its consumers, and its types stay as they are. The slots come in three kinds:

- **Required engines** — [`$http.adapter`](/guide/http#switching-the-adapter), [`$date.adapter`](/guide/date#custom-adapters), and [`$expression.adapter`](/guide/expressions#the-expression-engine). These modules ship no default engine. The pre-configured entries wire `fetchHttpAdapter`, `nativeDateAdapter`, and `pathExpressionAdapter`, while a [bare setup](/guide/code-splitting#modular-setup) has to wire them itself. Without one, requests reject, dates throw, and expressions stay inert with a dev warning.
- **Replacement backends** — [`$locale.adapter`](/guide/locales#custom-locale-backend) and [`$router.adapter`](/guide/multi-page-forms#browser-history). These modules have a built-in implementation, and the adapter — a function from the module's options to the full module surface — replaces it wholesale.
- **Capability engines** — [`$security.sanitizer`](/guide/security#html-sanitization) and `$security.encrypt` / `decrypt`. None is built in. Without a sanitizer, HTML renders raw — silently while `allowHtml` is unset; with it set, with a dev warning in development and rendering empty in production.

A plugin's `config` hook runs before the modules are created, so a plugin can fill a slot — or register a whole module. [`@vueform/expr-eval`](/plugins/expr-eval) sets the expression engine and [`@vueform/dompurify`](/plugins/dompurify) sets `$security.sanitizer` for instance. The hook itself is covered in [plugins](/guide/plugins#extending-the-registries).

When an adapter slot covers your need, fill it instead of replacing the module — the slot swaps the engine while everything built around it keeps working.

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

- **Options key** — name it `$<key>` after the module. Every `$`-prefixed config key counts as a module options bag, which is what makes the [orphan-options warning](/guide/modules#registering-modules) work for custom modules too.
- **Doorway and stand-in** — a `getAnalyticsModule` / `hasAnalyticsModule` pair plus an inert stand-in the getter serves when the module is absent (or a throw, when no fallback makes sense), and optionally a composable.

Two optional hooks run on the app side. `install({ app, vueform })` runs at `app.use()` — the theme module injects its styles there, and devtools sets up its inspector. `getCSS({ vueform })` contributes CSS to `vueform.getCSS()` and `getStyleTag()` — see [styles on the server](/guide/vueform-instance#styles-on-the-server).

For a working reference, most folders in [`packages/core/src/modules`](https://github.com/vueform/next/tree/main/packages/core/src/modules) follow the same layout — `definition.ts`, `create*.ts`, `module.ts` for the doorway, `types.ts`, and `noop.ts` where the module degrades.
