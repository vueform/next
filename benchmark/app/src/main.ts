import { createVueform } from '@vueform/ui/bundle'
import { createApp, createVaporApp, nextTick, type VaporComponent } from 'vue'

import App from './App.vue'
import { params, spec } from './bench/current'
import { raf, type BenchResult } from './bench/protocol'

/**
 * Mounts the form and returns once it is interactive: Vue's flush plus two
 * animation frames, so the mounted DOM has actually been painted.
 */
async function mount(): Promise<void> {
  // The SFC is vapor-compiled in the vapor build (vite plugin
  // `features.vapor`), but vue-language-tools still types it as a vdom
  // component.
  const app = __BENCH_VAPOR__
    ? createVaporApp(App as unknown as VaporComponent)
    : createApp(App)

  app.use(
    createVueform({
      icon: (name: string) =>
        !name
          ? ''
          : name.startsWith('vf-') || name.startsWith('fa-')
            ? name
            : `fa-solid fa-${name}`,
    })
  )

  app.mount('#app')

  await nextTick()
  await raf()
  await raf()
}

async function run(): Promise<BenchResult> {
  if (spec.measure === 'mount') {
    const start = performance.now()
    await mount()
    return { duration: performance.now() - start, iterations: 1 }
  }

  await mount()
  spec.prepare?.(params.n)

  const iterate = spec.iterate!

  for (let i = 0; i < params.warmup; i++) {
    await iterate(params.n, i)
  }

  // One event costs less than the browser's ~0.1 ms timer granularity, so
  // the batch is timed as a whole and divided — a per-event mean.
  const start = performance.now()

  for (let i = 0; i < params.iterations; i++) {
    await iterate(params.n, params.warmup + i)
  }

  const total = performance.now() - start

  return { duration: total / params.iterations, iterations: params.iterations }
}

// Nothing mounts until the harness calls run(), so its pre-run heap
// baseline sees an idle page.
window.__bench = { params, run }
