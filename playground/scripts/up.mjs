import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const templatesDir = path.join(repoRoot, "playground", "templates");
const outputDir = path.join(repoRoot, ".playgrounds", "templates");

const TEMPLATES = ["ui", "primevue", "nuxt", "nuxt-primevue", "vapor", "vapor-primevue"];
// Playgrounds excluded from the pnpm workspace (own lockfile/node_modules),
// installed with `pnpm install --ignore-workspace` inside their directory.
const STANDALONE = new Set(["vapor", "vapor-primevue"]);
const ALIASES = { pv: "primevue", "nuxt-pv": "nuxt-primevue", "vapor-pv": "vapor-primevue" };
function resolveAlias(name) {
  return ALIASES[name] ?? name;
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (res.status !== 0) process.exit(res.status ?? 1);
}

function patchPackageName(pkgPath, name) {
  if (!exists(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  let changed = false;

  if (pkg.name !== name) {
    pkg.name = name;
    changed = true;
  }

  if (pkg.private !== true) {
    pkg.private = true;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }
}

function parseArgs(argv) {
  const selected = new Set();
  let force = false;

  for (const a of argv) {
    if (a === "--force") {
      force = true;
      continue;
    }

    if (a.startsWith("--")) {
      selected.add(resolveAlias(a.slice(2)));
    }
  }

  if (selected.size === 0) return { selected: null, force };

  const available = new Set(TEMPLATES);
  const unknown = [...selected].filter((t) => !available.has(t));

  if (unknown.length) {
    console.error(
      `[pg:up] Unknown playground(s): ${unknown.join(", ")}\nAvailable: ${TEMPLATES.join(", ")}`
    );
    process.exit(1);
  }

  return { selected, force };
}

const argv = process.argv.slice(2);
const { selected, force } = parseArgs(argv);

const toProcess = selected
  ? TEMPLATES.filter((t) => selected.has(t))
  : TEMPLATES;

if (!exists(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let createdCount = 0;

for (const name of toProcess) {
  const src = path.join(templatesDir, name);
  const dest = path.join(outputDir, name);
  const destPkg = path.join(dest, "package.json");

  if (!exists(src)) {
    console.error(`[pg:up] Template "${name}" not found at: ${path.relative(repoRoot, src)}`);
    process.exit(1);
  }

  let recreated = false;

  if (exists(dest)) {
    if (force) {
      console.log(`[pg:up] --force: removing existing "${name}"...`);
      fs.rmSync(dest, { recursive: true, force: true });
      recreated = true;
    } else {
      console.log(`[pg:up] "${name}" already exists, skipping. Use pg:re to recreate.`);
      continue;
    }
  }

  if (!exists(dest)) {
    console.log(`[pg:up] Creating "${name}" from playground/templates/${name}...`);
    fs.cpSync(src, dest, { recursive: true });
    recreated = true;
    createdCount++;
  }

  patchPackageName(destPkg, name);

  if (recreated && exists(destPkg)) {
    console.log(`[pg:up] Installing deps for "${name}"...`);
    if (STANDALONE.has(name)) {
      run("pnpm", ["install", "--ignore-workspace"], dest);
    } else {
      run("pnpm", ["install"], repoRoot);
    }
  }
}

if (!createdCount && !force) {
  console.log("[pg:up] Done. Nothing new was created.");
}
