import { createVueform, defaultConfig } from '@vueform/ui'
import * as components from '@vueform/ui/components'
import * as modules from '@vueform/ui/modules'
import * as rules from '@vueform/ui/rules'
import { origin as theme } from '@vueform/ui/themes'

import type { AdapterEntry } from '../types'

const entry: AdapterEntry = {
  components,
  rules,
  modules,
  createVueform,
  defaultConfig,
  theme,
  icon: (name) =>
    name && name.startsWith('vf-') ? name : name ? `fa-solid fa-${name}` : '',
}

export default entry
