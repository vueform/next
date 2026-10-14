#!/usr/bin/env node
/**
 * Committed bin shim: pnpm only links bins whose target exists at install time,
 * and `dist/` is not built yet on a fresh `pnpm install`. This file is always
 * present, so the link is created; the real CLI loads from dist at run time
 * (i.e. after `pnpm build`).
 */

// The suite's cost is gzip/brotli-max compression, run async on the libuv
// threadpool — size it to the machine before anything can initialize the pool
// (it defaults to 4 threads). The CLI is loaded with a dynamic import so this
// assignment runs first (a static import would be hoisted above it).
import { availableParallelism } from 'node:os'

if (!process.env.UV_THREADPOOL_SIZE) {
  process.env.UV_THREADPOOL_SIZE = String(availableParallelism())
}

await import('../dist/size-cli.js')
