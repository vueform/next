import { computed, toValue, type CSSProperties } from 'vue'
import { warn, isDev } from '~/utils'
import type { ThemeModule } from './types'

let warnedMissingModule = false

// Never mutated — shared by every caller.
const emptyTokens = computed<CSSProperties>(() => ({}))

function warnMissingModule(tokens: unknown) {
  const hasTokens = !!tokens && Object.keys(tokens).length > 0
  if (!hasTokens || warnedMissingModule) return
  warnedMissingModule = true

  if (isDev()) {
    warn(
      '`tokens` were provided but the `theme` module is ' +
        'not registered; skipping token styles. Register it via ' +
        '`createVueform({ modules: { theme } })`.'
    )
  }
}

/**
 * The inert theme surface used when the `theme` module is not registered —
 * behaves as if theming wasn't there: token styles resolve to an empty object
 * and no CSS is generated or injected. Warns once in dev when tokens are
 * actually provided.
 */
export const noopTheme: ThemeModule = {
  makeTokens: (tokens) => {
    warnMissingModule(toValue(tokens))
    return emptyTokens
  },
}
