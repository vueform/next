---
outline: [2,3]
---

# Performance

A form's element count grows faster than its schema suggests. A [repeater](/guide/repeaters) with twelve fields and fifty rows is already six hundred elements, a [matrix](/guide/repeaters#matrix-repeater) multiplies rows by columns, and a [multi-page form](/guide/multi-page-forms) collects several such sections under one route.

A single page rendering thousands of elements is a normal situation for a form framework, and Vueform is designed to handle it. This chapter shows what that adds up to in measured numbers, then covers what you can do on your side to keep large forms fast.

## Benchmarks

Everything below comes from Vueform's [benchmark suite](https://github.com/vueform/next/tree/main/benchmark): real browser measurements of production builds, driven by Playwright, mounting forms with a growing number of elements _N_. Each sweep point runs in a fresh page, so earlier runs can't skew later ones.

Each case runs in both of Vue's rendering modes — the classic virtual DOM and [vapor mode](https://github.com/vuejs/core/issues/13687). Vapor is Vue 3.6's alternative compilation strategy: templates compile to code that manipulates the DOM directly, with no virtual DOM to create or diff. Vueform is vapor-compatible out of the box, so both modes run on the same runtime.

The charts follow your color scheme. The environment behind the numbers:

- **CPU:** &nbsp;<!-- @bench:env.cpu -->`Apple M5`<!-- /@bench -->
- **RAM:** &nbsp;<!-- @bench:env.ram -->`16 GB`<!-- /@bench -->
- **OS:** &nbsp;<!-- @bench:env.os -->`macOS 26.6.2`<!-- /@bench -->
- **Browser:** &nbsp;<!-- @bench:env.browser -->`Chromium 153.0.8010.12`<!-- /@bench --> (headless)
- **Vue:** &nbsp;<!-- @bench:env.vue -->`3.6.0-rc.5`<!-- /@bench -->
- **Vueform:** &nbsp;<!-- @bench:env.vueform -->`2.0.0-alpha.1`<!-- /@bench -->
- **Last run:** &nbsp;<!-- @bench:updated -->`2026-10-02`<!-- /@bench -->

### Rendering

The baseline case mounts a form whose schema holds _N_ text elements — from schema to fully interactive DOM:

<div class="chart-tabs">

<!-- @subtabs -->
<!-- @subtab Time -->

<img class="light-only" src="/charts/render-text-time.svg" alt="Mount time of a form with N text elements, vdom vs vapor" />
<img class="dark-only" src="/charts/render-text-time-dark.svg" alt="Mount time of a form with N text elements, vdom vs vapor" />

<p class="chart-caption">Mount time of a form with <em>N</em> text elements</p>

<!-- @endsubtab -->
<!-- @subtab Memory -->

<img class="light-only" src="/charts/render-text-memory.svg" alt="Heap growth of mounting a form with N text elements, vdom vs vapor" />
<img class="dark-only" src="/charts/render-text-memory-dark.svg" alt="Heap growth of mounting a form with N text elements, vdom vs vapor" />

<p class="chart-caption">Heap growth while mounting <em>N</em> text elements</p>

<!-- @endsubtab -->
<!-- @endsubtabs -->

</div>

A thousand elements mount in <!-- @bench:render-text.vdom.1000.time -->`506 ms`<!-- /@bench --> — about <!-- @bench:render-text.vdom.1000.per-element -->`0.51 ms`<!-- /@bench --> per element, with each one bringing its full machinery: model binding, validation, conditions, classes. The curve stays near-linear across the sweep; there is no cliff where the form suddenly falls over. Memory scales the same way — mounting the thousand-element form grows the heap by <!-- @bench:render-text.vdom.1000.memory -->`107 MB`<!-- /@bench -->, about <!-- @bench:render-text.vdom.1000.memory-per-element -->`110 KB`<!-- /@bench --> per element.

The two modes land within noise of each other at mount (<!-- @bench:render-text.100.vapor-ratio -->`×1.12`<!-- /@bench --> to <!-- @bench:render-text.1000.vapor-ratio -->`×1.05`<!-- /@bench --> of vdom across the sweep). That's expected: mounting is dominated by work both modes share — creating each element's reactive state and the real DOM nodes — and there is no diffing at mount for vapor to skip. Vapor's advantage is in _updates_, where the vdom re-renders and diffs while vapor patches the exact DOM nodes a change touches; the [full-form update](#updating-the-whole-form) case below shows exactly that.

