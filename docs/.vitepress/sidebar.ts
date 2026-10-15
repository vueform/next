export default {
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
}
