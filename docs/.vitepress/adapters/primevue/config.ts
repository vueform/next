export default {
  title: 'Vueform + PrimeVue',
  description: 'Form framework for PrimeVue',
  themeConfig: {
    sidebar: {
      '/components': [
        {
          text: 'Elements',
          collapsed: false,
          items: [
            { text: 'VfAutoComplete', link: '/components/VfAutoComplete' },
            { text: 'VfButton', link: '/components/VfButton' },
            { text: 'VfCascadeSelect', link: '/components/VfCascadeSelect' },
            { text: 'VfCheckbox', link: '/components/VfCheckbox' },
            { text: 'VfCheckboxGroup', link: '/components/VfCheckboxGroup' },
            { text: 'VfColorPicker', link: '/components/VfColorPicker' },
            { text: 'VfContent', link: '/components/VfContent' },
            { text: 'VfDatePicker', link: '/components/VfDatePicker' },
            { text: 'VfEditor', link: '/components/VfEditor' },
            { text: 'VfField', link: '/components/VfField' },
            { text: 'VfFileUpload', link: '/components/VfFileUpload' },
            { text: 'VfHidden', link: '/components/VfHidden' },
            { text: 'VfInputMask', link: '/components/VfInputMask' },
            { text: 'VfInputNumber', link: '/components/VfInputNumber' },
            { text: 'VfInputOtp', link: '/components/VfInputOtp' },
            { text: 'VfInputText', link: '/components/VfInputText' },
            { text: 'VfKnob', link: '/components/VfKnob' },
            { text: 'VfListbox', link: '/components/VfListbox' },
            { text: 'VfMultiSelect', link: '/components/VfMultiSelect' },
            { text: 'VfPassword', link: '/components/VfPassword' },
            { text: 'VfRadioButton', link: '/components/VfRadioButton' },
            {
              text: 'VfRadioButtonGroup',
              link: '/components/VfRadioButtonGroup',
            },
            { text: 'VfRating', link: '/components/VfRating' },
            { text: 'VfSelect', link: '/components/VfSelect' },
            { text: 'VfSelectButton', link: '/components/VfSelectButton' },
            { text: 'VfSlider', link: '/components/VfSlider' },
            { text: 'VfTextarea', link: '/components/VfTextarea' },
            { text: 'VfToggleButton', link: '/components/VfToggleButton' },
            { text: 'VfToggleSwitch', link: '/components/VfToggleSwitch' },
            { text: 'VfTreeSelect', link: '/components/VfTreeSelect' },
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
          ],
        },
        {
          text: 'Form Parts',
          collapsed: false,
          items: [
            { text: 'VfElements', link: '/components/VfElements' },
            { text: 'VfNav', link: '/components/VfNav' },
          ],
        },
      ],
    },
    search: {
      provider: 'algolia',
      options: {
        appId: '...',
        apiKey: '...',
        indexName: 'primevue',
        askAi: {
          assistantId: 'YaVSonfX5bS8',
          sidePanel: true,
        },
      },
    },
    editLink: {
      pattern:
        'https://github.com/vueform/next/blob/main/packages/primevue/docs/:path',
      text: 'Edit this page on GitHub',
    },
  },
  socialLinks: [
    {
      icon: 'github',
      link: 'https://github.com/vueform/next/tree/main/packages/primevue',
    },
  ],
}
