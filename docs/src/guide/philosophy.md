# Philosophy

If Vueform were a classmate, it'd be the one you'd actually want on your group project — fits in without taking over, knows its strengths and its limits, respects how you do things, and quietly handles the stuff nobody else wants to deal with. The principles below are what that looks like in practice.

## The One That Fits In

Think of the classmate who joins a group project mid-way and somehow doesn't make it worse. They don't rewrite what's already working, don't bring tools nobody asked for, and when the group already has something that works — they use it.

That's Vueform's relationship to your project. It reuses as much as possible from its environment and only adds functionality where it genuinely can't get by with what's already there. Your UI library, your date handling, your expression engine, your sanitizer — if you already have a solution, Vueform leans on it rather than replacing it.

Where it _does_ add value is the form-specific stuff that nothing else in your stack covers: state management, validation, conditions, submission lifecycles, repeaters, layout scaffolding. That's the work Vueform takes off your plate. Everything outside of that stays yours.

## Opinionated, Not Stubborn

Vueform is opinionated about the things that are genuinely universal across forms — validation, conditional visibility, layout, multi-step flows, submission lifecycles — all behind a well-defined API based on community best practices. But it also knows where your project will likely need room, so it leaves configuration points open in the places where teams tend to diverge: theming, class strategy, default props, error behavior, submission handling.

And when configuration isn't enough — when you need full control — you can swap things out entirely:

- Don't like a default class? Override it.
- Don't like the rendered markup? Replace the template.
- Don't like a module implementation? Plug in your own.
- Don't like an event flow? Drop down to the context API and write it yourself.

Opinions where they help. Freedom where you need it.

## Speaks Everyone's Language

AI is already writing a large share of form code, and that share is only going to grow. An AI can absolutely wire up forms by hand — `v-model`, watchers, validation logic, error display — but the output will be different every time. Different naming, different structure, different patterns. The real advantage of a form framework, for humans and machines alike, is having a single consistent system to work within. One set of conventions, one API surface, predictable output every time — whether you wrote it, your teammate did, or an AI did.

Vueform is built with this in mind. The API is designed to be predictable enough for a machine to write against confidently, the types are strict enough to serve as a machine-readable contract, and the docs are structured enough not only for humans, but agents to scrape and act on without hand-holding. AI isn't an afterthought here — it's a first-class user of the framework.

## Leaves No One Behind

Using Vueform with a screen reader, a keyboard, or any other assistive technology has to be as good as using it without — same flow, same feedback, same outcome. There is no second-class user.

Most form inputs come from third-party UI libraries that handle accessibility unevenly, so Vueform takes responsibility for what it can control: label association, live error announcements, keyboard navigation, focus management, and proper ARIA state reflection. For adapters built on existing UI libraries, this layer rides on top of whatever those components already do well and fills in what they don't. For Vueform UI — the official native-HTML adapter — accessibility is built in from the ground up.

Accessibility is the default, not the upgrade.

## The Type You Can Trust

You know the classmate who says "yeah, pass me anything, I'll handle it" — and then quietly does something completely different? That's what loose types are. They say one thing and do another. You only find out when something breaks at runtime, in production, in front of a user.

Vueform doesn't do that. Every public prop, event, slot, model, condition, and context is typed as precisely as TypeScript allows — generics over `any`, narrowed unions over `string`, inferred shapes over hand-written ones. When a type can be derived from the schema, it is. What the types say is what Vueform actually does. No surprises, no silent coercion, no gap between the contract and the behavior.

The result: autocomplete that actually helps, refactors that are safe, wrong field names caught at write-time instead of runtime — for you and for AI alike. It costs more to build a framework this way. The payoff, every time someone works with it, is worth it.

## No Secret Language

Vueform solves things the Vue way. Props, events, slots, templates — the same primitives you already use to build everything else in your app. It won't invent a parallel system or sneak in workarounds that technically work but abuse the framework's principles, even when that would be more convenient from the usage standpoint. If something can't be expressed cleanly through Vue's own mechanisms, it doesn't get a shortcut — it gets a proper solution or it waits.

That extends to transparency. There's no hidden magic, no implicit global state you can't trace, no behavior that only makes sense after reading the source. When something happens in Vueform — a prop resolves, a condition fires, a value transforms — you can follow it. The data flows through props and events the same way it would in your own components. The modules are explicit. The lifecycle is auditable. You're never left wondering "where did that come from?"

A lot of frameworks trade transparency for convenience. Vueform treats them as the same thing — if you can see how it works, you can work with it faster.

## Doesn't Slow You Down

A form framework runs on the slowest, most interactive part of every page. A laggy form is worse than no framework at all. So performance gets right of veto — when a feature would slow things down, it either doesn't ship, or it ships as opt-in with a clear note explaining the trade-off.

In practice that means avoiding deep reactive traversal of the form tree, evaluating conditions lazily instead of on every tick, minimizing the number of watchers per element, skipping the runtime template compiler entirely, and keeping the rendering strategy SSR-safe without extra configuration. Expensive features — anything that adds meaningful overhead — are opt-in, clearly labeled, with documentation explaining exactly what you're trading.

The default path through Vueform is always the fast path.

## Keeps the Door Locked

The classmate who locks up when they're the last one out — not because someone asked, but because they know what's at stake if they don't.

A form is one of the most common ways untrusted input gets into your app. Vueform treats every door as locked by default: `v-html` is avoided across the entire codebase, expressions run through a sandboxed parser instead of `eval`, dependencies are continuously monitored and patched, and static analysis runs on every change. The one place where rendering HTML is genuinely needed goes through the security module's sanitizer (DOMPurify by default) before anything reaches the DOM. When a vulnerability is reported, security patches are prioritized over feature work — every time.

You shouldn't have to think about whether your form framework left something open. Vueform doesn't leave that to chance.

## Still Your Friend in Ten Years

A form framework lives at the heart of an app, and replacing one is one of the most expensive refactors a team can take on. So Vueform takes the long view. Major versions are rare — the goal is small, incremental changes through minor and patch releases, not periodic rewrites. Breaking changes are a last resort, always paired with migration guides written before the release, not after. Deprecations come with at least one major version of advance notice and runtime warnings. And when a version reaches end-of-life, you'll know at least 12 months ahead — long enough to plan, budget, and migrate at your own pace.

The code you write today should still work tomorrow. That's the kind of friend Vueform aims to be.
