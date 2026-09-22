/**
 * Dev-mode config freeze.
 *
 * After install, the resolved config is deep-frozen in development so an
 * accidental post-install mutation (`config.$security.sanitizer` swapped from
 * app code) throws loudly instead of silently changing behavior. This is a
 * footgun guard, not a security boundary — code that can mutate the config can
 * already do anything — so production is untouched, and everything that
 * legitimately changes after install (plugin `config()` hooks, which run before
 * the freeze; reactive members like the `locale` ref; component definitions Vue
 * mutates) must keep working.
 */
import { defineSchema } from '@vueform/core'
import dompurify from '@vueform/dompurify'
import { nextTick } from 'vue'
import { createForm } from '../helpers'

describe('Config freeze', () => {
  it('should keep applying plugin config() hook changes made before install', async () => {
    // The dompurify plugin's config() hook installs the sanitizer by mutating
    // `config.$security` at createVueform() time — before the freeze. If the
    // freeze interfered with hook-applied config, this content would render
    // unsanitized or escaped instead of sanitized.
    const { form } = createForm(
      {
        schema: defineSchema({
          c: {
            type: 'content',
            content:
              '<em class="kept">ok</em><script>window.__frozen1 = true</script>',
          },
        }),
      },
      {
        plugins: [dompurify()],
        $security: { sanitizer: undefined, allowHtml: ['content'] },
      }
    )

    await nextTick()

    expect(form.find('em.kept').exists()).toBe(true)
    expect(form.html()).not.toContain('<script')
    expect((window as any).__frozen1).toBeUndefined()
  })

  it('should throw on post-install config writes in development', async () => {
    const { vueform } = createForm({
      schema: defineSchema({ name: { type: 'text' } }),
    })

    // Top-level property replacement.
    expect(() => {
      ;(vueform.config as any).classHelpers = true
    }).toThrowError()

    // Nested policy flip — the accident the freeze exists to catch.
    expect(() => {
      ;(vueform.config.$security as any).sanitizer = (html: string) => html
    }).toThrowError()

    expect(() => {
      ;(vueform.config.$security as any).allowHtml.push('content')
    }).toThrowError()
  })

  it('should keep locale switching working under the freeze', async () => {
    const { vueform } = createForm(
      {
        schema: defineSchema({ name: { type: 'text' } }),
      },
      {
        locales: {
          aa: { vf_freeze_probe: 'Alpha' },
          bb: { vf_freeze_probe: 'Beta' },
        },
        locale: 'aa',
      } as any
    )

    expect(vueform.$locale.t('vf_freeze_probe')).toBe('Alpha')

    // `config.locale` is a ref — exempt from the deep freeze — so switching
    // must keep working after install.
    vueform.$locale.setLocale('bb')
    await nextTick()

    expect(vueform.$locale.t('vf_freeze_probe')).toBe('Beta')
  })
})
