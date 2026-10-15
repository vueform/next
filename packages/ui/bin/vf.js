#!/usr/bin/env node
// Re-exposes the Vueform CLI's launcher: bins only land in a project's
// node_modules/.bin when a DIRECT dependency declares them, so the adapter
// carries the bin and @vueform/core (this package's dependency) forwards to
// @vueform/cli, which does the work.
import '@vueform/core/bin'
