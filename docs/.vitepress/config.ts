import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { ThemeRegistrationAny } from 'shiki'
import { mergeConfig } from 'vitepress'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
  localIconLoader,
} from 'vitepress-plugin-group-icons'

import docsConfig from '../config.json'
import * as adapterConfigs from './adapters/configs'
import { resolveAdapterLayer } from './build/adapter-layer'
import { vitepressCssLayerPostcss } from './build/css-layer'
import { slugifyHeading } from './build/slugify'
import sidebar from './sidebar'
import {
  adapterContent,
  autoCollapseTypes,
  autoPageNolink,
  collapsibleCode,
  collapsibleCustomBlockPlugin,
  collapsibleSectionPlugin,
  detailsPlugin,
  examplePlugin,
  includeNolink,
  includeTypePages,
  includeParams,
  inlineKeywordLink,
  keywordLink,
  lineTypeDirective,
  subtabsPlugin,
  tabsPlugin,
  tagPlugin,
  typeHint,
  typeLinkPlugin,
  typeSnippetsPlugin,
  usagePlugin,
  vueSfcHighlight,
  vueTemplateHighlight,
  wordHighlight,
} from './theme/plugins'
import shikiDarkTheme from './theme/style/shiki-dark.json'
import shikiLightTheme from './theme/style/shiki-light.json'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const adapterDefs = docsConfig.adapters

const ADAPTER = process.env.VF_ADAPTER ?? 'ui'
const adapterConfig = (adapterConfigs as Record<string, any>)[ADAPTER]
const { rewrites, srcExclude: adapterExclude } = resolveAdapterLayer(
  ADAPTER,
  path.resolve(__dirname, '../src'),
  Object.keys(adapterDefs)
)
const srcExclude = [...adapterExclude, 'types/**']

// Resolve `virtual:vf-active-adapter` to the active adapter's entry module so
// that only its JS, theme, and CSS enter the build graph. Falls back to `ui`.
const adapterEntryModule = path.resolve(
  __dirname,
  `adapters/${ADAPTER in adapterConfigs ? ADAPTER : 'ui'}/index.ts`
)

const adapterHosts: Record<string, string> = Object.fromEntries(
  Object.entries(adapterDefs).map(([k, v]) => [k, v.host])
)
const canonicalHost = adapterHosts[ADAPTER] ?? adapterHosts.ui

