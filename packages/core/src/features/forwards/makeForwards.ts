import type { ForwardsConfig } from '~/composables'
import { defineFeature } from '~/helpers'

/**
 * Declares the events and slots an adapter component forwards to the underlying
 * third-party component. The factory only places the config on the api as
 * `forwards`; `useBlueprint` notices it and builds the actual `forwardProps` /
 * `forwardSlots` computeds, declared on its returned `api` type (see
 * `ForwardsApi`).
 *
 * @param config The event and slot names to forward.
 */
export const makeForwards = defineFeature(
  (config?: ForwardsConfig) => (): { forwards: ForwardsConfig } => ({
    forwards: config ?? {},
  })
)
