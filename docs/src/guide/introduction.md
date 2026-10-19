# Introduction

Before we dive into the docs, let's spend a minute talking about what Vueform actually is, who it's for, and why it exists in the first place. If by the end you decide it's not the right fit, that's totally fine — better to find that out now than three weeks into using it.

There's a good chance you're showing up from one of these places:

- **You've been doing forms by hand**, no library, just `v-model` and grit, and you're starting to wonder if there's a saner way to live.
- **You've been using a "hook-style" library** that handles state and validation, but you still find yourself wiring up labels, errors, layout, conditions, and submission for the hundredth time, and you're tired.
- **You've used an earlier Vueform**, or another full-featured form framework — maybe even rolled your own — but you eventually ended up fighting against it.

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

Second, and this is the big one: people still aren't really happy with what's out there. Hook-style libraries like VeeValidate don't go far enough — you're still left to handle everything around the input. The more robust frameworks go further, but you eventually end up fighting them.

After a few conference visits and talking to devs, the same complaint kept coming up: the biggest pain of adopting a "real" form framework is that **it brings its own form components**.

Think about it. Most projects today already have a UI layer — PrimeVue, Vuetify, Nuxt UI, or something hand-rolled on top of primitives like shadcn or Reka UI. Then you bring in a form framework, and suddenly you've got a second set of inputs that look slightly different, behave slightly differently, theme slightly differently, and need their own maintenance to even pretend to fit in. It's death by a thousand papercuts.

Vueform's whole reason for existing is to fix that.