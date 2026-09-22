/**
 * Validates the per-component theme-chunk imports of an adapter
 * (packages/<adapter>/src/components/<Name>/styles.ts) against the `vf-*`
 * classes each component can emit. The styles.ts imports are the single
 * source of truth for per-component CSS — this script exists so they can
 * never drift.
 *
 * How it works:
 * 1. Parses the compiled chunks of every package the adapter draws from into
 *    a multi-valued class → (provider) index, where a provider is `own:<chunk>`
 *    (the adapter's own scss) or `core:<chunk>` (a core chunk the adapter's
 *    aggregate recipe layers under its own). A class occurrence is gated by
 *    its compound selector: `.vf-btn.vf-text` only counts for components
 *    that also emit `vf-btn`. `@keyframes` names are tracked so chunks that
 *    animate with another chunk's keyframes require it.
 * 2. Collects each component's emitted classes: string literals in its SFC
 *    sources (the adapter's own, falling back to core's for re-exported
 *    components), plus MANUAL_EMITS for template-literal classes with finite
 *    prop domains. The adapter config's baseClasses (`*element`) attribute
 *    to VfLayout — its template renders the wrapper DOM that carries them.
 * 3. Classes with no standalone selector in any chunk are semantic hooks for
 *    userland styling and are ignored.
 * 4. Because components resolve through global registration, every element
 *    renders inside VfLayout — chunks VfLayout imports count as a baseline
 *    that satisfies other components' requirements.
 *
 * styles.ts declares own chunks as `@/scss/<chunk>.scss` and core chunks as
 * `@vueform/core/<chunk>.css`. Where an own chunk shadows a layered core
 * chunk of the same name (e.g. primevue's form/grid/matrix/nav), BOTH are
 * required — the own chunk styles on top of core's base rules.
 *
 * Fails (exit 1) when a component emits a class whose providing chunk(s) are
 * not imported. Unused imports warn unless listed in ALLOWED_EXTRAS.
 *
 * Usage:
 *   pnpm validate:styles [--adapter ui|primevue] [--verbose] [--suggest]
 *
 * `--suggest` prints inferred styles.ts content per component instead of
 * validating — used to seed/refresh the sidecars.
 */
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const CORE_CSS = path.join(repoRoot, "packages/core/dist/css");
const CORE_COMPONENTS = path.join(repoRoot, "packages/core/src/components");

const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const suggest = args.includes("--suggest");
const adapterArg = args.includes("--adapter") ? args[args.indexOf("--adapter") + 1] : undefined;

interface AdapterSpec {
  componentsDir: string;
  configFile: string;
  /** Compiled chunk dir of the adapter's OWN chunks (`own:` provider space). */
  ownCssDir: string;
  /**
   * Core chunks the adapter's aggregate recipe layers its own chunks onto
   * (`core:` provider space). `null` when the adapter's own chunks ARE
   * core's (ui's forwarders) — core is not a separate provider space then.
   */
  coreRecipeChunks: string[] | null;
  manualEmits: Record<string, string[]>;
  /** Provider keys (`hr` shorthand for `own:hr`, or explicit `core:hr`). */
  allowedExtras: Record<string, string[]>;
}

const GRID_ALIGN = ["vf-left", "vf-center", "vf-right", "vf-top", "vf-middle", "vf-bottom", "vf-baseline"];

