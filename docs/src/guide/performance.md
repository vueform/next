---
outline: [2,3]
---

# Performance

A form's element count grows faster than its schema suggests — a [repeater](/guide/repeaters) with twelve fields and fifty rows is already six hundred elements, and a [matrix](/guide/repeaters#matrix-repeater) multiplies rows by columns. At that scale Vueform's cost model stays predictable. Mount cost grows linearly with the element count, while typing into a field costs the same in a 100-element form as in a 1,000-element one — a keystroke only wakes the element it changes.

## Benchmarks

Everything below comes from Vueform's [benchmark suite](https://github.com/vueform/next/tree/main/benchmark). It measures production builds of the packed packages — what `npm publish` would ship — in headless Chromium driven by Playwright, mounting forms with a growing number of elements _N_. Every repetition runs in a fresh browser context and page, heap deltas are taken with forced garbage collection, and mount cases time the full path from schema to painted DOM.

Each case runs in both of Vue's rendering modes — the classic virtual DOM and [vapor mode](https://github.com/vuejs/core/issues/13687), Vue 3.6's compilation strategy that turns templates into direct DOM operations with no virtual DOM to create or diff. Vueform ships a separate vapor build of the same components, selected by the `vapor` export condition — see [vapor](/guide/vapor) for how to opt in.

The environment behind the numbers:

- **CPU:** &nbsp;<!-- @bench:env.cpu -->`Apple M5`<!-- /@bench -->
- **RAM:** &nbsp;<!-- @bench:env.ram -->`16 GB`<!-- /@bench -->
- **OS:** &nbsp;<!-- @bench:env.os -->`macOS 26.6.2`<!-- /@bench -->
- **Browser:** &nbsp;<!-- @bench:env.browser -->`Chromium 153.0.8010.12`<!-- /@bench --> (headless)
- **Vue:** &nbsp;<!-- @bench:env.vue -->`3.6.0-rc.5`<!-- /@bench -->
- **Vueform:** &nbsp;<!-- @bench:env.vueform -->`2.0.0-0.7`<!-- /@bench -->
- **Last run:** &nbsp;<!-- @bench:updated -->`2026-10-23`<!-- /@bench -->

### Rendering

The baseline case (`render-text`) mounts a flat form of _N_ text elements and measures the time from schema to painted DOM:

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

A thousand elements mount in <!-- @bench:render-text.vdom.1000.time -->`494 ms`<!-- /@bench --> — about <!-- @bench:render-text.vdom.1000.per-element -->`0.49 ms`<!-- /@bench --> per element, each one carrying its full machinery of model binding, validation, conditions, and classes. The curve stays near-linear across the sweep; there is no cliff where the form suddenly falls over. Memory scales the same way — the thousand-element mount grows the heap by <!-- @bench:render-text.vdom.1000.memory -->`108 MB`<!-- /@bench -->, about <!-- @bench:render-text.vdom.1000.memory-per-element -->`110 KB`<!-- /@bench --> per element.

The two modes land within a few percent of each other at mount — <!-- @bench:render-text.100.vapor-ratio -->`×1.04`<!-- /@bench --> of vdom at _N_ = 100 and <!-- @bench:render-text.1000.vapor-ratio -->`×1.03`<!-- /@bench --> at _N_ = 1,000, for example. That's expected, since mounting is dominated by work both modes share — creating each element's reactive state and the real DOM nodes — and there is no diffing at mount for vapor to skip. Vapor's mount heap runs slightly higher, at <!-- @bench:render-text.vapor.1000.memory -->`124 MB`<!-- /@bench --> against vdom's <!-- @bench:render-text.vdom.1000.memory -->`108 MB`<!-- /@bench --> for the thousand-element form.

A thousand inputs on one screen is also the worst case — and rarely what a user should see. Structure the same form in steps and the picture improves considerably.

### Rendering in Steps

