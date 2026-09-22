import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const templatesDir = path.join(repoRoot, "playground", "templates");
const outputDir = path.join(repoRoot, ".playgrounds", "templates");

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

const ALIASES = { pv: "primevue", "nuxt-pv": "nuxt-primevue", "vapor-pv": "vapor-primevue" };
function resolveAlias(name) {
  return ALIASES[name] ?? name;
}

function listPlaygrounds() {
  if (!exists(templatesDir)) return [];
  return fs
    .readdirSync(templatesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name);
}

function run(cmd, args, cwd, env = {}) {
  const res = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
  });

  if (res.status !== 0) process.exit(res.status ?? 1);
}

const available = listPlaygrounds();
const argv = process.argv.slice(2);

const selected = argv
  .filter((a) => a.startsWith("--"))
  .map((a) => resolveAlias(a.slice(2)));

if (!selected.length) {
  console.error(
    `[pg:build] Usage: pnpm pg:build --<playground>\nAvailable: ${available.join(", ")}`
  );
  process.exit(1);
}

const unknown = selected.filter((s) => !available.includes(s));
if (unknown.length) {
  console.error(
    `[pg:build] Unknown playground(s): ${unknown.join(", ")}\nAvailable: ${available.join(", ")}`
  );
  process.exit(1);
}

for (const name of selected) {
  const pgDir = path.join(outputDir, name);

  if (!exists(pgDir)) {
    console.error(
      `[pg:build] Playground "${name}" not found at .playgrounds/templates/${name}.\nRun "pnpm pg:up --${name}" first.`
    );
    process.exit(1);
  }

  console.log(`[pg:build] Building "${name}"...`);
  run("pnpm", ["run", "build"], pgDir, { USE_DEV: "true" });
}
