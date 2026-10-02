#!/usr/bin/env node
/**
 * Committed bin shim: pnpm only links bins whose target exists at install time,
 * and `dist/` is not built yet on a fresh `pnpm install`. This file is always
 * present, so the link is created; the real CLI loads from dist at run time
 * (i.e. after `pnpm build`).
 */
require('../dist/registry-cli.js')