// https://vitepress.dev/reference/site-config
export default mergeConfig(
  {
    title: 'Vueform',
    description:
      'Build anything from simple inputs to complex workflows with a declarative form framework for developers and AI agents, using any UI library.',
    head: [
      [
        'link',
        {
          rel: 'icon',
          type: 'image/png',
          href: '/favicon-96x96.png',
          sizes: '96x96',
        },
      ],
      ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
      [
        'link',
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
      ],
      ['link', { rel: 'manifest', href: '/site.webmanifest' }],
      [
        'link',
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css',
        },
      ],
    ],
    cleanUrls: true,
    ignoreDeadLinks: true,
    outDir: `./.vitepress/dist/${ADAPTER}`,
    srcDir: './src',
    rewrites,
    srcExclude,
    themeConfig: {
      logo: {
        light: '/assets/logo-h.svg',
        dark: '/assets/logo-h-dark.svg',
      },
      siteTitle: false,
      externalLinkIcon: true,
      nav: [
        {
          text: 'Guide',
          link: '/guide/introduction',
        },
        {
          text: 'Reference',
          items: [
            {
              items: [
                { text: 'Components', link: '/components' },
                { text: 'Rules', link: '/rules' },
                { text: 'Plugins', link: '/plugins' },
                { text: 'API', link: '/api' },
              ],
            },
          ],
        },
        {
          text: 'Tools',
          items: [
            { text: 'Playground', link: '/playground' },
            { text: 'Examples', link: '/examples/example-1' },
            { text: 'DevTools', link: '/tools/dev-tools' },
            { text: 'CLI', link: '/tools/cli' },
          ],
        },
        {
          text: 'About',
          items: [
            { text: 'FAQ', link: '/about/faq' },
            { text: 'Roadmap', link: '/guide/roadmap' },
            { text: 'Releases', link: '/about/releases' },
            { text: 'Privacy Policy', link: '/about/privacy-policy' },
          ],
        },
        {
          text: 'Community',
          items: [
            { text: 'Community Guide', link: '/guide/community-guide' },
            { text: 'Code of Conduct', link: '/about/code-of-conduct' },
          ],
        },
      ],
      socialLinks: [
        { icon: 'github', link: 'https://github.com/vueform/next' },
      ],
      sidebar,
      footer: {
        message: 'Released under the MIT License.',
        copyright: 'Copyright © 2022-present Adam Berecz',
      },
      lastUpdated: {
        text: 'Updated at',
        formatOptions: {
          dateStyle: 'medium',
          timeStyle: 'medium',
        },
      },
    },
    markdown: {
      theme: {
        // JSON imports widen `"type": "light"` to `string`; the registration
        // type wants the literal.
        light: shikiLightTheme as ThemeRegistrationAny,
        dark: shikiDarkTheme as ThemeRegistrationAny,
      },
      anchor: {
        slugify: slugifyHeading,
      },
      config(md) {
        md.use(adapterContent)
        md.use(collapsibleSectionPlugin)
        md.use(tabsPlugin)
        md.use(subtabsPlugin)
        md.use(detailsPlugin)
        md.use(collapsibleCustomBlockPlugin)
        md.use(examplePlugin)
        md.use(usagePlugin)
        md.use(typeLinkPlugin)
        md.use(autoPageNolink)
        md.use(inlineKeywordLink)
        md.use(groupIconMdPlugin)
      },
      languages: ['vue', 'js', 'ts', 'tsx', 'jsx', 'md'],
      async shikiSetup(shiki) {
        await shiki.loadLanguage('vue-html')
      },
      codeTransformers: [
        vueSfcHighlight(),
        vueTemplateHighlight(),
        wordHighlight(),
        collapsibleCode(),
        keywordLink(),
        // After other transformers: they walk flat token lines. Type
        // hints insert a caret widget and must run last.
        typeHint(),
      ],
    },
    transformHead({ pageData }) {
      const head: Array<[string, Record<string, string>]> = []
      const pagePath = pageData.relativePath
        .replace(/\.md$/, '')
        .replace(/\/index$/, '/')
      const normalizedPath = pagePath.startsWith('/')
        ? pagePath
        : `/${pagePath}`

      head.push([
        'link',
        { rel: 'canonical', href: `${canonicalHost}${normalizedPath}` },
      ])

      for (const [key, host] of Object.entries(adapterHosts)) {
        if (key !== ADAPTER) {
          head.push([
            'link',
            {
              rel: 'alternate',
              hreflang: 'en',
              href: `${host}${normalizedPath}`,
            },
          ])
        }
      }

      return head
    },
    vite: {
      ssr: {
        external: ['@vue/repl'],
      },
      build: {
        rollupOptions: {
          onwarn(warning, warn) {
            // Deliberate Vue 3.6 (Vapor) feature detection in core's
            // utils/instance — the export is absent on the pinned Vue 3.5 and
            // the access is guarded, so the missing-export warning is noise.
            if (
              warning.code === 'MISSING_EXPORT' &&
              (warning as any).binding === 'rawVaporSlotKey'
            ) {
              return
            }
            warn(warning)
          },
        },
      },
      define: {
        __VF_ADAPTER__: JSON.stringify(ADAPTER),
        // The adapter switcher's data, straight from config.json. Adapters
        // flagged `disabled: true` stay buildable but leave the selector.
        __VF_ADAPTERS__: JSON.stringify(
          Object.entries(adapterDefs)
            .filter(([, def]) => !(def as { disabled?: boolean }).disabled)
            .map(([key, def]) => ({
              key,
              label: def.displayName,
              host: def.host,
              devPort: def.devPort,
            }))
        ),
      },
      resolve: {
        alias: {
          'virtual:vf-active-adapter': adapterEntryModule,
          // The active adapter's generated data — aliased so each build
          // bundles exactly one chunk per file instead of globbing every
          // adapter folder.
          'virtual:vf-generated/components': path.resolve(
            __dirname,
            `../../.vueform/api/${ADAPTER}/components.json`
          ),
          'virtual:vf-generated/classes': path.resolve(
            __dirname,
            `../../.vueform/api/${ADAPTER}/classes.json`
          ),
          'virtual:vf-generated/keywords': path.resolve(
            __dirname,
            `../src/_${ADAPTER}/keywords.json`
          ),
          'virtual:vf-generated/types': path.resolve(
            __dirname,
            `../src/_${ADAPTER}/types.json`
          ),
        },
      },
      css: {
        postcss: {
          plugins: [vitepressCssLayerPostcss()],
        },
      },
      plugins: [
        includeTypePages(),
        includeNolink(),
        lineTypeDirective(),
        tagPlugin(),
        autoCollapseTypes(),
        includeParams(),
        typeSnippetsPlugin() as any,
        groupIconVitePlugin({
          customIcon: {
            template: {
              light: localIconLoader(
                import.meta.url,
                '../src/public/assets/mingcute--code-line.svg'
              ),
              dark: localIconLoader(
                import.meta.url,
                '../src/public/assets/mingcute--code-line.svg'
              ),
            },
            schema: {
              light: localIconLoader(
                import.meta.url,
                '../src/public/assets/mingcute--braces-line.svg'
              ),
              dark: localIconLoader(
                import.meta.url,
                '../src/public/assets/mingcute--braces-line.svg'
              ),
            },
            'on()': {
              light: localIconLoader(
                import.meta.url,
                '../src/public/assets/mingcute--parentheses-fill.svg'
              ),
              dark: localIconLoader(
                import.meta.url,
                '../src/public/assets/mingcute--parentheses-fill.svg'
              ),
            },
            vueform: {
              light: localIconLoader(
                import.meta.url,
                '../src/public/assets/logo.svg'
              ),
              dark: localIconLoader(
                import.meta.url,
                '../src/public/assets/logo-dark.svg'
              ),
            },
          },
          defaultLabels: [
            'npm',
            'yarn',
            'pnpm',
            'bun',
            'deno',
            'vue',
            'template',
            'schema',
            'ts',
          ],
        }),
      ],
    },
  },
  adapterConfig
)
