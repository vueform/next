import { shallowRef, type Ref } from 'vue'

import { alwaysTrue } from '#src/utils'

import type { ConditionsModule } from './types'

// Never mutated — shared by every caller.
const emptyList = shallowRef<Ref<boolean>[]>([])

/**
 * The inert conditions surface used when the `conditions` module is not
 * registered — behaves as if conditions weren't there: every conditional
 * resolves as met, lists resolve to no per-item evaluations.
 */
export const noopConditions: ConditionsModule = {
  makeConditional: () => alwaysTrue,
  makeConditionalList: () => emptyList,
}