The `render-steps` case mounts the same _N_ text elements split evenly across 10 steps of a [stepped form](/guide/multi-page-forms#stepped-forms):

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

The same thousand elements now reach interactive in <!-- @bench:render-steps.vdom.1000.time -->`275 ms`<!-- /@bench --> — <!-- @bench:render-steps/render-text.vdom.1000.percent -->`56%`<!-- /@bench --> of the flat mount — with heap growth down from <!-- @bench:render-text.vdom.1000.memory -->`108 MB`<!-- /@bench --> to <!-- @bench:render-steps.vdom.1000.memory -->`113 MB`<!-- /@bench --> (<!-- @bench:render-steps/render-text.vdom.1000.memory-percent -->`105%`<!-- /@bench -->).

Every element still runs its setup at mount, so values, validation, and conditions work across all steps immediately — what's deferred is the element's template. Elements visible at mount render right away, while the rest — inactive steps or tabs, condition-hidden elements — render on a `requestIdleCallback` after mount (a 300 ms timeout where the browser has no idle callback), or immediately the moment they become visible. Switching steps afterwards finds the DOM already there. This deferral is the global [`lazy`](/guide/configuration#lazy) option, on by default.

### Typing

The `input-text` case mounts a form of _N_ text elements, then dispatches native input events into one of them and measures the cost of a single event:

<img class="light-only" src="/charts/input-text-time.svg" alt="Cost of one input event into one of N text elements, vdom vs vapor" />
<img class="dark-only" src="/charts/input-text-time-dark.svg" alt="Cost of one input event into one of N text elements, vdom vs vapor" />

<p class="chart-caption">Average cost of one input event into one of <em>N</em> text elements</p>

One event costs about a tenth of a millisecond whether the form holds 100 elements or 1,000 — <!-- @bench:input-text.vdom.100.time -->`0.02 ms`<!-- /@bench --> at _N_ = 100, <!-- @bench:input-text.vdom.1000.time -->`0.02 ms`<!-- /@bench --> at _N_ = 1,000, with a band between them that is timer-level noise. The signal is that the line is flat. A write dispatches only to subscribers of the changed path and its ancestors, and the form skips snapshotting the model entirely when nothing consumes it, so the other 999 elements never hear about the keystroke. Form size adds no input latency.

### Typing with a Live Binding

The `input-text-vmodel` case repeats the same measurement with an active `v-model` on the form:

<img class="light-only" src="/charts/input-text-vmodel-time.svg" alt="Cost of one input event with an active v-model binding, vdom vs vapor" />
<img class="dark-only" src="/charts/input-text-vmodel-time-dark.svg" alt="Cost of one input event with an active v-model binding, vdom vs vapor" />

<p class="chart-caption">Average cost of one input event with an active <code>v-model</code> binding</p>

Now something consumes every change. On each change flush the form deep-clones the whole model and emits the snapshot as `update:modelValue`; the incoming value is deep-watched for outside writes, and the form's own echo is skipped by identity. A form-level `change` listener triggers the same full-model snapshot — it's gated exactly like `v-model` — while a `change` listener on an element only clones that element's slice.

An [attached](/guide/model#attaching-the-model) `!useModel` instance never pays this. Whether passed to `!useForm` or bound with `v-model` on `!VfForm`, the form uses the instance's store directly, with nothing to clone and emit — a `ref`, a `reactive` object, or a plain object bound with `v-model` pays the per-change snapshot instead.

The cost grows with form size, but stays small — <!-- @bench:input-text-vmodel.vdom.1000.time -->`1.79 ms`<!-- /@bench --> per keystroke at 1,000 elements (<!-- @bench:input-text-vmodel.vapor.1000.time -->`2.13 ms`<!-- /@bench --> in vapor), far from perceptible lag.

### Replacing All Values

The `update-all` case measures `form$.update()` with fresh values for all _N_ elements — the operation behind loading a draft or populating an edit view:

<img class="light-only" src="/charts/update-all-time.svg" alt="Time of updating all N elements' values at once, vdom vs vapor" />
<img class="dark-only" src="/charts/update-all-time-dark.svg" alt="Time of updating all N elements' values at once, vdom vs vapor" />

<p class="chart-caption">Time to update all <em>N</em> elements' values at once</p>

The cost is linear in _N_, as it must be — every element genuinely changes. A full update of 1,000 elements takes <!-- @bench:update-all.vdom.1000.time -->`15.1 ms`<!-- /@bench --> in vdom mode and <!-- @bench:update-all.vapor.1000.time -->`5.17 ms`<!-- /@bench --> in vapor. This is where vapor pays off. With every element changing, the vdom re-renders and diffs all of them while vapor patches the changed DOM nodes directly, landing at <!-- @bench:update-all.1000.vapor-ratio -->`×0.34`<!-- /@bench --> of the vdom cost — <!-- @bench:update-all.1000.vapor-speedup -->`2.9×`<!-- /@bench --> faster.

### Running the Suite

`pnpm bench` at the repo root reproduces every case and chart on this page. The [suite's README](https://github.com/vueform/next/tree/main/benchmark) documents the measurement methodology, the CLI flags (`--case`, `--mode`, `--n`, `--reps`), and how to add a case of your own.

## Keeping Large Forms Fast

### Split Large Forms into Pages

The biggest lever, quantified by [Rendering in Steps](#rendering-in-steps) — only the visible page renders at mount, and the rest streams in during idle time. A form big enough to worry about is big enough that users prefer it in pages; see [multi-page forms](/guide/multi-page-forms) for setup. The gain depends on [`lazy`](/guide/configuration#lazy) staying on — turning it off is only for setups that need every element's DOM synchronously at mount, and it moves idle-time work onto the critical path.

### Share Data Through `!useModel`

When something outside the form needs the data live, hand the form a `!useModel` instance instead of a `ref`, a `reactive` object, or a plain `v-model` binding. [Attachment](/guide/model#attaching-the-model) shares one store between your code and the form, so typing stays at the flat [Typing](#typing) cost instead of the [growing one](#typing-with-a-live-binding) — see [external model](/guide/model#external-model) for the setup. The same goes for change tracking on large forms. Prefer element-level `change` listeners or reading `form$.data` reactively over a form-level `change` listener, which snapshots the whole model on every change.

### Prefer Structured Conditions for Logic

An [expression](/guide/expressions) is re-parsed every time it evaluates, while a [structured condition](/guide/conditions#operators) like `['status', '==', 'active']` compares a declared path directly, with no parsing step. Use structured conditions for show/hide logic and a [function prop](/guide/dynamic-props#functions) for computed text in code, and keep expressions for what they're uniquely good at — definitions that must survive serialization.

### Vapor Mode

Vapor mode is worth it for update-heavy forms — [Replacing All Values](#replacing-all-values) quantifies the gain, while mount cost is [unchanged](#rendering). The opt-in — two switches in the app's build — is covered in [Vapor](/guide/vapor) chapter.

What a form costs to load — bundle size rather than runtime — is a separate topic, covered in [Code-Splitting](/guide/code-splitting).
