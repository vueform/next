// https://vitepress.dev/guide/custom-theme
import { type Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { defineAsyncComponent } from 'vue'
import './style/layers.css'
import './style/index.scss'
import VPExample from './components/VPExample.vue'
import VPLayout from './components/VPLayout'
import VPParts from './components/VPParts.vue'
import VPPartTree from './components/VPPartTree.vue'
import VPSubtab from './components/VPSubtab.vue'
import VPSubtabs from './components/VPSubtabs.vue'
import VPTab from './components/VPTab.vue'
import VPTabs from './components/VPTabs.vue'
import VPUsage from './components/VPUsage.vue'
import { installVueform } from './vueform'
import 'virtual:group-icons.css'

const VPPlayground = defineAsyncComponent(
  () => import('./components/VPPlayground.vue')
)

export default {
  extends: DefaultTheme,
  Layout: VPLayout,
  enhanceApp({ app }) {
    installVueform(app)

    app.component('VPExample', VPExample)
    app.component('VPUsage', VPUsage)
    app.component('VPPlayground', VPPlayground)
    app.component('VPParts', VPParts)
    app.component('VPPartTree', VPPartTree)
    app.component('VPTabs', VPTabs)
    app.component('VPTab', VPTab)
    app.component('VPSubtabs', VPSubtabs)
    app.component('VPSubtab', VPSubtab)
  },
} satisfies Theme
