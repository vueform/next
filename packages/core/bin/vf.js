#!/usr/bin/env node
// Re-exposes the Vueform CLI's launcher: @vueform/cli is core's dependency,
// and core exports this shim as `@vueform/core/bin` so the adapters can carry
// the same bin without depending on the CLI package themselves.
import '@vueform/cli/bin'
