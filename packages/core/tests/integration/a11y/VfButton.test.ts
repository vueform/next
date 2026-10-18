import { defineSchema } from '@vueform/core'

import { createForm, expectNoA11yViolations } from '../../helpers'

// =============================================================================
// BUTTON VS ANCHOR SEMANTICS
// =============================================================================
describe('VfButton a11y', () => {
  it('should render a native button with the native disabled attribute', () => {
    const { form } = createForm({
      schema: defineSchema({
        btn: { type: 'button', text: 'Click me' },
        off: { type: 'button', text: 'Disabled', disabled: true },
      }),
    })

    const buttons = form.findAll('.vf-btn')

    expect(buttons[0].element.tagName).toBe('BUTTON')
    expect(buttons[0].attributes('type')).toBe('button')
    expect(buttons[0].attributes('disabled')).toBeUndefined()
    expect(buttons[0].attributes('aria-disabled')).toBeUndefined()

    // Native disabled, never aria-disabled, on a real <button>.
    expect(buttons[1].attributes('disabled')).toBeDefined()
    expect(buttons[1].attributes('aria-disabled')).toBeUndefined()
  })

  it('should render an anchor using aria-disabled instead of the disabled attribute', () => {
    const { form } = createForm({
      schema: defineSchema({
        link: { type: 'button', text: 'Visit', href: 'https://example.com' },
        off: {
          type: 'button',
          text: 'Visit',
          href: 'https://example.com',
          disabled: true,
        },
      }),
    })

    const anchors = form.findAll('.vf-btn')

    expect(anchors[0].element.tagName).toBe('A')
    expect(anchors[0].attributes('disabled')).toBeUndefined()
    expect(anchors[0].attributes('aria-disabled')).toBeUndefined()

    expect(anchors[1].element.tagName).toBe('A')
    expect(anchors[1].attributes('disabled')).toBeUndefined()
    expect(anchors[1].attributes('aria-disabled')).toBe('true')
  })

  // ===========================================================================
  // LOADING / ICON-ONLY / DESCRIBEDBY
  // ===========================================================================
  it('should announce loading via aria-busy', () => {
    const { form } = createForm({
      schema: defineSchema({
        btn: { type: 'button', text: 'Save', loading: true },
        idle: { type: 'button', text: 'Save' },
      }),
    })

    const buttons = form.findAll('.vf-btn')
    expect(buttons[0].attributes('aria-busy')).toBe('true')
    expect(buttons[1].attributes('aria-busy')).toBeUndefined()
  })

  it('should give icon-only buttons an aria-label and hide the icon', () => {
    const { form } = createForm({
      schema: defineSchema({
        iconOnly: { type: 'button', icon: 'vf-icon-plus' },
        both: { type: 'button', icon: 'vf-icon-plus', text: 'Add row' },
      }),
    })

    const buttons = form.findAll('.vf-btn')

    // Icon-only: non-empty accessible name, decorative icon hidden.
    expect(buttons[0].attributes('aria-label')).toBeTruthy()
    expect(buttons[0].find('i').attributes('aria-hidden')).toBe('true')

    // With visible text the aria-label must not shadow it.
    expect(buttons[1].attributes('aria-label')).toBeUndefined()
  })

  it('should reference the help region via aria-describedby', () => {
    const { form } = createForm({
      schema: defineSchema({
        btn: {
          type: 'button',
          text: 'Submit',
          label: 'The label',
          help: 'The help text',
        },
        plain: { type: 'button', text: 'Submit' },
      }),
    })

    const buttons = form.findAll('.vf-btn')

    const describedby = buttons[0].attributes('aria-describedby')!
    const help = form.find(`[id="${describedby}"]`)
    expect(help.exists()).toBe(true)
    expect(help.text()).toBe('The help text')

    expect(buttons[1].attributes('aria-describedby')).toBeUndefined()
  })

  it('should have no axe violations', async () => {
    const { form } = createForm({
      schema: defineSchema({
        btn: { type: 'button', text: 'Click me' },
        iconOnly: { type: 'button', icon: 'vf-icon-plus' },
      }),
    })

    await expectNoA11yViolations(form.element)
  })
})