That's the worst case, though: a thousand inputs visible at once is rarely what you actually want to show a user. Structure the same form the way a user would want to fill it — in steps — and the picture improves considerably.

### Rendering in Steps

The second case mounts the same _N_ text elements split evenly across 10 steps of a [stepped form](/guide/multi-page-forms#stepped-forms):

<div class="chart-tabs">

<!-- @subtabs -->
<!-- @subtab Time -->

<img class="light-only" src="/charts/render-steps-time.svg" alt="Mount time of a form with N text elements split across 10 steps, vdom vs vapor" />
<img class="dark-only" src="/charts/render-steps-time-dark.svg" alt="Mount time of a form with N text elements split across 10 steps, vdom vs vapor" />

<p class="chart-caption">Mount time with <em>N</em> text elements split across 10 steps</p>

<!-- @endsubtab -->
<!-- @subtab Memory -->

<img class="light-only" src="/charts/render-steps-memory.svg" alt="Heap growth of mounting a form with N text elements split across 10 steps, vdom vs vapor" />
<img class="dark-only" src="/charts/render-steps-memory-dark.svg" alt="Heap growth of mounting a form with N text elements split across 10 steps, vdom vs vapor" />

<p class="chart-caption">Heap growth with <em>N</em> text elements split across 10 steps</p>

<!-- @endsubtab -->
<!-- @endsubtabs -->

</div>

The same thousand elements now reach interactive in <!-- @bench:render-steps.vdom.1000.time -->`294 ms`<!-- /@bench --> — <!-- @bench:render-steps/render-text.vdom.1000.percent -->`58%`<!-- /@bench --> of the flat mount, with heap growth down from <!-- @bench:render-text.vdom.1000.memory -->`107 MB`<!-- /@bench --> to <!-- @bench:render-steps.vdom.1000.memory -->`113 MB`<!-- /@bench --> (<!-- @bench:render-steps/render-text.vdom.1000.memory-percent -->`105%`<!-- /@bench -->).

The mechanism is Vueform's lazy view mounting, on by default via the [`lazy`](/guide/configuration#lazy) config option. Every element registers itself and its state at mount — values, validation, and conditions work immediately across all steps — but elements that aren't currently visible defer rendering their view. Once the form is interactive, the deferred views stream into the DOM (hidden) during browser idle time, so switching steps later is instant. The user pays the full cost of only the step they're looking at; the rest of the form renders while they read the first field's label.

### Updating a Single Field

Render time is paid once; update time is paid on every keystroke. The input case mounts a form of _N_ text elements, then dispatches native input events into one of them and measures the cost of a single event:

<img class="light-only" src="/charts/input-text-time.svg" alt="Cost of one input event into one of N text elements, vdom vs vapor" />
<img class="dark-only" src="/charts/input-text-time-dark.svg" alt="Cost of one input event into one of N text elements, vdom vs vapor" />

<p class="chart-caption">Average cost of one input event into one of <em>N</em> text elements</p>

The lines wiggle because they're measuring noise — the real signal is that they're _flat_. One input event costs a few hundredths of a millisecond whether the form holds 100 elements or 1,000 (<!-- @bench:input-text.vdom.100.time -->`0.02 ms`<!-- /@bench --> at _N_ = 100, <!-- @bench:input-text.vdom.1000.time -->`0.02 ms`<!-- /@bench --> at _N_ = 1,000, with everything between inside the same band). Typing touches only the element being typed into: its reactive value updates, its subscribers re-run, and the other 999 elements never hear about it. Form size does not add input latency — there is no point at which typing starts to lag.

### Updating with `v-model`

That guarantee holds as long as nothing subscribes to the whole model on every change. Bind an active `v-model` to the form and something does — each keystroke snapshots the full model, emits it, and writes it back through the binding:

<img class="light-only" src="/charts/input-text-vmodel-time.svg" alt="Cost of one input event with an active v-model binding, vdom vs vapor" />
<img class="dark-only" src="/charts/input-text-vmodel-time-dark.svg" alt="Cost of one input event with an active v-model binding, vdom vs vapor" />

<p class="chart-caption">Average cost of one input event with an active <code>v-model</code> binding</p>

Now the cost grows with form size — still only <!-- @bench:input-text-vmodel.vdom.1000.time -->`1.76 ms`<!-- /@bench --> per keystroke at 1,000 elements (<!-- @bench:input-text-vmodel.vapor.1000.time -->`2.13 ms`<!-- /@bench --> in vapor), nowhere near perceptible lag, but no longer free. It's the price of live two-way sync, not of typing — which is why [Best Practices](#bind-v-model-only-when-you-consume-it) below suggests reading the model on demand instead when nothing outside the form consumes it live.

### Updating the Whole Form

The heaviest write path is replacing the entire model at once — `form$.update()` with fresh values for all _N_ elements, the kind of operation behind "Load draft" or populating an edit view:

<img class="light-only" src="/charts/update-all-time.svg" alt="Time of updating all N elements' values at once, vdom vs vapor" />
<img class="dark-only" src="/charts/update-all-time-dark.svg" alt="Time of updating all N elements' values at once, vdom vs vapor" />

<p class="chart-caption">Time to update all <em>N</em> elements' values at once</p>

The cost is linear in _N_, as it must be — every element genuinely changes. A full update of 1,000 elements takes <!-- @bench:update-all.vdom.1000.time -->`12.6 ms`<!-- /@bench --> in vdom mode and <!-- @bench:update-all.vapor.1000.time -->`5.31 ms`<!-- /@bench --> in vapor. This is where vapor mode earns its keep: with every element re-rendering, the vdom pays for diffing across the board while vapor writes straight to the changed DOM nodes, landing at <!-- @bench:update-all.1000.vapor-ratio -->`×0.42`<!-- /@bench --> of the vdom cost — <!-- @bench:update-all.1000.vapor-speedup -->`2.4×`<!-- /@bench --> faster.

### Run Them Yourself

The [benchmark suite](https://github.com/vueform/next/tree/main/benchmark) is part of the repository — cases, measurement methodology, and the isolation setup are documented in its README, and `pnpm bench` reproduces every chart on this page. The cases are deliberately parametric and easy to add to, so feel free to play with it — run it on your own hardware, tweak the sweeps, or model your own workload as a case.

## Best Practices

Vueform's defaults carry most of the load, but form authors hold a few levers that matter at scale.

### Split Large Forms into Pages

The single biggest lever, and the numbers above quantify it: the same form [split into steps or tabs](/guide/multi-page-forms) reaches interactive in half the time and with a fraction of the upfront memory, because only the visible page renders at mount while the rest streams in during idle time. If a form is big enough to worry about performance, it's big enough that users would prefer it in pages anyway — the fast structure and the humane structure are the same one.

### Leave Lazy Rendering On

Deferred view mounting is on by default and is what the [stepped-form numbers](#rendering-in-steps) rely on. The [`lazy`](/guide/configuration#lazy) config option exists as an escape hatch for the rare setup that must have every element's DOM present synchronously at mount — for anything else, turning it off only moves idle-time work into the user's critical path.

### Bind `v-model` Only When You Consume It

An active [`v-model`](/guide/model#v-model) on the form means every keystroke snapshots and emits the entire model — the one thing that turns constant-time typing into a cost that [grows with form size](#updating-with-v-model). It's the right tool when something outside the form renders or reacts to values live. When it isn't — when you only need the data at submit, or occasionally — read the model on demand through [`form$`](/guide/model#reading-the-model-via-context) or receive it in the submit flow, and leave the binding off.

### Prefer Structured Conditions Over Expressions

[Expressions](/guide/expressions) are parsed, tracked strings: every field an expression references becomes a live subscription, and chains of cross-referencing expressions re-evaluate whenever anything in the chain moves. That's exactly what you want for a computed total — and more machinery than you need to show or hide a field.

For logic, prefer [structured conditions](/guide/conditions) (`['status', 'active']`), which compare declared paths with no parsing step. For dynamic text, prefer a plain value or a [function prop](/guide/dynamic-props) over an expression string — a function states its dependencies by what it reads, with nothing to parse or track beyond them. Save expressions for what they're uniquely good at: user-authored or schema-driven computed values.

### Keep Presets Flat

[Presets](/guide/presets) are resolved and merged per element — each preset in an element's list is another layer to match, cascade, and merge onto its props. One preset encoding a shared look is cheap; four stacked presets, each overriding half of the previous one, do that merge work on every element they touch _and_ make the result harder to reason about. When a group of props always travels together, apply it directly (or spread a shared object in the schema) rather than reaching for another preset layer.
