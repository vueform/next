---
outline: [2,3]
---

# Modules

Vueform's features ship as **modules** — self-contained units like conditions, validation, or HTTP that plug into the core. You mostly don't have to think about them: pre-configured entries like `@vueform/ui/origin` register every module out of the box, and everything simply works.

Modules start to matter in two situations. One is bundle size: with a [modular setup](/guide/code-splitting#modular-setup) you register only the modules your app uses, and the rest never make it into the bundle. The other is control over the core logic itself. Modules are dependency injection at the framework level — the core only defines what a module must provide, and the implementation is whatever you register, so any piece of built-in behavior can be [swapped for your own](#swapping-a-module) without touching the rest.

## Registering Modules

Modules are passed to `createVueform` under `modules`:

```ts
import { createVueform } from '@vueform/ui'
import { conditions, validation, http } from '@vueform/ui/modules'

createVueform({
  modules: { conditions, validation, http }, // [!code highlight]
})
```

Some modules accept global options through a `$`-prefixed config key — `$http` for request defaults, `$security` for the HTML/component gates, sanitizer and ciphers, and so on. See [Configuration](/guide/configuration#modules) for the full list.

Modules are created once, when `createVueform()` runs, and live on the [Vueform instance](/guide/vueform-instance) it returns — `vueform.modules`. Components reach them through that instance, which is what lets composables like `useHttp()` or `useLocale()` work anywhere inside the app, and code outside components use the instance directly.

## Leaving a Module Out

In principle, every module is optional — except one. **`model` is the smallest, lowest-level piece Vueform can run on**: the data layer itself. Everything else builds on top of it — rendering, validation, conditions, expressions, autosave — so while any of those can be left out, there is no Vueform without `model`.

For the optional ones, an unregistered module never fails at registration time — what happens instead depends on the module:

- **Most degrade silently.** Conditions resolve as met, validation treats everything as valid, expressions render as literal text, the `autosave` prop has no effect, built-in strings show their raw tags, no theme styles are injected. Features that notice a clear intent — like configured ciphers with no security module, or a locale switch with no locale module — warn in dev.
- **Some throw at the point of use.** Anything that needs the network (`http`) or date logic (`date`) throws when it's actually invoked, pointing you at the missing registration.

## Adapters and Plugins

Some modules split _what_ they do from _how_ they do it: the module owns the feature, and a swappable **adapter** in its config provides the engine behind it. Each ships with a built-in default (or an inert one), and the official plugins exist largely to fill these slots with a fuller implementation:

- **`http`** runs on a dependency-free Fetch adapter by default — swap [`$http.adapter`](/guide/http#switching-the-adapter) for Axios, ofetch, or your in-house client and everything on top keeps working.
- **`date`** ships a native adapter covering standard formats; the [Day.js, date-fns, or Luxon plugins](/guide/date#format-plugins) swap in a format-capable one when you need custom format tokens.
- **`expression`** interpolates `{path}` templates out of the box; the [expr-eval plugin](/plugins/expr-eval) adds the full engine — operators, functions, computed conditions.
- **`security`** has no built-in sanitizer — the [DOMPurify plugin](/plugins/dompurify) provides one. Without it, areas listed in `allowHtml` render escaped text rather than unsanitized HTML.
- **`locale`** can hand its whole backend to your existing [Vue I18n](/plugins/vue-i18n) instance.

A plugin like these is just a package that fills its module's adapter slot and defaults the related config — see [Plugins](/guide/plugins) for how they compose.

## The Built-in Modules

Most modules are documented where their feature naturally lives — `model` in [Model](/guide/model), `validation` in [Validation](/guide/validation), `security` in [Security](/guide/security), `theme` in [Themes & Tokens](/guide/themes-tokens), and so on. The ones that are a topic of their own with no other home — conditions, expressions, autosave, HTTP, dates — have their own chapters in the **Modules** group of the sidebar. The table links each module to where it's covered:

| Module                                              | Provides                                                                        | If not registered                                                                                                                                                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`conditions`](/guide/conditions)                   | Conditional visibility and logic                                                | Every condition counts as met.                                                                                                                                                                                                                                                    |
| [`validation`](/guide/validation)                   | Rules and validators                                                            | Everything counts as valid.                                                                                                                                                                                                                                                       |
| [`expression`](/guide/expressions)                  | `{...}` templates and expression conditions                                     | Templates render as literal text.                                                                                                                                                                                                                                                 |
| [`autosave`](/guide/autosave)                       | Local drafts and remote saving                                                  | The `autosave` prop has no effect (dev warning).                                                                                                                                                                                                                                  |
| [`http`](/guide/http)                               | Network requests                                                                | Anything needing the network throws.                                                                                                                                                                                                                                              |
| [`date`](/guide/date)                               | Date parsing and comparison                                                     | Date conditions, rules, and expression functions throw.                                                                                                                                                                                                                           |
| [`locale`](/guide/locales)                          | Framework strings and localization                                              | Built-in strings show raw tags; locale maps fall back to their first entry.                                                                                                                                                                                                       |
| [`security`](/guide/security)                       | HTML/component gating, sanitization, request-origin policy, persistence ciphers | Nothing is enforced — HTML renders raw, any registered component resolves, origins unrestricted, URLs and CSS unchecked, drafts unencrypted (the deliberate wholesale opt-out). Configured `$security` policies without the module warn in dev and **fail closed in production**. |
| [`theme`](/guide/themes-tokens)                     | Theme tokens, style injection, dark mode                                        | No styles are injected (dev warning).                                                                                                                                                                                                                                             |
| [`router`](/guide/multi-page-forms#browser-history) | Browser-history integration for multi-page forms                                | Page navigation doesn't touch the URL.                                                                                                                                                                                                                                            |
| [`model`](/guide/model)                             | The form data layer                                                             | Required — the foundation everything else builds on.                                                                                                                                                                                                                              |

Configuring a module's `$`-options (e.g. `$validation`, `$security`) without registering the module warns at `createVueform()` in development — the options would read as if they were in effect while nothing consumes them.

## Swapping a Module

There's nothing privileged about the built-in modules — whatever you pass under `modules` is what runs. A module is a `defineModule({ create })` object: `create` runs once per `createVueform()` and returns the implementation, which the instance stores under the module's key (`vueform.modules.conditions`). Every consumer — elements, forms, composables — reaches the module through that key, so any implementation satisfying its public interface (`HttpModule`, `ConditionsModule`, `DateModule`, …) is a drop-in replacement:

```ts
import { createVueform, defineModule } from '@vueform/ui'

const conditions = defineModule({
  create: ({ vueform }) => {
    // return an implementation satisfying `ConditionsModule`
  },
})

createVueform({
  modules: { conditions }, // replaces the built-in
})
```

`create` receives the [Vueform instance](/guide/vueform-instance) the module is being created for. Its resolved config is `vueform.config`, and a module's own options live under its `$`-key there (`vueform.config.$http`, `vueform.config.$security`).

## Authoring a Module

Whether you're replacing a built-in or adding a capability Vueform doesn't have, a module is the `defineModule({ create })` object above plus the implementation `create` returns. How much else you need depends on which of the two you're doing.

**Replacing a built-in** is the smaller job: the interface already exists (`HttpModule`, `ConditionsModule`, `DateModule`, …), and so do its consumers, its `$`-key options, its composables, and its inert stand-in for when it's absent. Your `create` returns an object that satisfies the interface, and everything downstream works unchanged. Modules that depend on other modules resolve them through the instance lazily, at call time (`getLocaleModule(vueform)`), never inside `create`, so registration order is irrelevant.

**A brand-new module** has to bring those pieces itself: a public interface type describing what it provides, a `$`-prefixed options key merged into `VueformConfig` and `VueformModules` through module augmentation, an inert stand-in for when it isn't registered, and a composable or doorway that reaches the created module through the [Vueform instance](/guide/vueform-instance) — `useVueformContext().modules.myModule` inside components, `vueform.modules.myModule` outside.

In both cases, a module that needs the app itself adds an `install({ app, vueform })` hook — that's how `theme` injects its styles — and one that contributes styles a `getCSS()`. The best reference is the real thing: each folder in the repository's [`modules` directory](https://github.com/adamberecz/vueform2/tree/main/packages/core/src/modules) has the same layout — `definition.ts`, `create*.ts`, `module.ts` for the doorway, `types.ts`, and a `noop.ts` wherever the module degrades instead of throwing. For a replacement, read the folder of the module you're replacing; for a new one, copy the closest and adapt.

Fair warning: this is a deep layer with conventions still settling, so expect to read source. Before writing a module at all, check whether an existing one's [adapter slot](#adapters-and-plugins) already covers what you need — it keeps the module, its consumers, and its types exactly as they are, for a fraction of the surface area.