const ADAPTERS: Record<string, AdapterSpec> = {
  ui: {
    componentsDir: path.join(repoRoot, "packages/ui/src/components"),
    configFile: path.join(repoRoot, "packages/ui/src/config.ts"),
    ownCssDir: path.join(repoRoot, "packages/ui/dist/css"),
    coreRecipeChunks: null,
    manualEmits: { VfGrid: GRID_ALIGN, VfCol: GRID_ALIGN },
    allowedExtras: { VfLayout: ["hr", "blockquote"] },
  },
  primevue: {
    componentsDir: path.join(repoRoot, "packages/primevue/src/components"),
    configFile: path.join(repoRoot, "packages/primevue/src/config.ts"),
    ownCssDir: path.join(repoRoot, "packages/primevue/dist/css"),
    // pv forwards/merges every core chunk it uses into its own scss (like
    // ui), so its compiled chunks are the complete provider space.
    coreRecipeChunks: null,
    manualEmits: {
      VfGrid: GRID_ALIGN,
      VfCol: GRID_ALIGN,
      // Wrapped PrimeVue widget root classes — their internals (p-knob-text,
      // …) satisfy vendor selector mates by prefix.
      VfAddon: ["p-inputgroup"],
      VfButton: ["p-button"],
      VfCheckbox: ["p-checkbox"],
      VfColorPicker: ["p-colorpicker"],
      VfEditor: ["p-editor"],
      VfFileUpload: ["p-fileupload"],
      VfKnob: ["p-knob"],
      VfNav: ["p-step"],
      VfRadioButton: ["p-radiobutton"],
      VfRating: ["p-rating"],
      VfSlider: ["p-slider"],
      VfSteps: ["p-step"],
      VfToggleSwitch: ["p-toggleswitch"],
      // vf-horizontal/vf-vertical come from core's config label() formatter,
      // which pv inherits — layout-owned classes invisible in pv's own config.
      VfLayout: ["pi", "vf-horizontal", "vf-vertical"],
    },
    allowedExtras: {
      // hr/blockquote style user-authored markup; icon's iconfield rules and
      // addon's vendor-only selectors can't be inferred from vf-* classes;
      // steps styles the form under stepper panels.
      VfLayout: ["hr", "blockquote", "icon"],
      VfAddon: ["addon"],
      VfNav: ["steps"],
    },
  },
};

// ---------------------------------------------------------------------------
// 1. Chunk CSS → class providers + keyframes
// ---------------------------------------------------------------------------

interface Occurrence {
  provider: string;
  /** Other vf-* classes in the same compound selector. */
  mates: Set<string>;
}

const providers = new Map<string, Occurrence[]>();
const keyframesDefined = new Map<string, string>();
const keyframesUsed = new Map<string, Set<string>>();

function stripParens(selector: string): string {
  let out = selector;
  for (let prev = ""; prev !== out; ) {
    prev = out;
    out = out.replace(/\([^()]*\)/g, "");
  }
  return out;
}

function recordSelectors(provider: string, selectorText: string) {
  for (const sel of selectorText.split(",")) {
    const compounds = stripParens(sel)
      .split(/[\s>+~]+/)
      .filter(Boolean)
      .map((c) => [...c.matchAll(/\.([A-Za-z][A-Za-z0-9_-]*)/g)].map((m) => m[1]));
    if (!compounds.length) continue;
    // A class occurrence is gated by every OTHER vf-class in the whole
    // selector: a rule only styles anything when all of them are present, so
    // `.vf-element .vf-knob` never makes .vf-element require the knob chunk,
    // and `.vf-slider .vf-label` never makes .vf-label require slider —
    // while `.vf-tab-wrapper.vf-invalid .vf-tab` still ties .vf-invalid to
    // the tabs chunk for components that emit the tab classes.
    // Vendor classes (PrimeVue's p-*) gate too: a component only satisfies
    // them when its manualEmits declare the wrapped widget's root class.
    const all = compounds.flat();
    for (const cls of new Set(all)) {
      if (!cls.startsWith("vf-")) continue;
      const mates = new Set(all.filter((c) => c !== cls));
      let list = providers.get(cls);
      if (!list) providers.set(cls, (list = []));
      list.push({ provider, mates });
    }
  }
}

function skipBlock(css: string, openBrace: number): number {
  let depth = 0;
  for (let i = openBrace; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return i + 1;
  }
  return css.length;
}

function parseChunk(provider: string, css: string) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");

  for (const m of source.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)) {
    for (const name of m[1].matchAll(/vf-[A-Za-z0-9_-]+/g)) {
      let used = keyframesUsed.get(provider);
      if (!used) keyframesUsed.set(provider, (used = new Set()));
      used.add(name[0]);
    }
  }

  let buf = "";
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") {
      const head = buf.trim();
      buf = "";
      if (head.startsWith("@keyframes")) {
        keyframesDefined.set(head.replace("@keyframes", "").trim(), provider);
        i = skipBlock(source, i) - 1;
      } else if (!head.startsWith("@")) {
        recordSelectors(provider, head);
      }
      // At-rules with selectors inside (@media, @supports) just descend.
    } else if (ch === "}") {
      buf = "";
    } else {
      buf += ch;
    }
  }
}

