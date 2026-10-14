/**
 * PostCSS plugin that wraps CSS from VitePress in `@layer vitepress` so that
 * component-library styles (PrimeVue, etc.) always win by default.
 */
export function vitepressCssLayerPostcss() {
  return {
    postcssPlugin: 'vitepress-css-layer',
    Once(root: any, { AtRule }: any) {
      const file = root.source?.input?.file ?? ''
      if (file.includes('node_modules/vitepress/') && !file.includes('font')) {
        const layer = new AtRule({ name: 'layer', params: 'vitepress' })
        root.each((node: any) => layer.append(node.clone()))
        root.removeAll()
        root.append(layer)
      }
    },
  }
}
vitepressCssLayerPostcss.postcss = true
