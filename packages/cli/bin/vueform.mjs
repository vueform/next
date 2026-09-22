#!/usr/bin/env node
import { run } from '../src/index.mjs'

// Exit quietly when the consumer closes the pipe early (`vueform list | head`).
process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') process.exit(0)
  throw err
})

run(process.argv.slice(2)).catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
