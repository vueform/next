/**
 * The smoke-test env model.
 *
 * An env is one project setup an adapter is smoke-tested in, described by
 * three dimensions: framework (vite | nuxt), rendering (spa | ssr) and mode
 * (vdom | vapor). The CLI runs the full set, or a single env selected by id
 * (`--env <id>`).
 */

export const FRAMEWORKS = ['vite', 'nuxt'] as const
export const RENDERINGS = ['spa', 'ssr'] as const
export const MODES = ['vdom', 'vapor'] as const
export const PMS = ['pnpm', 'npm', 'yarn', 'bun'] as const

export type Framework = (typeof FRAMEWORKS)[number]
export type Rendering = (typeof RENDERINGS)[number]
export type SfcMode = (typeof MODES)[number]
export type Pm = (typeof PMS)[number]

export interface EnvDef {
  /**
   * Env id, also the run directory suffix.
   */
  id: string
  framework: Framework
  rendering: Rendering
  mode: SfcMode
  /**
   * Fixture shell under `fixtures/smoke-test/envs/` (in @vueform/utils).
   * Variants (nuxt-spa) share the fixture of their base env.
   */
  fixture: string
  /**
   * Extra env vars the fixture's scripts receive (variant flips).
   */
  fixtureEnv?: Record<string, string>
  note: string
}

export const ENVS: EnvDef[] = [
  {
    id: 'vite',
    framework: 'vite',
    rendering: 'spa',
    mode: 'vdom',
    fixture: 'vite',
    note: 'plain Vite SPA, vite build + preview',
  },
  {
    id: 'vite-ssr',
    framework: 'vite',
    rendering: 'ssr',
    mode: 'vdom',
    fixture: 'vite-ssr',
    note: 'minimal Vite SSR (no Nuxt)',
  },
  {
    id: 'vapor',
    framework: 'vite',
    rendering: 'spa',
    mode: 'vapor',
    fixture: 'vapor',
    note: 'Vue Vapor SFC compilation (vue 3.6)',
  },
  {
    id: 'nuxt',
    framework: 'nuxt',
    rendering: 'ssr',
    mode: 'vdom',
    fixture: 'nuxt',
    note: '@vueform/nuxt-module module, nuxi build + preview (SSR)',
  },
  {
    id: 'nuxt-spa',
    framework: 'nuxt',
    rendering: 'spa',
    mode: 'vdom',
    fixture: 'nuxt',
    fixtureEnv: { SMOKE_NUXT_SSR: 'false' },
    note: 'same nuxt fixture with ssr: false',
  },
]
