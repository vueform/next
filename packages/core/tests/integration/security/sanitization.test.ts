import { defineSchema } from '@vueform/core'
import dompurify from '@vueform/dompurify'
/**
 * # Sanitization pipeline
 *
 * Threat model: schemas may come from semi-trusted sources (a CMS, a form
 * builder) and form values are typed by end users or loaded from servers — both
 * are untrusted data. The guarantee proven here: a string can only ever render
 * as HTML through an area `$security.allowHtml` allows — every area while the
 * option is unset, exactly the listed ones once it is set — and what renders
 * has passed through the installed sanitizer AFTER every substitution
 * (expression resolution included) — or, without a sanitizer, does not render
 * as HTML at all.
 */
import { nextTick } from 'vue'

import { createForm } from '../../helpers'

describe('Security: sanitization pipeline', () => {
  describe('expression resolution cannot bypass the sanitizer', () => {
    /**
     * Threat: a perfectly benign schema (`content: 'Welcome, {name}!'` with
     * `content` area enabled) interpolates a form value controlled by the end
     * user. If sanitization ran only on the template, a user typing `<img src=x
     * onerror=…>` into the `name` field would have their payload spliced into
     * the HTML _after_ the sanitizer approved it — stored XSS against every
     * later viewer, with DOMPurify fully enabled.
     *
     * Measure: `useDynamicProp` re-sanitizes the resolved string after
     * expression resolution, so the sanitizer always sees the final bytes that
     * reach `v-html`.
     *
     * Verified red→green: failed against the pre-fix pipeline (the payload's
     * `onerror` reached the DOM), passes with the post-resolution sanitize.
     */
    test('it should strip HTML injected through an expression into `VfContent` html mode', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            name: {
              type: 'text',
              default: '<img src=x onerror="window.__xss1 = true">',
            },
            welcome: {
              type: 'content',
              content: 'Welcome, {name}!',
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined, allowHtml: ['content'] },
        }
      )

      await nextTick()

      const html = form.html()
      // The expression must actually have resolved — otherwise this test
      // would pass vacuously against the unresolved template.
      expect(form.text()).not.toContain('{name}')
      expect(html).not.toContain('onerror')
      expect((window as any).__xss1).toBeUndefined()
      expect(form.text()).toContain('Welcome,')
    })

    /**
     * Threat: same substitution attack against a string slot template — schema
     * `slots: { label: '<span>{payload}</span>' }` is clean, the user supplies
     * `</span><img src=x onerror=…><span>` as the field value, and the
     * closing-tag breakout lands the payload in the slot's `innerHTML`.
     *
     * Measure: string slot content is sanitized after expression resolution,
     * not before.
     *
     * Verified red→green: failed against the pre-fix pipeline.
     */
    test('it should strip HTML injected through an expression into a string slot', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            payload: {
              type: 'text',
              default:
                '</span><img src=x onerror="window.__xss2 = true"><span>',
            },
            el: {
              type: 'text',
              label: 'Foo',
              slots: { label: '<span>{payload}</span>' },
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined, allowHtml: ['slots'] },
        }
      )

      await nextTick()

      expect(form.html()).not.toContain('onerror')
      expect((window as any).__xss2).toBeUndefined()
    })

    /**
     * Threat: the fix for the above must survive future refactoring. The
     * tempting "safer" shape is to sanitize the template as well as the result
     * — but sanitizing an unresolved template HTML-escapes the expression
     * source itself (`{x < y}` becomes `{x &lt; y}`), silently breaking
     * comparisons. A maintainer who reintroduces that pre-pass to "add defense
     * in depth" would corrupt working forms.
     *
     * Measure: sanitization runs exactly once, after expression resolution.
     * This test fails if a pre-resolution pass is added back.
     */
    test('it should not corrupt comparison expressions by sanitizing the template', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            count: { type: 'text', default: 3 },
            note: { type: 'content', content: 'Under: {count < 5}' },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined, allowHtml: ['content'] },
        }
      )

      await nextTick()

      // Resolved as a comparison — not left as a mangled `&lt;` template.
      expect(form.text()).toContain('Under: true')
      expect(form.html()).not.toContain('&amp;lt;')
    })
  })

  describe('HTML without a sanitizer', () => {
    /**
     * Threat: `allowHtml` enabled with no sanitizer installed, shipping.
     * Development warnings are compiled out of
     * production builds — raw HTML with no signal would be the worst outcome.
     *
     * Measure: in production, HTML bound for a sink renders **empty** without
     * an engine. Unsanitizable HTML never ships; the blank area is the
     * unmissable symptom.
     *
     * Verified red→green: the engineless fallback rendered escaped text (and
     * earlier, raw output) before the render-empty contract.
     */
    test('it should render HTML empty without a sanitizer in production', async () => {
      vi.stubEnv('NODE_ENV', 'production')

      try {
        const { form } = createForm(
          {
            schema: defineSchema({
              c: {
                type: 'content',
                content: '<b>bold</b>',
              },
            }),
          },
          { $security: { allowHtml: ['content'], sanitizer: undefined } }
        )

        await nextTick()

        expect(form.find('b').exists()).toBe(false)
        expect(form.text()).not.toContain('bold')
      } finally {
        vi.unstubAllEnvs()
      }
    })

    /**
     * Threat: none — the out-of-the-box contract. An app that never touched
     * `allowHtml` stated no HTML policy (trusted schemas, or security handled
     * elsewhere), so an engineless setup renders raw without nagging:
     * warnings an app can't act on train developers to ignore security
     * output.
     */
    test('it should render raw HTML silently when `allowHtml` is unset', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      try {
        const { form } = createForm(
          {
            schema: defineSchema({
              c: {
                type: 'content',
                content: '<b>bold</b>',
              },
            }),
          },
          { $security: {} }
        )

        await nextTick()

        expect(form.find('b').exists()).toBe(true)
        expect(warn).not.toHaveBeenCalledWith(
          expect.stringContaining('sanitizer')
        )
      } finally {
        warn.mockRestore()
      }
    })

    /**
     * Threat: none — the same contract must hold in production. Fail-closed
     * is reserved for stated intent; an app with `allowHtml` unset keeps
     * working without configuration in every environment.
     */
    test('it should render raw HTML in production when `allowHtml` is unset', async () => {
      vi.stubEnv('NODE_ENV', 'production')

      try {
        const { form } = createForm(
          {
            schema: defineSchema({
              c: {
                type: 'content',
                content: '<b>bold</b>',
              },
            }),
          },
          { $security: {} }
        )

        await nextTick()

        expect(form.find('b').exists()).toBe(true)
      } finally {
        vi.unstubAllEnvs()
      }
    })

    /**
     * Threat: `allowHtml` configured with no sanitizer installed — the app
     * cares about HTML policy, so rendering unsanitized HTML is a likely
     * mistake, not a choice.
     *
     * Measure: stated intent without an engine warns once in development,
     * naming the fix (and renders empty in production, as proven above).
     */
    test('it should warn in development when `allowHtml` is set without a sanitizer', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      try {
        const { form } = createForm(
          {
            schema: defineSchema({
              c: {
                type: 'content',
                content: '<b>bold</b>',
              },
            }),
          },
          { $security: { allowHtml: ['content'] } }
        )

        await nextTick()

        expect(form.find('b').exists()).toBe(true)
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('sanitizer'))
      } finally {
        warn.mockRestore()
      }
    })
  })

  describe('a configured `allowHtml` is a pure area allowlist', () => {
    /**
     * Threat: an untrusted schema supplying markup as content in an app that
     * restricted HTML rendering — with no per-element switch to flip, the
     * app's `allowHtml` config is the only thing standing between that markup
     * and the DOM.
     *
     * Measure: once `allowHtml` is set, the `content` area must be listed;
     * otherwise the markup renders as escaped text.
     */
    test('it should render markup as escaped text when `content` is not in `allowHtml`', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { form } = createForm(
        {
          schema: defineSchema({
            c: {
              type: 'content',
              content: '<b>bold</b>',
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined, allowHtml: [] },
        }
      )

      await nextTick()

      expect(form.find('b').exists()).toBe(false)
      expect(form.text()).toContain('<b>bold</b>')

      warn.mockRestore()
    })
  })

  describe('VfContent html mode', () => {
    /**
     * Threat: a content element rendering attacker-authored markup — `<script>`
     * smuggled into an otherwise ordinary content block.
     *
     * Measure: the configured sanitizer strips script tags before the string
     * reaches `v-html`. (Migrated from the original suite.)
     */
    test('it should sanitize dangerous HTML when html is enabled', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'content',
              content: '<p>Safe</p><script>alert("xss")</script>',
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined, allowHtml: ['content'] },
        }
      )

      await nextTick()

      const content = form.find('.vf-content div')
      expect(content.exists()).toBe(true)
      expect(content.html()).toContain('Safe')
      expect(content.html()).not.toContain('<script>')
      expect(content.html()).not.toContain('alert')
    })

    /**
     * Threat: event-handler attributes in content markup — script without a
     * script tag.
     *
     * Measure: the sanitizer strips `on*` attributes. (Migrated from the
     * original suite.)
     */
    test('it should strip event handler attributes when html is enabled', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'content',
              content: '<div onmouseover="steal()">Hover me</div>',
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined, allowHtml: ['content'] },
        }
      )

      await nextTick()

      const content = form.find('.vf-content div')
      expect(content.html()).not.toContain('onmouseover')
      expect(content.html()).not.toContain('steal')
      expect(content.text()).toContain('Hover me')
    })
  })

  describe('the grid area', () => {
    /**
     * Threat: the third HTML area. Grid string cells resolve expressions
     * against live form data, so a clean cell template plus a hostile field
     * value is the same substitution attack as content and slots.
     *
     * Measure: grid cell strings are sanitized after expression resolution,
     * identically to the other two areas (shared string-content renderer).
     */
    test('it should strip HTML injected through an expression into a grid cell', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            payload: {
              type: 'text',
              default:
                '</span><img src=x onerror="window.__xssGrid = true"><span>',
            },
            g: {
              type: 'grid',
              cols: 1,
              grid: [['<span>{payload}</span>']],
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined, allowHtml: ['grid'] },
        }
      )

      await nextTick()

      expect(form.html()).not.toContain('onerror')
      expect((window as any).__xssGrid).toBeUndefined()
    })

    /**
     * Threat: grid HTML rendering skipping the engine — an area-level gap would
     * make `allowHtml: ['grid']` the weakest of the three doors.
     *
     * Measure: allowed grid HTML passes through the installed sanitizer like
     * every other area; safe markup survives, script does not.
     */
    test('it should sanitize grid cell HTML through the installed engine', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            g: {
              type: 'grid',
              cols: 1,
              grid: [
                [
                  '<b class="cell">ok</b><script>window.__xssGrid2 = true</script>',
                ],
              ],
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined, allowHtml: ['grid'] },
        }
      )

      await nextTick()

      expect(form.find('.vf-grid b.cell').exists()).toBe(true)
      expect(form.html()).not.toContain('<script')
      expect((window as any).__xssGrid2).toBeUndefined()
    })
  })

  describe('defense-in-depth surfaces', () => {
    /**
     * Threat: addon texts come from schemas and render next to inputs — a
     * hostile schema planting markup in an addon.
     *
     * Measure: addon strings render exclusively through Vue text interpolation
     * (never an HTML sink), so markup displays as inert literal text. They are
     * deliberately NOT run through the HTML sanitizer: escaping already
     * neutralizes the payload, and the sanitizer's engineless production
     * fallback (render empty) must never blank a legitimate text addon.
     */
    test('it should render addon texts as escaped text', async () => {
      const { form } = createForm(
        {
          schema: defineSchema({
            el: {
              type: 'text',
              addonBefore: '<b>$</b><script>window.__addon = true</script>',
            },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined },
        }
      )

      await nextTick()

      const addon = form.findComponent({ name: 'VfAddon' })
      expect(addon.find('script').exists()).toBe(false)
      expect(addon.text()).toContain('<b>$</b>')
      expect((window as any).__addon).toBeUndefined()
    })

    /**
     * Threat: message-bag entries can carry server-supplied strings (422
     * responses land there via `setInvalid`) — a hostile server response
     * planting markup in a message.
     *
     * Measure: messages render exclusively through Vue text interpolation
     * (never an HTML sink), so markup displays as inert literal text. They are
     * deliberately NOT run through the HTML sanitizer: escaping already
     * neutralizes the payload, and an HTML sanitizer would mangle legitimate
     * text (`score < 10`).
     */
    test('it should render message bag entries as escaped text', async () => {
      const { form, el } = createForm(
        {
          schema: defineSchema({
            el: { type: 'text', label: 'Foo' },
          }),
        },
        {
          plugins: [dompurify()],
          $security: { sanitizer: undefined },
        }
      )

      el.messageBag.append(
        'Use <script>window.__bag = true</script> where score < 10',
        'message'
      )
      await nextTick()

      expect(form.find('.vf-message script').exists()).toBe(false)
      // The full string displays literally — markup inert, `<` unmangled.
      expect(form.text()).toContain(
        'Use <script>window.__bag = true</script> where score < 10'
      )
      expect((window as any).__bag).toBeUndefined()
    })
  })
})
