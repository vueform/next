import docsConfig from '../../../config.json'

const DEFAULT_ADAPTER = 'ui'
const DEFAULT_PKG = '@vueform/ui'

function esc(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface AdapterReplacements {
  pkg: string
  components: [RegExp, string][]
  types: [RegExp, string][]
  props: [RegExp, string][]
}

function buildReplacements(adapterKey: string): AdapterReplacements | null {
  if (adapterKey === DEFAULT_ADAPTER) return null

  const cfg = (docsConfig.adapters as Record<string, any>)[adapterKey]
    ?.overrides
  const replacements: AdapterReplacements = {
    pkg: `@vueform/${adapterKey}`,
    components: [],
    types: [],
    props: [],
  }

  if (cfg) {
    for (const [from, to] of Object.entries(cfg.components ?? {}) as [
      string,
      string,
    ][]) {
      replacements.components.push([new RegExp(`\\b${esc(from)}\\b`, 'g'), to])
    }
    for (const [from, to] of Object.entries(cfg.types ?? {}) as [
      string,
      string,
    ][]) {
      replacements.types.push([
        new RegExp(`(?<=['"\`])${esc(from)}(?=['"\`])`, 'g'),
        to,
      ])
    }
    for (const [from, to] of Object.entries(cfg.props ?? {}) as [
      string,
      string,
    ][]) {
      const startsWithNonWord = /^\W/.test(from)
      const endsWithNonWord = /\W$/.test(from)

      let leading: string, trailing: string
      if (from.includes('-')) {
        leading = startsWithNonWord ? '' : String.raw`(?<![\w-])`
        trailing = endsWithNonWord ? '' : String.raw`(?![\w-])`
      } else {
        leading = startsWithNonWord ? '' : String.raw`(?<![\w-])`
        trailing = endsWithNonWord ? '' : String.raw`(?!\w)`
      }

      replacements.props.push([
        new RegExp(`${leading}${esc(from)}${trailing}`, 'g'),
        to,
      ])
    }
  }

  return replacements
}

function applyReplacements(code: string, r: AdapterReplacements): string {
  let result = code.replace(new RegExp(esc(DEFAULT_PKG), 'g'), r.pkg)
  for (const [re, to] of r.components) {
    result = result.replace(re, to)
  }
  for (const [re, to] of r.types) {
    result = result.replace(re, to)
  }
  for (const [re, to] of r.props) {
    result = result.replace(re, to)
  }
  return result
}

export function adapterContent(md: any) {
  const adapter = process.env.VF_ADAPTER ?? DEFAULT_ADAPTER
  const replacements = buildReplacements(adapter)
  if (!replacements) return

  md.core.ruler.push('adapter_content', (state: any) => {
    for (const token of state.tokens) {
      if (token.content) {
        token.content = applyReplacements(token.content, replacements)
      }
      if (token.type === 'link_open' && token.attrs) {
        for (const attr of token.attrs) {
          if (attr[0] === 'href') {
            attr[1] = applyReplacements(attr[1], replacements)
          }
        }
      }
      if (token.children) {
        for (const child of token.children) {
          if (child.content) {
            child.content = applyReplacements(child.content, replacements)
          }
          if (child.type === 'link_open' && child.attrs) {
            for (const attr of child.attrs) {
              if (attr[0] === 'href') {
                attr[1] = applyReplacements(attr[1], replacements)
              }
            }
          }
        }
      }
    }
  })
}
