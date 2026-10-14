#!/usr/bin/env node
// Re-exposes the Vueform CLI's launcher: bins only land in a project's
// node_modules/.bin when a DIRECT dependency declares them, so the adapter
// carries the bin and @vueform/cli (this package's dependency) does the work.
import '@vueform/cli/bin'
