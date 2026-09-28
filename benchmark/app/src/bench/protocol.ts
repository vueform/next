/**
 * The contract between this page and the Playwright harness.
 *
 * The harness navigates to `index.html?case=<id>&n=<count>` and waits for
 * `window.__bench`. Nothing is mounted until it calls `run()`, so the harness
 * can take its pre-run heap baseline against an idle page. `run()` resolves
 * with a JSON-serializable result once the case's measurement is done.
 */

export interface BenchParams {
  case: string
  n: number
  /** Untimed iterations before measurement (iterate cases only). */
  warmup: number
  /** Timed iterations (iterate cases only). */
  iterations: number
}

export interface BenchResult {
  /**
   * Milliseconds of one logical run: the full mount for mount cases, the
   * per-iteration mean of the timed batch for iterate cases.
   */
  duration: number
  iterations: number
}

declare global {
  interface Window {
    __bench: {
      params: BenchParams
      run: () => Promise<BenchResult>
    }
  }
}

export function getParams(): BenchParams {
  const query = new URLSearchParams(window.location.search)
  const int = (name: string, fallback: number) => {
    const value = Number.parseInt(query.get(name) ?? '', 10)
    return Number.isFinite(value) && value > 0 ? value : fallback
  }

  return {
    case: query.get('case') ?? 'render-text',
    n: int('n', 100),
    warmup: int('warmup', 10),
    iterations: int('iterations', 50),
  }
}

export function raf(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}
