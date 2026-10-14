/**
 * The window handle the Playwright specs read: submitted payload, the vapor
 * marker, and runtime probes mirroring the type-level assertions.
 */
interface SmokeGlobal {
  submitted: unknown
  vaporActive: boolean
  /**
   * Whether `form$.find(name)` resolves an element — the adapter-neutral
   * "did this canonical family mount" probe the boot spec iterates.
   */
  finds: (name: string) => boolean
  model: () => unknown
}

interface Window {
  __smoke: SmokeGlobal
  __SMOKE_VAPOR_APP__?: boolean
}
