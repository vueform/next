import { createPluginTsdownConfig } from '@vueform/utils'

export default createPluginTsdownConfig({
  name: '@vueform/dompurify',
  external: ['isomorphic-dompurify', 'dompurify'],
})
