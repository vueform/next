/**
 * Playground fragment: app-level wiring the ui adapter needs. Copied into a
 * generated playground as `src/adapter.setup.ts` by pg:up.
 */
import type { App } from 'vue'

export function installApp(_app: App, _mode: { vapor: boolean }): void {}

/**
 * Options merged into `createVueform()` under the user config.
 */
export const vueformConfig = {
  icon: (name: string) =>
    !name
      ? ''
      : name.startsWith('vf-') || name.startsWith('fa-')
        ? name
        : `fa-solid fa-${name}`,
}
