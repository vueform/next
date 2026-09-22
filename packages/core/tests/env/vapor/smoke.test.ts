import { describe, expect, it } from 'vitest'
import BasicForm from './components/BasicForm.vue'
import ConditionsForm from './components/ConditionsForm.vue'
import ContentBranchesForm from './components/ContentBranchesForm.vue'
import UseFormForm from './components/UseFormForm.vue'
import ValidationForm from './components/ValidationForm.vue'
import { flush, mountApp, type } from './helpers'

declare const __VAPOR_ALL__: boolean

describe(`smoke (${__VAPOR_ALL__ ? 'vapor' : 'vdom'} compile)`, () => {
  it('renders a form and syncs typed input to the model', async () => {
    const { el, unmount } = mountApp(BasicForm)
    await flush()

    const input = el.querySelector<HTMLInputElement>('input[name="email"]')
    expect(input).toBeTruthy()

    await type(input!, 'jane@example.com')

    expect(el.querySelector('[data-test="model"]')!.textContent).toBe(
      'jane@example.com'
    )

    unmount()
  })

  it('shows a validation error after failed submit', async () => {
    const { el, unmount } = mountApp(ValidationForm)
    await flush()

    expect(el.textContent).not.toContain('The Text field is required')

    el.querySelector<HTMLButtonElement>('button')!.click()
    await flush(30)

    expect(el.textContent).toContain('The Text field is required')

    unmount()
  })

  it('reveals a conditional element when its condition is met', async () => {
    const { el, unmount } = mountApp(ConditionsForm)
    await flush()

    expect(el.querySelector('input[name="state"]')).toBeNull()

    await type(
      el.querySelector<HTMLInputElement>('input[name="country"]')!,
      'us'
    )
    await flush(30)

    expect(el.querySelector('input[name="state"]')).toBeTruthy()

    unmount()
  })

  it('renders element content branches: addons, icons, loading, layout:false, inline slot', async () => {
    const { el, unmount } = mountApp(ContentBranchesForm)
    await flush()

    // Prop addons around the price input
    expect(el.textContent).toContain('$')
    expect(el.textContent).toContain('.00')

    // Loading spinner
    expect(el.querySelector('.vf-icon-loading')).toBeTruthy()

    // layout:false still renders the input itself
    expect(el.querySelector('input[name="promo"]')).toBeTruthy()

    // Inline slot content (vapor-compiled slot in vapor mode)
    expect(el.querySelector('[data-test="inline-slot"]')).toBeTruthy()

    unmount()
  })

  it('drives a form through useForm + useModel (h() wrapper under interop)', async () => {
    const { el, unmount } = mountApp(UseFormForm)
    await flush()

    expect(el.querySelector('[data-test="adopted"]')!.textContent).toBe('true')

    const input = el.querySelector<HTMLInputElement>('input[name="email"]')
    expect(input).toBeTruthy()

    await type(input!, 'jane@example.com')

    expect(el.querySelector('[data-test="model"]')!.textContent).toBe(
      'jane@example.com'
    )

    unmount()
  })

  it.runIf(__VAPOR_ALL__)(
    'works under createVaporApp with a vapor root',
    async () => {
      const { el, unmount } = mountApp(BasicForm, { vaporApp: true })
      await flush()

      const input = el.querySelector<HTMLInputElement>('input[name="email"]')
      expect(input).toBeTruthy()

      await type(input!, 'vapor@example.com')

      expect(el.querySelector('[data-test="model"]')!.textContent).toBe(
        'vapor@example.com'
      )

      unmount()
    }
  )
})