function loadChunks(spec: AdapterSpec) {
  for (const file of fs.readdirSync(spec.ownCssDir).filter((f) => f.endsWith(".css"))) {
    if (file === "theme.css") continue;
    parseChunk(`own:${path.basename(file, ".css")}`, fs.readFileSync(path.join(spec.ownCssDir, file), "utf8"));
  }
  for (const chunk of spec.coreRecipeChunks ?? []) {
    const file = path.join(CORE_CSS, `${chunk}.css`);
    if (fs.existsSync(file)) parseChunk(`core:${chunk}`, fs.readFileSync(file, "utf8"));
  }
}

// ---------------------------------------------------------------------------
// 2. Emitted classes per component
// ---------------------------------------------------------------------------

function extractClassTokens(source: string): Set<string> {
  const stripped = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1")
    .replace(/<!--[\s\S]*?-->/g, "");
  const out = new Set<string>();
  // Plain string literals plus template literals without interpolation.
  for (const m of stripped.matchAll(/'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`\\\n$]*)`/g)) {
    for (const token of (m[1] ?? m[2] ?? m[3]).split(/\s+/)) {
      if (/^vf-[a-z0-9-]+$/.test(token)) out.add(token);
    }
  }
  return out;
}

function sfcDir(spec: AdapterSpec, name: string): string {
  const own = path.join(spec.componentsDir, name);
  if (fs.readdirSync(own).some((f) => f.endsWith(".vue"))) return own;
  return path.join(CORE_COMPONENTS, name);
}

function emittedClasses(spec: AdapterSpec, name: string): Set<string> {
  const dir = sfcDir(spec, name);
  const out = new Set<string>(spec.manualEmits[name] ?? []);
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".vue"))) {
    for (const cls of extractClassTokens(fs.readFileSync(path.join(dir, file), "utf8"))) {
      out.add(cls);
    }
  }
  if (name === "VfLayout") {
    for (const cls of extractClassTokens(fs.readFileSync(spec.configFile, "utf8"))) out.add(cls);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 3. Declared providers per component (the styles.ts imports)
// ---------------------------------------------------------------------------

function declaredProviders(spec: AdapterSpec, name: string): Set<string> {
  const stylesPath = path.join(spec.componentsDir, name, "styles.ts");
  if (!fs.existsSync(stylesPath)) return new Set();
  const source = fs.readFileSync(stylesPath, "utf8");
  const out = new Set<string>();
  for (const m of source.matchAll(/@\/scss\/([\w-]+)\.scss/g)) out.add(`own:${m[1]}`);
  for (const m of source.matchAll(/@vueform\/core\/([\w-]+)\.css/g)) out.add(`core:${m[1]}`);
  return out;
}

function normalizeExtras(spec: AdapterSpec, name: string): string[] {
  return (spec.allowedExtras[name] ?? []).map((a) => (a.includes(":") ? a : `own:${a}`));
}

function renderImport(provider: string): string {
  const [space, chunk] = provider.split(":");
  return space === "own" ? `import '@/scss/${chunk}.scss'` : `import '@vueform/core/${chunk}.css'`;
}

// ---------------------------------------------------------------------------
// 4. Run
// ---------------------------------------------------------------------------

function run(adapterName: string): number {
  const spec = ADAPTERS[adapterName];
  providers.clear();
  keyframesDefined.clear();
  keyframesUsed.clear();

  if (!fs.existsSync(spec.ownCssDir)) {
    console.error(`[validate:styles] ${path.relative(repoRoot, spec.ownCssDir)} not found — build first`);
    return 1;
  }
  loadChunks(spec);

  const components = fs
    .readdirSync(spec.componentsDir)
    .filter((e) => e.startsWith("Vf") && fs.statSync(path.join(spec.componentsDir, e)).isDirectory())
    .sort();

  const errors: string[] = [];
  const warnings: string[] = [];
  const baseline = declaredProviders(spec, "VfLayout");
  // Layout wrapper classes are present around every element — selector mates
  // like `.vf-label-group` in `.vf-slider .vf-label-group + …` should not
  // gate a component that renders inside the layout anyway.
  const layoutClasses = emittedClasses(spec, "VfLayout");

  for (const name of components) {
    const emitted = emittedClasses(spec, name);
    const declared = declaredProviders(spec, name);
    const matched = new Set<string>();
    const needed = new Set<string>();
    const openRequirements: string[][] = [];

    for (const cls of [...emitted].sort()) {
      const occurrences = providers.get(cls);
      if (!occurrences) continue; // semantic hook — no selector anywhere
      const qualifying = occurrences.filter((o) =>
        [...o.mates].every(
          (m) =>
            emitted.has(m) ||
            (m.startsWith("vf-") && layoutClasses.has(m)) ||
            // Vendor mates (p-*, pi-*) satisfy by prefix: declaring the
            // wrapped widget's root class (manualEmits: ['p-knob']) covers
            // its internals (p-knob-text, p-knob-range, …).
            (!m.startsWith("vf-") && [...emitted].some((e) => !e.startsWith("vf-") && m.startsWith(e))),
        ),
      );
      if (qualifying.length === 0) continue;

      // Own and layered-core providers are separate requirements: where an
      // own chunk shadows a core chunk it styles ON TOP of it.
      const spaces: string[][] = [];
      const own = [...new Set(qualifying.filter((o) => o.provider.startsWith("own:")).map((o) => o.provider))];
      const core = [...new Set(qualifying.filter((o) => o.provider.startsWith("core:")).map((o) => o.provider))];
      if (own.length) spaces.push(own);
      if (core.length) spaces.push(core);

      for (const options of spaces) {
        const declaredHit = options.find((p) => declared.has(p));
        if (declaredHit) {
          matched.add(declaredHit);
          needed.add(declaredHit);
        } else if (name !== "VfLayout" && options.some((p) => baseline.has(p))) {
          // Satisfied by the layout baseline every element renders within.
        } else if (suggest) {
          openRequirements.push(options);
        } else {
          errors.push(
            `${adapterName}/${name}: emits .${cls} but none of its providing chunk(s) [${options.join(", ")}] are imported in components/${name}/styles.ts`,
          );
        }
      }
    }

    // Greedy resolution of multi-provider requirements: providers covering
    // the most requirements win (so vf-left on VfCol picks grid, which its
    // other classes need anyway, not button).
    while (suggest && openRequirements.length) {
      const unresolved = openRequirements.filter((options) => !options.some((p) => needed.has(p)));
      if (!unresolved.length) break;
      const votes = new Map<string, number>();
      for (const options of unresolved) {
        for (const p of options) votes.set(p, (votes.get(p) ?? 0) + 1);
      }
      const winner = [...votes.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];
      needed.add(winner);
    }

    for (const provider of declared) {
      for (const kf of keyframesUsed.get(provider) ?? []) {
        const owner = keyframesDefined.get(kf);
        if (!owner || owner === provider) continue;
        if (declared.has(owner)) matched.add(owner);
        else
          errors.push(
            `${adapterName}/${name}: chunk '${provider}' animates with '${kf}' from '${owner}' — import it in components/${name}/styles.ts`,
          );
      }
    }

    if (suggest) {
      for (const provider of [...needed]) {
        for (const kf of keyframesUsed.get(provider) ?? []) {
          const owner = keyframesDefined.get(kf);
          if (owner && owner !== provider) needed.add(owner);
        }
      }
      for (const extra of normalizeExtras(spec, name)) needed.add(extra);
      if (needed.size) {
        console.log(`### ${name}\n${[...needed].sort().map(renderImport).join("\n")}\n`);
      }
      continue;
    }

    const extras = [...declared].filter(
      (provider) => !matched.has(provider) && !normalizeExtras(spec, name).includes(provider),
    );
    if (extras.length) {
      warnings.push(`${adapterName}/${name}: imported chunk(s) [${extras.join(", ")}] match none of its classes`);
    }

    if (verbose) {
      console.log(
        `${name}: declared=[${[...declared].sort().join(", ")}] matched=[${[...matched].sort().join(", ")}]`,
      );
    }
  }

  if (suggest) return 0;

  for (const warning of warnings) console.warn(`[validate:styles] warning: ${warning}`);
  if (errors.length) {
    for (const error of errors) console.error(`[validate:styles] ${error}`);
    console.error(`[validate:styles] ${adapterName} FAILED — ${errors.length} problem(s)`);
    return 1;
  }
  console.log(`[validate:styles] ${adapterName} OK — ${components.length} components checked`);
  return 0;
}

const adapterNames = adapterArg ? [adapterArg] : Object.keys(ADAPTERS);
let exitCode = 0;
for (const name of adapterNames) {
  if (!ADAPTERS[name]) {
    console.error(`[validate:styles] unknown adapter '${name}'`);
    exitCode = 1;
    continue;
  }
  exitCode = Math.max(exitCode, run(name));
}
process.exit(exitCode);
