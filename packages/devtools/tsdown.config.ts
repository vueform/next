import { createPluginTsdownConfig } from '@vueform/utils'

export default {
  ...createPluginTsdownConfig({
    name: '@vueform/devtools',
    external: ['@vue/devtools-api'],
  }),
  // Besides the dev implementation, a second entry builds the inert
  // production stub the `production` export condition serves.
  entry: ['src/index.ts', 'src/prod.ts'],
}
