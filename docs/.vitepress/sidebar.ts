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
        { text: 'Modules', link: '/guide/modules' },
        { text: 'Conditions', link: '/guide/conditions' },
        { text: 'Expressions', link: '/guide/expressions' },
        { text: 'Autosave', link: '/guide/autosave' },
        { text: 'HTTP', link: '/guide/http' },
        { text: 'Date', link: '/guide/date' },
        { text: 'I18n', link: '/guide/i18n' },
      ],
    },
    {
      text: 'Rendering',
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
        { text: 'Vueform Instance', link: '/guide/vueform-instance' },
        { text: 'In-Depth Modules', link: '/guide/in-depth-modules' },
        { text: 'Dynamic Props', link: '/guide/dynamic-props' },
        { text: 'Element Paths', link: '/guide/element-paths' },
        { text: 'Event Handlers', link: '/guide/event-handlers' },
      ],
    },
    {
      text: 'Production',
      collapsed: false,
      items: [
        { text: 'Code-Splitting', link: '/guide/code-splitting' },
        { text: 'Testing', link: '/guide/testing' },
        { text: 'SSR', link: '/guide/ssr' },
        { text: 'Vapor', link: '/guide/vapor' },
        { text: 'Security', link: '/guide/security' },
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
        { text: 'createVueform', link: '/api/helpers/createVueform' },
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
        { text: 'useForm', link: '/api/composables/useForm' },
        { text: 'useHttp', link: '/api/composables/useHttp' },
        { text: 'useI18n', link: '/api/composables/useI18n' },
        { text: 'useModel', link: '/api/composables/useModel' },
        { text: 'useSecurity', link: '/api/composables/useSecurity' },
        { text: 'useVueform', link: '/api/composables/useVueform' },
        // @generated:composables-end
      ],
    },
  ],
  '/rules': [
    {
      text: 'Rules',
      items: [{ text: 'Overview', link: '/rules/' }],
    },
    {
      text: 'Presence',
      items: [
        { text: 'required', link: '/rules/required' },
        { text: 'accepted', link: '/rules/accepted' },
        { text: 'filled', link: '/rules/filled' },
        { text: 'nullable', link: '/rules/nullable' },
      ],
    },
    {
      text: 'String Format',
      items: [
        { text: 'email', link: '/rules/email' },
        { text: 'url', link: '/rules/url' },
        { text: 'ip', link: '/rules/ip' },
        { text: 'ipv4', link: '/rules/ipv4' },
        { text: 'ipv6', link: '/rules/ipv6' },
        { text: 'alpha', link: '/rules/alpha' },
        { text: 'alpha_num', link: '/rules/alpha_num' },
        { text: 'alpha_dash', link: '/rules/alpha_dash' },
        { text: 'uuid', link: '/rules/uuid' },
        { text: 'json', link: '/rules/json' },
        { text: 'timezone', link: '/rules/timezone' },
      ],
    },
    {
      text: 'Type',
      items: [
        { text: 'string', link: '/rules/string' },
        { text: 'numeric', link: '/rules/numeric' },
        { text: 'integer', link: '/rules/integer' },
        { text: 'boolean', link: '/rules/boolean' },
        { text: 'array', link: '/rules/array' },
        { text: 'date', link: '/rules/date' },
      ],
    },
    {
      text: 'Size',
      items: [
        { text: 'min', link: '/rules/min' },
        { text: 'max', link: '/rules/max' },
        { text: 'between', link: '/rules/between' },
        { text: 'size', link: '/rules/size' },
        { text: 'digits', link: '/rules/digits' },
        { text: 'digits_between', link: '/rules/digits_between' },
      ],
    },
    {
      text: 'Comparison',
      items: [
        { text: 'gt', link: '/rules/gt' },
        { text: 'gte', link: '/rules/gte' },
        { text: 'lt', link: '/rules/lt' },
        { text: 'lte', link: '/rules/lte' },
      ],
    },
    {
      text: 'Cross-field',
      items: [
        { text: 'same', link: '/rules/same' },
        { text: 'different', link: '/rules/different' },
        { text: 'confirmed', link: '/rules/confirmed' },
        { text: 'in_array', link: '/rules/in_array' },
      ],
    },
    {
      text: 'Membership',
      items: [
        { text: 'in', link: '/rules/in' },
        { text: 'not_in', link: '/rules/not_in' },
      ],
    },
    {
      text: 'Pattern',
      items: [
        { text: 'regex', link: '/rules/regex' },
        { text: 'not_regex', link: '/rules/not_regex' },
      ],
    },
    {
      text: 'Date',
      items: [
        { text: 'date_format', link: '/rules/date_format' },
        { text: 'date_equals', link: '/rules/date_equals' },
        { text: 'after', link: '/rules/after' },
        { text: 'after_or_equal', link: '/rules/after_or_equal' },
        { text: 'before', link: '/rules/before' },
        { text: 'before_or_equal', link: '/rules/before_or_equal' },
      ],
    },
    {
      text: 'File',
      items: [
        { text: 'file', link: '/rules/file' },
        { text: 'image', link: '/rules/image' },
        { text: 'mimes', link: '/rules/mimes' },
        { text: 'mimetypes', link: '/rules/mimetypes' },
        { text: 'dimensions', link: '/rules/dimensions' },
      ],
    },
    {
      text: 'Array',
      items: [{ text: 'distinct', link: '/rules/distinct' }],
    },
    {
      text: 'Other',
      items: [{ text: 'captcha', link: '/rules/captcha' }],
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
