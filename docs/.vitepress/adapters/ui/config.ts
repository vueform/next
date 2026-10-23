export default {
  title: 'Vueform',
  description: 'Open source form framework',
  themeConfig: {
    sidebar: {
      '/components': [
        {
          text: 'Components',
          items: [{ text: 'Overview', link: '/components/' }],
        },
        {
          text: 'Elements',
          collapsed: false,
          items: [
            { text: 'VfButton', link: '/components/VfButton' },
            { text: 'VfCheckbox', link: '/components/VfCheckbox' },
            { text: 'VfCheckboxes', link: '/components/VfCheckboxes' },
            { text: 'VfContent', link: '/components/VfContent' },
            { text: 'VfField', link: '/components/VfField' },
            { text: 'VfFile', link: '/components/VfFile' },
            { text: 'VfHidden', link: '/components/VfHidden' },
            { text: 'VfRadio', link: '/components/VfRadio' },
            { text: 'VfRadios', link: '/components/VfRadios' },
            { text: 'VfSelect', link: '/components/VfSelect' },
            { text: 'VfText', link: '/components/VfText' },
            { text: 'VfTextarea', link: '/components/VfTextarea' },
          ],
        },
        {
          text: 'Containers',
          collapsed: false,
          items: [
            { text: 'VfForm', link: '/components/VfForm' },
            { text: 'VfGroup', link: '/components/VfGroup' },
            { text: 'VfList', link: '/components/VfList' },
            { text: 'VfMatrix', link: '/components/VfMatrix' },
            { text: 'VfGrid', link: '/components/VfGrid' },
            { text: 'VfCol', link: '/components/VfCol' },
            { text: 'VfRow', link: '/components/VfRow' },
          ],
        },
        {
          text: 'Element Parts',
          collapsed: false,
          items: [
            { text: 'VfLayout', link: '/components/VfLayout' },
            { text: 'VfAddon', link: '/components/VfAddon' },
            { text: 'VfIcon', link: '/components/VfIcon' },
          ],
        },
        {
          text: 'Form Parts',
          collapsed: false,
          items: [
            { text: 'VfElements', link: '/components/VfElements' },
            { text: 'VfSteps', link: '/components/VfSteps' },
            { text: 'VfNav', link: '/components/VfNav' },
            { text: 'VfTabs', link: '/components/VfTabs' },
            { text: 'VfLanguages', link: '/components/VfLanguages' },
          ],
        },
      ],
    },
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: 'ui',
        askAi: {
          assistantId: 'YaVSonfX5bS8',
          sidePanel: true,
        },
      },
    },
    editLink: {
      pattern: 'https://github.com/vueform/next/blob/main/docs/src/:path',
      text: 'Edit this page on GitHub',
    },
  },
  socialLinks: [
    {
      icon: 'github',
      link: 'https://github.com/vueform/next/tree/main/packages/ui',
    },
  ],
}
