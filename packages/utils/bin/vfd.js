#!/usr/bin/env node
/**
 * Committed bin shim: pnpm only links bins whose target exists at install time,
 * and `dist/` is not built yet on a fresh `pnpm install`. This file is always
 * present, so the link is created; the real CLIs load from dist at run time
 * (i.e. after `pnpm build`).
 *
 * Single `vfd <command>` entry dispatching to the per-command CLIs:
 *
 *     vfd registry|size|smoke|smoke-types [args...]
 */
const commands = {
  registry: '../dist/registry-cli.js',
  size: '../dist/size-cli.js',
  smoke: '../dist/smoke-cli.js',
  'smoke-types': '../dist/smoke-types-cli.js',
}

const command = process.argv[2]
const target = commands[command]

if (!target) {
  console.error(
    `vfd: unknown command ${command ? `"${command}"` : '(none)'} — expected one of: ${Object.keys(commands).join(', ')}`
  )
  process.exit(1)
}

// The per-command CLIs parse `process.argv.slice(2)` — drop the command name
// so their flags/positionals land where they expect.
process.argv.splice(2, 1)

if (command === 'size') {
  // The size suite's cost is gzip/brotli-max compression, run async on the
  // libuv threadpool — size it to the machine before anything can initialize
  // the pool (it defaults to 4 threads). The CLI is loaded with a dynamic
  // import so this assignment runs first.
  const { availableParallelism } = await import('node:os')

  if (!process.env.UV_THREADPOOL_SIZE) {
    process.env.UV_THREADPOOL_SIZE = String(availableParallelism())
  }
}

await import(target)
