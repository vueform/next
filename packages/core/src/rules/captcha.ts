import { createRule } from '#src/helpers'

/**
 * Validates that the captcha element has been verified.
 *
 * @category Other
 */
export const captcha = createRule('captcha', async (_value, { el$ }) =>
  el$.verify ? await el$.verify() : true
)
