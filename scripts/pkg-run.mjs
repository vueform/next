/**
 * Shared helper: run a script across packages, filtered by --flags.
 *
 * Flags that match a package name (or alias) select which packages to run.
 * Any other flags are passed through to the underlying script.
 *
 * Usage (from another script):
 *   import { pkgRun } from './pkg-run.mjs'
 *   pkgRun('build')                              // reads process.argv for --flags
 *   pkgRun('build', { defaults: ['core', 'ui'] }) // only core+ui when no flags
 *   pkgRun('tc')
 *
 * Examples:
 *   pnpm build                  # default packages (or all if no defaults)
 *   pnpm build --all            # all packages (overrides defaults)
 *   pnpm build --vite           # expand group "vite" to its member packages
 *   pnpm build --core --ui      # just core + ui
 *   pnpm build --core --watch   # core with --watch passed through
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();
const packagesDir = path.join(repoRoot, "packages");

const ALIASES = {
  pv: "primevue",
};

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function listPackagesWithScript(scriptName) {
  if (!exists(packagesDir)) return [];
  return fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => {
      const pkgPath = path.join(packagesDir, name, "package.json");
      if (!exists(pkgPath)) return false;
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      return pkg.scripts?.[scriptName] != null;
    });
}

function run(cmd, args) {
  const res = spawnSync(cmd, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (res.status !== 0) process.exit(res.status ?? 1);
}

export function pkgRun(scriptName, { defaults, groups } = {}) {
  const available = listPackagesWithScript(scriptName);
  const allNames = new Set([...available, ...Object.keys(ALIASES)]);
  const groupNames = new Set(Object.keys(groups ?? {}));
  const argv = process.argv.slice(2);

  const flags = argv
    .filter((a) => a.startsWith("--"))
    .map((a) => a.slice(2));

  const runAll = flags.includes("all");
  const pkgFlags = [];
  const passthrough = [];

  for (const flag of flags) {
    if (flag === "all") continue;
    if (groupNames.has(flag)) {
      pkgFlags.push(...groups[flag]);
    } else if (allNames.has(flag)) {
      pkgFlags.push(flag);
    } else {
      passthrough.push(`--${flag}`);
    }
  }

  if (!pkgFlags.length && (runAll || !defaults?.length)) {
    console.log(`[${scriptName}] Running ${scriptName} for all packages...`);
    run("pnpm", ["-r", "--filter", "./packages/**", "run", scriptName, ...passthrough]);
    return;
  }

  if (!pkgFlags.length && defaults?.length) {
    pkgFlags.push(...defaults);
  }

  const resolved = pkgFlags.map((flag) => {
    const name = ALIASES[flag] ?? flag;
    if (!available.includes(name)) {
      const aliasHints = Object.entries(ALIASES)
        .map(([k, v]) => `${k} → ${v}`)
        .join(", ");
      console.error(
        `[${scriptName}] Unknown package: "${flag}"\nAvailable: ${available.join(", ")}\nAliases: ${aliasHints}`
      );
      process.exit(1);
    }
    return name;
  });

  const extra = passthrough.length ? ` (${passthrough.join(" ")})` : "";
  console.log(`[${scriptName}] Running ${scriptName} for ${resolved.join(", ")}${extra}...`);

  const filters = resolved.flatMap((name) => ["--filter", `./packages/${name}`]);
  run("pnpm", ["-r", ...filters, "run", scriptName, ...passthrough]);
}
