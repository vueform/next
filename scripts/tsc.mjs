import { spawnSync } from "node:child_process";
import { pkgRun } from "./pkg-run.mjs";

const ALIASES = {
  pv: "primevue",
};

const flags = process.argv
  .slice(2)
  .filter((a) => a.startsWith("--"))
  .map((a) => a.slice(2));

const resolved = flags.map((f) => ALIASES[f] ?? f);
const dry = flags.includes("dry");
const targetsAdapter = resolved.length > 0 && !resolved.every((f) => f === "core" || f === "dry");

if (targetsAdapter && !dry) {
  console.log("[tsc] Building core first...");
  const res = spawnSync("pnpm", ["build", "--core"], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

if (dry) {
  process.argv = process.argv.filter((a) => a !== "--dry");
}

pkgRun("tsc");
