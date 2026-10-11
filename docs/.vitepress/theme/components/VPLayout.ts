import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { defineComponent, h } from 'vue'

import { useCollapsibles } from '../composables/useCollapsibles'
import { usePopovers } from '../composables/usePopovers'
import { useSidebarScroll } from '../composables/useSidebarScroll'
import VPAdapterSelector from './VPAdapterSelector.vue'
import VPOutline from './VPOutline.vue'

/**
 * The default theme layout extended with the adapter selector, the custom
 * outline, and the docs' runtime behaviors.
 */
export default defineComponent({
  name: 'VPLayout',
  setup() {
    const { theme } = useData()

    useSidebarScroll()
    useCollapsibles()
    usePopovers()

    return () =>
      h(DefaultTheme.Layout, null, {
        // Adapters can opt out with `themeConfig.adapterSelector: false`.
        ...(theme.value.adapterSelector === false
          ? {}
          : { 'sidebar-nav-before': () => h(VPAdapterSelector) }),
        'aside-outline-before': () => h(VPOutline),
      })
  },
})
