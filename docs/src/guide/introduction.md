# Introduction

Before we dive into the docs, let's spend a minute talking about what Vueform actually is, who it's for, and why it exists in the first place. If by the end you decide it's not the right fit, that's totally fine — better to find that out now than three weeks into using it.

There's a good chance you're showing up from one of these places:

- **You've been doing forms by hand**, no library, just `v-model` and grit, and you're starting to wonder if there's a saner way to live.
- **You've been using a "hook-style" library** that handles state and validation, but you still find yourself wiring up labels, errors, layout, conditions, and submission for the hundredth time, and you're tired.
- **You've used FormKit, an earlier Vueform**, or another full-featured form framework — maybe even rolled your own — but you eventually ended up fighting against it.

If any of those sound familiar, stick around – you're in a good place.

## Is Vueform Right For You?

Let's get this out of the way first, because Vueform isn't a fit for every project, and pretending otherwise would just waste your time.

It pays off the most when your project:

- has lots of forms, big forms, or otherwise complex forms,
- needs to create, store, or generate forms dynamically.

If that's you, Vueform will pull a serious amount of weight off your shoulders. You'll feel it.

On the other hand, if your project:

- only has a handful of forms,
- mostly uses "UI-shaped" forms (a search panel, a filter bar, a single login screen),

you're probably better off with something lighter. Vueform will still work — it's not going to explode — but you may not get enough out of it to justify the overhead and the new mental model. Pick the right tool for the job.

## Why Another Form Library?

Fair question. The world doesn't exactly need another framework for the sake of it.

Two things have become clear recently. First, AI is now writing a huge chunk of our code — and frankly, it's only going to do more of that. That asks for a different level of abstraction: one that lets a model (or a human) freely create forms while staying inside a consistent, predictable system.

Second, and this is the big one: people still aren't really happy with what's out there. Hook-style libraries like VeeValidate don't go far enough — you're still left to handle everything around the input. The more robust frameworks (FormKit, earlier Vueform, others) go further, but you eventually end up fighting them.

After a few conference visits and talking to devs, the same complaint kept coming up: the biggest pain of adopting a "real" form framework is that **it brings its own form components**.

Think about it. Most projects today already have a UI layer — PrimeVue, Vuetify, Nuxt UI, or something hand-rolled on top of primitives like shadcn or Reka UI. Then you bring in a form framework, and suddenly you've got a second set of inputs that look slightly different, behave slightly differently, theme slightly differently, and need their own maintenance to even pretend to fit in. It's death by a thousand papercuts.

Vueform's whole reason for existing is to fix that.

## What Is Vueform, and Why Is It Different?

Vueform is a TypeScript-first form framework, and the trick it pulls is splitting itself into two clean layers:

- A **logic-only Core** that takes care of state, validation, conditions, submission — all the boring-but-critical stuff that every form actually needs.
- A **visual Adapter** that wraps the UI library you're already using, so its inputs become Vueform-aware without changing how they look or feel.

Easier to show than tell.

Here's **PrimeVue**'s `<InputText>`, just as you'd normally use it:

::: example no-code no-model

```vue
<VfText name="text" />
```

:::

```vue
<InputText variant="filled" />
```

And here's **Vueform**'s `<VfInputText>` implementation of it:

::: example no-code no-model
<VfText name="text" />
:::

```vue
<VfInputText variant="filled" />
```

`<VfInputText>` wraps PrimeVue's `<InputText>` under the hood and forwards props, slots, and events straight through. Same props (give or take a few), same events, same slots — visually, you can't tell them apart. Your designer won't notice; your existing PrimeVue theme keeps working.

**What changes is everything you get to layer on top** — without touching how the input looks or behaves.

Take this:

```vue
<VfInputText
  name="email"
  rules="required|email"
  :disabled="[['plan', '==', 'free']]"
  :debounce="300"
/>
```

That's still a PrimeVue input visually. But under the hood, its value is now auto-registered into the form's data model at `email`, validated against two rules (with 50+ built-in and async/custom rules available), disabled whenever another field — `plan` — equals `'free'`, and debounced by 300ms. No `<script>`, no `v-model`, no watchers, no boilerplate.

And that's just four props. Every input you adopt through Vueform also gains:

- **Validation** — 50+ built-in rules, plus async and custom rules, with configurable triggers (`change`, `blur`, `submit`, step transitions).
- **Conditions** — show, hide, disable, or make read-only based on any other field's value.
- **Expressions** — drive any prop (label, help, options, rules) from a live expression over the form model.
- **Form data** — automatic registration into the model at any path, including nested groups, repeating lists, grids, and matrices.
- **State & lifecycle** — built-in `dirty`, `touched`, `visited`, `pending`, `validated`, `empty` state, plus typed events for everything.
- **Layout** — labels, placeholders, descriptions, help, hints, errors, prefix/suffix addons, icons, and responsive columns — all driven by props.
- **Submission** — submit buttons with `action`, validate-on-`blur`/`change`/`next`/`submit`, automatic server-error mapping into the right element.
- **i18n** — translatable labels, descriptions, errors, and even translatable per-element values.
- **Composition** — the same input drops into lists, groups, grids, matrices, and steppers without changes.

A lot of that is also surfaced as opinionated layout shorthands. Anyone who's done forms in PrimeVue knows how much markup it takes to get an icon, an in-field label, and a help text on a single input:

```vue
<div class="flex flex-col gap-2">
  <IftaLabel>
    <IconField>
      <InputIcon class="pi pi-user" />
      <InputText id="username" />
    </IconField>
    <label for="username">Username</label>
  </IftaLabel>

  <Message size="small" severity="secondary" variant="simple">
    Enter your username to reset your password.
  </Message>
</div>
```

In `VfInputText`, those exact patterns — straight from PrimeVue's own design playbook — are surfaced as props:

```vue
<VfInputText
  name="username"
  before-icon="pi pi-user"
  ifta="Username"
  help="Enter your username to reset your password."
/>
```

Same output. A lot less typing. And because it's still PrimeVue underneath, no custom styling or markup needed — it just works.

### The Two Layers, Up Close

The **Core** layer is logic-only: state, validation, conditions, submission, lifecycle, plus a thin set of helper components that work regardless of which UI library you're rendering with.

The **Adapter** layer is the rendering side. Each adapter is built for a specific UI library — PrimeVue, Vuetify, Nuxt UI, and so on — and uses **its** inputs with **its** theme, the one already configured in your app. Nothing duplicated, everything just works outside of the box.

There's also an official adapter (Vueform UI) built on native HTML elements with a small, opinionated styling system, for projects that genuinely need form components because they don't already have any.

On top of all that, Vueform ships:

- **Optional elements** you can drop into any adapter — things like a signature pad, which most UI libraries don't include.
- **Plugins** that add behavior at the logic level. They live outside the Core because they usually depend on external libraries that not everyone wants to ship — date management is a great example, where teams are split across date-fns, Day.js, and Luxon.

## The Goal

Long-term, the plan is simple: an adapter for every popular Vue UI library, so adding a real form framework to an existing project doesn't mean giving anything up. No new component zoo, no theming gymnastics, no trade-offs — just your stack, with forms that finally stop fighting back.

## Where Things Stand Today

Vueform is currently in **alpha**. The architecture is settled, the core APIs are in place, and you can build real forms with it today — but there's still meaningful work ahead before a stable release.

The focus right now is on three things, in roughly this order:

- **Finishing the planned API.** A few corners of the surface are still being filled in, mostly around the less-common features.
- **Hardening it through real use.** Alpha is the moment to find the bottlenecks and design mistakes that only show up once people actually try things — community feedback during this phase has outsized impact on what the stable release ends up looking like.
- **Expanding the surface.** More adapters for popular UI libraries, more elements, more plugins, more themes — the long tail of "Vueform works with whatever you already have" depends on this.

See the [Roadmap](/guide/roadmap) for what's done, what's in progress, and what's next.

## New

Install only the core and you have useModel and useForm out of the box, without any components but fully typed headless data and validation. Add expressions module and you can reference other fields in data. And you are only at xyKB gzipped. Add the framework agnostic component library and have native html elements or add an actual adapter for an existing ui library like primevue and you have outofthebox relationship between them.

Foo

`createContext` <br>
`createRule` <br>
`createVueform` <br>
`defineComputedSchema` <br>
`defineConfig` <br>
`defineDefaults` <br>
`defineEvents` <br>
`defineFeature` <br>
`defineModule` <br>
`definePlugin` <br>
`definePreset` <br>
`defineSchema` <br>
`defineTheme` <br>
`extendTheme` <br>
`resolveAddon` <br>
`resolveModules` <br>
`resolveVueform` <br>