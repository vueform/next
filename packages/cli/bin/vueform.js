#!/usr/bin/env node
// Plain-JS launcher: stable bin path, independent of the build layout.
// All logic lives in the compiled library (dist/, built from src/).
import { run } from '../dist/index.js'

// Exit quietly when the consumer closes the pipe early (`vueform list | head`).
process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') process.exit(0)
  throw err
})

run(process.argv.slice(2)).catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
