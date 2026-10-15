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
    title: '',
    description: '',
    head: [
      ['link', { rel: 'icon', href: '/favicon.ico' }],
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
            `../../.vueform/docs/${ADAPTER}/keywords.json`
          ),
          'virtual:vf-generated/types': path.resolve(
            __dirname,
            `../../.vueform/docs/${ADAPTER}/types.json`
          ),
        },
      },
      css: {
        postcss: {
          plugins: [vitepressCssLayerPostcss()],
        },
      },
      plugins: [
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
                '../src/assets/mingcute--code-line.svg'
              ),
              dark: localIconLoader(
                import.meta.url,
                '../src/assets/mingcute--code-line.svg'
              ),
            },
            schema: {
              light: localIconLoader(
                import.meta.url,
                '../src/assets/mingcute--braces-line.svg'
              ),
              dark: localIconLoader(
                import.meta.url,
                '../src/assets/mingcute--braces-line.svg'
              ),
            },
            'on()': {
              light: localIconLoader(
                import.meta.url,
                '../src/assets/mingcute--parentheses-fill.svg'
              ),
              dark: localIconLoader(
                import.meta.url,
                '../src/assets/mingcute--parentheses-fill.svg'
              ),
            },
            vueform: {
              light: localIconLoader(
                import.meta.url,
                '../src/assets/logo-symbol.svg'
              ),
              dark: localIconLoader(
                import.meta.url,
                '../src/assets/logo-symbol-dark.svg'
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
    themeConfig: {
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
      sidebar: {
        '/guide': [
          {
            text: 'Getting Started',
            collapsed: false,
            items: [
              { text: 'Introduction', link: '/guide/introduction' },
              { text: 'Quick Start', link: '/guide/quick-start' },
              { text: 'Philosophy', link: '/guide/philosophy' },
            ],
          },
          {
            text: 'Essentials',
            collapsed: false,
            items: [
              { text: 'Rendering', link: '/guide/rendering' },
              { text: 'Context', link: '/guide/context' },
              { text: 'Model', link: '/guide/model' },
              { text: 'Validation', link: '/guide/validation' },
              { text: 'Submit', link: '/guide/submit' },
            ],
          },
          {
            text: 'In-Depth View',
            collapsed: false,
            items: [
              { text: 'Themes & Tokens', link: '/guide/themes-tokens' },
              { text: 'Classes', link: '/guide/classes' },
              { text: 'Element Layout', link: '/guide/element-layout' },
              { text: 'Form Structure', link: '/guide/form-structure' },
              { text: 'Multi-Page Forms', link: '/guide/multi-page-forms' },
              { text: 'Repeaters', link: '/guide/repeaters' },
            ],
          },
          {
            text: 'Modules',
            collapsed: false,
            items: [
              { text: 'Conditions', link: '/guide/conditions' },
              { text: 'Expressions', link: '/guide/expressions' },
              { text: 'Autosave', link: '/guide/autosave' },
              { text: 'HTTP', link: '/guide/http' },
              { text: 'Date', link: '/guide/date' },
            ],
          },
          {
            text: 'I18n',
            collapsed: false,
            items: [
              { text: 'Locales', link: '/guide/locales' },
              { text: 'Translating Props', link: '/guide/translating-props' },
              {
                text: 'Multilingual Inputs',
                link: '/guide/multilingual-inputs',
              },
            ],
          },
          {
            text: 'Configuration',
            collapsed: false,
            items: [
              { text: 'Configuration', link: '/guide/configuration' },
              { text: 'Defaults', link: '/guide/defaults' },
              { text: 'Presets', link: '/guide/presets' },
              { text: 'Globals', link: '/guide/globals' },
            ],
          },
          {
            text: 'Customization',
            collapsed: false,
            items: [
              { text: 'Parts', link: '/guide/parts' },
              { text: 'Slots', link: '/guide/slots' },
              { text: 'Templates', link: '/guide/templates' },
              { text: 'Components', link: '/guide/components' },
              { text: 'Plugins', link: '/guide/plugins' },
            ],
          },
          {
            text: 'Under the Hood',
            collapsed: false,
            items: [
              { text: 'Dynamic Props', link: '/guide/dynamic-props' },
              { text: 'Event Handlers', link: '/guide/event-handlers' },
              { text: 'Element Paths', link: '/guide/element-paths' },
              { text: 'Vueform Instance', link: '/guide/vueform-instance' },
              { text: 'Modules', link: '/guide/modules' },
            ],
          },
          {
            text: 'Production',
            collapsed: false,
            items: [
              { text: 'Code-Splitting', link: '/guide/code-splitting' },
              { text: 'Testing', link: '/guide/testing' },
              { text: 'Security', link: '/guide/security' },
              { text: 'SSR', link: '/guide/ssr' },
              { text: 'Accessibility', link: '/guide/accessibility' },
              { text: 'Performance', link: '/guide/performance' },
            ],
          },
          {
            text: 'Community',
            collapsed: false,
            items: [
              { text: 'Community Guide', link: '/guide/community-guide' },
              { text: 'Support', link: '/guide/support' },
              { text: 'Roadmap', link: '/guide/roadmap' },
            ],
          },
        ],
        '/api': [
          {
            text: 'Helpers',
            collapsed: false,
            items: [
              // @generated:helpers-start
              { text: 'createRule', link: '/api/helpers/createRule' },
              { text: 'defineConfig', link: '/api/helpers/defineConfig' },
              { text: 'defineSchema', link: '/api/helpers/defineSchema' },
              {
                text: 'defineComputedSchema',
                link: '/api/helpers/defineComputedSchema',
              },
              { text: 'defineTheme', link: '/api/helpers/defineTheme' },
              { text: 'extendTheme', link: '/api/helpers/extendTheme' },
              { text: 'defineSlot', link: '/api/helpers/defineSlot' },
              { text: 'definePreset', link: '/api/helpers/definePreset' },
              { text: 'definePlugin', link: '/api/helpers/definePlugin' },
              // @generated:helpers-end
            ],
          },
          {
            text: 'Composables',
            collapsed: false,
            items: [
              // @generated:composables-start
              { text: 'useClasses', link: '/api/composables/useClasses' },
              { text: 'useContext', link: '/api/composables/useContext' },
              { text: 'useDate', link: '/api/composables/useDate' },
              { text: 'useHttp', link: '/api/composables/useHttp' },
              { text: 'useLocale', link: '/api/composables/useLocale' },
              { text: 'useSecurity', link: '/api/composables/useSecurity' },
              // @generated:composables-end
            ],
          },
        ],
        '/plugins': [
          {
            text: 'Plugins',
            items: [
              { text: 'Overview', link: '/plugins/' },
              // ...
            ],
          },
          {
            text: 'Date',
            items: [
              { text: 'Luxon', link: '/plugins/luxon' },
              { text: 'date-fns', link: '/plugins/date-fns' },
              { text: 'Day.js', link: '/plugins/dayjs' },
            ],
          },
          {
            text: 'Debugging',
            items: [{ text: 'DevTools', link: '/plugins/devtools' }],
          },
          {
            text: 'Expression',
            items: [
              { text: 'ExprEval', link: '/plugins/expr-eval' },
              // ...
            ],
          },
          {
            text: 'HTTP',
            items: [
              { text: 'Axios', link: '/plugins/axios' },
              { text: 'Unjs/ofetch', link: '/plugins/ofetch' },
            ],
          },
          {
            text: 'I18n',
            items: [
              { text: 'Vue I18n', link: '/plugins/vue-i18n' },
              // ...
            ],
          },
          {
            text: 'Security',
            items: [
              { text: 'DOMPurify', link: '/plugins/dompurify' },
              // ...
            ],
          },
        ],
      },
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
  },
  adapterConfig
)
