import { createPluginConfig } from '@vueform/utils'

export default createPluginConfig({
  name: '@vueform/dompurify',
  external: ['isomorphic-dompurify', 'dompurify'],
})
