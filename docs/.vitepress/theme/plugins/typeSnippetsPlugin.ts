import fs from 'node:fs'
import path from 'node:path'

import {
  createHighlighter,
  type Highlighter,
  type ShikiTransformer,
} from 'shiki'
import type { Plugin } from 'vite'

import { keywordLink } from './keywordLink'

const ROUTE_PREFIX = '/type-snippets/'

/**
 * Vite plugin that serves syntax-highlighted HTML for type snippet files stored
 * in `docs/types/*.md`.
 *
 * - Dev: serves via middleware at `/@type-snippets/{Name}.html`
 * - Build: emits static HTML files into the output directory
 */
export function typeSnippetsPlugin(): Plugin {
  let typesDirs: string[] = []
  let rootDir: string
  let highlighter: Highlighter | null = null
  const cache = new Map<string, { html: string; mtimeMs: number }>()
  const inlineCache = new Map<string, string>()

  async function getHighlighter(): Promise<Highlighter> {
    if (!highlighter) {
      highlighter = await createHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: ['typescript'],
      })
    }
    return highlighter
  }

  function extractCode(md: string): string {
    // The closing fence must be as long as the opening one, so a shorter
    // ``` example inside a docblock cannot end the block early.
    const match = md.match(
      /^(`{3,})(?:ts|typescript)[^\n]*\n([\s\S]*?)\n\1[ \t]*$/m
    )
    return match ? match[2].trimEnd() : md
  }

  interface JsDocTag {
    tag: string
    name?: string
    text: string
  }

  interface ParsedSnippet {
    code: string
    description: string
    tags: JsDocTag[]
  }

  function parseSnippet(raw: string): ParsedSnippet {
    const code = extractCode(raw)

    const jsdocMatch = code.match(/\/\*\*\s*\n([\s\S]*?)\*\/\s*\n/)
    if (!jsdocMatch || jsdocMatch.index !== 0) {
      return { code: stripExport(code), description: '', tags: [] }
    }

    const jsdocBody = jsdocMatch[1]
    const codeWithoutJsdoc = code.slice(jsdocMatch[0].length)

    const lines = jsdocBody.split('\n').map((l) => l.replace(/^\s*\*\s?/, ''))
    let description = ''
    const tags: JsDocTag[] = []
    let currentTag: JsDocTag | null = null

    for (const line of lines) {
      const tagMatch = line.match(/^@(\w+)\s*(.*)/)
      if (tagMatch) {
        if (currentTag) tags.push(currentTag)
        const tagName = tagMatch[1]
        const rest = tagMatch[2].trim()
        if (['param', 'template'].includes(tagName)) {
          const paramMatch = rest.match(/^(\S+)\s*(.*)/)
          currentTag = {
            tag: tagName,
            name: paramMatch?.[1] || '',
            text: paramMatch?.[2]?.replace(/^-\s*/, '') || '',
          }
        } else {
          currentTag = { tag: tagName, text: rest }
        }
      } else if (currentTag) {
        if (line.trim() === '') {
          currentTag.text += '\n\n'
        } else {
          currentTag.text += ' ' + line.trim()
        }
      } else {
        if (line.trim() === '') {
          if (description) description += '\n\n'
        } else if (line.trim().startsWith('- ')) {
          description +=
            (description.endsWith('\n\n') ? '' : '\n') + line.trim()
        } else {
          description +=
            (description && !description.endsWith('\n\n') ? ' ' : '') +
            line.trim()
        }
      }
    }
    if (currentTag) tags.push(currentTag)

    return {
      code: stripExport(codeWithoutJsdoc),
      description: description.trim(),
      tags,
    }
  }

  function stripExport(code: string): string {
    return code.replace(/^export\s+/gm, '')
  }

  async function highlightCode(code: string): Promise<string> {
    const hl = await getHighlighter()
    return hl.codeToHtml(code, {
      lang: 'typescript',
      themes: { light: 'github-light', dark: 'github-dark' },
      transformers: [keywordLink()],
    })
  }

  function resolveTypeFile(name: string): string | null {
    for (const dir of typesDirs) {
      if (!fs.existsSync(dir)) continue

      const flat = path.join(dir, `${name}.md`)
      if (fs.existsSync(flat)) return flat

      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue
        const sub = path.join(dir, entry.name, `${name}.md`)
        if (fs.existsSync(sub)) return sub
      }
    }

    return null
  }

  async function renderSnippet(name: string): Promise<string | null> {
    const filePath = resolveTypeFile(name)
    if (!filePath) return null

    let stat: fs.Stats
    try {
      stat = fs.statSync(filePath)
    } catch {
      return null
    }

    const cached = cache.get(name)
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached.html

    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = parseSnippet(raw)
    const codeHtml = await highlightCode(parsed.code)

    const json = JSON.stringify({
      codeHtml,
      description: parsed.description,
      tags: parsed.tags,
    })

    cache.set(name, { html: json, mtimeMs: stat.mtimeMs })
    return json
  }

  const DECL_PREFIX = 'declare const '

  function stripPrefixTransformer(prefixLen: number): ShikiTransformer {
    let firstLine = true
    return {
      line(node) {
        if (!firstLine) return
        firstLine = false

        let remaining = prefixLen
        const kept: typeof node.children = []

        for (const child of node.children) {
          if (remaining <= 0) {
            kept.push(child)
            continue
          }
          if (child.type !== 'element') continue

          const textNode = child.children?.[0]
          if (textNode?.type !== 'text') {
            kept.push(child)
            continue
          }

          const len = textNode.value.length
          if (len <= remaining) {
            remaining -= len
          } else {
            textNode.value = textNode.value.slice(remaining)
            remaining = 0
            kept.push(child)
          }
        }

        node.children = kept
      },
    }
  }

  function prependLabelTransformer(label: string): ShikiTransformer {
    let firstLine = true
    return {
      line(node) {
        if (!firstLine) return
        firstLine = false
        node.children.unshift({
          type: 'element',
          tagName: 'span',
          properties: { class: 'property-label' },
          children: [{ type: 'text', value: label }],
        })
      },
    }
  }

  async function renderInlineCode(code: string): Promise<string> {
    const cached = inlineCache.get(code)
    if (cached) return cached

    const hl = await getHighlighter()
    const html = hl.codeToHtml(DECL_PREFIX + code, {
      lang: 'typescript',
      themes: { light: 'github-light', dark: 'github-dark' },
      transformers: [
        keywordLink(),
        stripPrefixTransformer(DECL_PREFIX.length),
        prependLabelTransformer('(property) '),
      ],
    })

    inlineCache.set(code, html)
    return html
  }

  const VALUE_PREFIX = 'const _ = '

  async function renderInlineValue(code: string): Promise<string> {
    const cacheKey = `__value__${code}`
    const cached = inlineCache.get(cacheKey)
    if (cached) return cached

    const hl = await getHighlighter()
    const html = hl.codeToHtml(VALUE_PREFIX + code, {
      lang: 'typescript',
      themes: { light: 'github-light', dark: 'github-dark' },
      transformers: [
        keywordLink(),
        stripPrefixTransformer(VALUE_PREFIX.length),
      ],
    })

    inlineCache.set(cacheKey, html)
    return html
  }

  function collectInlineTypes(): Set<string> {
    const types = new Set<string>()
    const uiDir = path.resolve(rootDir, 'ui')
    if (!fs.existsSync(uiDir)) return types

    const re = /\[`([^`]+)`\]\(!code[^"]*"([^"]+)"\)/g
    for (const file of fs.readdirSync(uiDir).filter((f) => f.endsWith('.md'))) {
      const content = fs.readFileSync(path.join(uiDir, file), 'utf-8')
      let m: RegExpExecArray | null
      while ((m = re.exec(content)) !== null) {
        const name = m[1].replace(/\(\)$/, '')
        const raw = m[2].replace(/\\\|/g, '|')
        const type = raw.split('\t')[0]
        types.add(`${name}: ${type}`)
      }
    }
    return types
  }

  function collectInlineValues(): Set<string> {
    const values = new Set<string>()
    const uiDir = path.resolve(rootDir, 'ui')
    if (!fs.existsSync(uiDir)) return values

    const re = /\[`([^`]+)`\]\(!value[^"]*"([^"]+)"\)/g
    for (const file of fs.readdirSync(uiDir).filter((f) => f.endsWith('.md'))) {
      const content = fs.readFileSync(path.join(uiDir, file), 'utf-8')
      let m: RegExpExecArray | null
      while ((m = re.exec(content)) !== null) {
        values.add(m[2].replace(/\\\|/g, '|'))
      }
    }
    return values
  }

  return {
    name: 'vitepress-type-snippets',

    configResolved(config) {
      rootDir = config.root || process.cwd()
      const ADAPTER = process.env.VF_ADAPTER ?? 'ui'

      const docsRoot = path.resolve(rootDir, '..')
      const adapterDefs: Record<string, { typesOutputDir: string }> =
        JSON.parse(
          fs.readFileSync(path.join(docsRoot, 'config.json'), 'utf-8')
        ).adapters

      const coreDef = adapterDefs.ui
      typesDirs = [path.resolve(docsRoot, coreDef.typesOutputDir)]

      if (ADAPTER !== 'ui' && adapterDefs[ADAPTER]) {
        const adapterTypesDir = path.resolve(
          docsRoot,
          adapterDefs[ADAPTER].typesOutputDir
        )
        if (fs.existsSync(adapterTypesDir)) typesDirs.push(adapterTypesDir)
      }
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith(ROUTE_PREFIX)) return next()

        const fileName = req.url.slice(ROUTE_PREFIX.length)

        if (fileName.startsWith('_code/')) {
          const encoded = fileName.slice('_code/'.length).replace(/\.html$/, '')
          const code = Buffer.from(encoded, 'base64url').toString()
          const html = await renderInlineCode(code)

          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(html)
          return
        }

        if (fileName.startsWith('_value/')) {
          const encoded = fileName
            .slice('_value/'.length)
            .replace(/\.html$/, '')
          const code = Buffer.from(encoded, 'base64url').toString()
          const html = await renderInlineValue(code)

          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(html)
          return
        }

        const name = fileName.replace(/\.html$/, '')
        const html = await renderSnippet(name)
        if (html === null) {
          res.statusCode = 404
          res.end('Not found')
          return
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(html)
      })
    },

    async generateBundle() {
      const collectMdFiles = (dir: string): string[] => {
        if (!fs.existsSync(dir)) return []
        const results: string[] = []
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          if (entry.isDirectory()) {
            results.push(...collectMdFiles(path.join(dir, entry.name)))
          } else if (entry.name.endsWith('.md')) {
            results.push(entry.name)
          }
        }
        return results
      }

      const allFiles = new Set<string>()
      for (const dir of typesDirs) {
        for (const file of collectMdFiles(dir)) {
          allFiles.add(file)
        }
      }

      for (const file of allFiles) {
        const name = file.replace(/\.md$/, '')
        const html = await renderSnippet(name)
        if (!html) continue

        this.emitFile({
          type: 'asset',
          fileName: `type-snippets/${name}.html`,
          source: html,
        })
      }

      for (const type of collectInlineTypes()) {
        const encoded = Buffer.from(type).toString('base64url')
        const html = await renderInlineCode(type)

        this.emitFile({
          type: 'asset',
          fileName: `type-snippets/_code/${encoded}.html`,
          source: html,
        })
      }

      for (const value of collectInlineValues()) {
        const encoded = Buffer.from(value).toString('base64url')
        const html = await renderInlineValue(value)

        this.emitFile({
          type: 'asset',
          fileName: `type-snippets/_value/${encoded}.html`,
          source: html,
        })
      }
    },
  }
}
