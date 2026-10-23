import { defineSchema } from '@vueform/core'
import dompurify from '@vueform/dompurify'
/**
 * # Security module — option semantics
 *
 * Functional coverage of the `$security` options with the module registered:
 * the `allowProps` pattern grammar, the `sanitizer` states and deliberate
 * opt-outs, `allowHtml`'s default-vs-configured contract, markup detection,
 * scope boundaries between gates, warning behavior, cipher configuration
 * validation, and the DOMPurify plugin plumbing.
 *
 * Adversarial tests — hostile schemas, breakout payloads, fail-closed
 * containment — live in `tests/integration/security/` (see its README).
 */
import { h, nextTick, type FunctionalComponent } from 'vue'

import { createForm } from '../../helpers'

const Resolved: FunctionalComponent = () =>
  h('span', { class: 'resolved' }, 'Resolved')
Resolved.inheritAttrs = false

const withComponents = { global: { components: { Resolved } } }

describe('`allowProps` pattern grammar', () => {
  const resolved = (allowProps: (string | RegExp)[], prop: string) => {
    const { el } = createForm(
      {
        schema: defineSchema({
          source: { type: 'text', label: 'Src' },
          el: { type: 'text', help: `{source@${prop}}` },
        }),
      },
      { $security: { allowProps } } as any
    )

    return el.help
  }

  it('should match the flat reference only with a plain prop name', () => {
    expect(resolved(['label'], 'label')).toBe('Src')
    expect(resolved(['props'], 'props.label')).toBe('')
  })

  it('should match one nested level with `prop.*` but not the flat form', () => {
    expect(resolved(['props.*'], 'props.label')).toBe('Src')
    expect(resolved(['props.*'], 'label')).toBe('')
    expect(resolved(['props.*'], 'props.label.length')).toBe('')
  })

  it('should treat trailing `*` segments as optional', () => {
    expect(resolved(['props.*.*'], 'props.label')).toBe('Src')
    expect(resolved(['props.*.*'], 'props.label.length')).toBe('3')
    expect(resolved(['props.*.*'], 'label')).toBe('')
  })

  it('should require static segments midway', () => {
    expect(resolved(['props.*.length'], 'props.label.length')).toBe('3')
    expect(resolved(['props.*.length'], 'props.label')).toBe('')
  })

  it('should match any depth with `prop.**` but not the flat form', () => {
    expect(resolved(['props.**'], 'props.label')).toBe('Src')
    expect(resolved(['props.**'], 'props.label.length')).toBe('3')
    expect(resolved(['label.**'], 'label')).toBe('')
  })

  it('should match prop-name prefixes and suffixes', () => {
    expect(resolved(['lab*'], 'label')).toBe('Src')
    expect(resolved(['*abel'], 'label')).toBe('Src')
    expect(resolved(['lab*'], 'help')).toBe('')
  })

  it('should combine name wildcards with nesting', () => {
    expect(resolved(['pro*.*'], 'props.label')).toBe('Src')
    expect(resolved(['pro*.*'], 'label')).toBe('')
  })

  it('should match any flat prop with a standalone `*`', () => {
    expect(resolved(['*'], 'label')).toBe('Src')
    expect(resolved(['*'], 'props.label')).toBe('')
  })

  it('should match everything with a standalone `**`', () => {
    expect(resolved(['**'], 'label')).toBe('Src')
    expect(resolved(['**'], 'props.label.length')).toBe('3')
  })

  it('should test RegExp entries against the full prop path', () => {
    expect(resolved([/^label$/], 'label')).toBe('Src')
    expect(resolved([/^label$/], 'props.label')).toBe('')
    expect(resolved([/^props\.label\b/], 'props.label.length')).toBe('3')
  })

  it('should match RegExp entries on nested prop paths', () => {
    const { el } = createForm(
      {
        schema: defineSchema({
          source: { type: 'text', label: 'Src' },
          el: {
            type: 'text',
            help: '{source@props.label}',
            placeholder: '{source@label}',
          },
        }),
      },
      { $security: { allowProps: [/^props\./] } } as any
    )

    expect(el.help).toBe('Src')
    // A denied reference resolves empty; the empty prop finalizes undefined.
    expect(el.placeholder).toBeUndefined()
  })
})

describe('`sanitizer` states', () => {
  /**
   * An app enables `allowHtml` but never installs a sanitizer — an unresolved
   * configuration, exactly like configured-but-missing ciphers. In development
   * the HTML renders raw with a one-time warning naming the fix (install
   * `@vueform/dompurify`, or consciously opt out with an identity
   * `sanitizer`), so the app stays workable while the console flags the gap.
   * Production renders the area empty instead — proven in the adversarial
   * suite.
   */
  test('it should render raw HTML with a warning when no sanitizer is installed (dev)', async () => {
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
      { $security: { allowHtml: ['content'], sanitizer: undefined } }
    )

    await nextTick()

    expect(form.find('b').exists()).toBe(true)
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        '`$security.allowHtml` is configured but no `$security.sanitizer` is'
      )
    )

    warn.mockRestore()
  })

  /**
   * Registering an identity engine (`sanitizer: (html) => html`) is the
   * conscious, greppable opt-out — mirroring the ciphers, where identity
   * functions are the documented way to consciously store plaintext.
   */
  test('it should render raw HTML under the explicit identity-sanitizer opt-out', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          c: {
            type: 'content',
            content: '<b data-raw="yes">bold</b>',
          },
        }),
      },
      {
        $security: {
          allowHtml: ['content'],
          sanitizer: (html: string) => html,
        },
      }
    )

    await nextTick()

    expect(form.find('b[data-raw="yes"]').exists()).toBe(true)
  })

  /**
   * Under the identity-sanitizer opt-out the app declared its schemas trusted,
   * and slot HTML renders exactly as authored — inline handlers included, the
   * same behavior the markup would have anywhere else in the app. With an
   * engine installed, `on*` attributes never survive sanitization (proven in
   * the adversarial suite).
   */
  test('it should render slot HTML as authored under the identity opt-out', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            slots: {
              label: '<div class="ok" onclick="window.__slot3 = true">x</div>',
            },
          },
        }),
      },
      {
        $security: {
          allowHtml: ['slots'],
          sanitizer: (html: string) => html,
        },
      }
    )

    await nextTick()

    const div = form.find('.vf-label-group div.ok')
    expect(div.exists()).toBe(true)
    expect(div.attributes('onclick')).toBe('window.__slot3 = true')
  })
})

describe('`allowHtml` semantics', () => {
  /**
   * The out-of-the-box contract. With `allowHtml` unset, every area renders
   * HTML, always through the sanitizer.
   */
  test('it should render sanitized HTML in every area when `allowHtml` is unset', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          c: {
            type: 'content',
            content: '<b>bold</b><script>alert("xss")</script>',
          },
        }),
      },
      {
        plugins: [dompurify()],
        $security: { sanitizer: undefined },
      }
    )

    await nextTick()

    expect(form.find('b').exists()).toBe(true)
    expect(form.html()).not.toContain('<script>')
  })

  /**
   * Warning fatigue: most content is plain text, and an app that never renders
   * markup should not be nagged about an area it doesn't need — noisy warnings
   * train developers to ignore security output. Content without markup never
   * consults the gate at all; it renders identically either way.
   */
  test('it should render markup-free content without consulting the gate', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { form } = createForm(
      {
        schema: defineSchema({
          el: { type: 'content', content: 'Just text' },
        }),
      },
      {
        plugins: [dompurify()],
        $security: { sanitizer: undefined, allowHtml: [] },
      }
    )

    await nextTick()

    expect(form.text()).toContain('Just text')
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('allowHtml'))

    warn.mockRestore()
  })

  /**
   * A fidelity guarantee. The sanitize step runs only when the resolved string
   * actually contains markup (a `<` followed by a tag-start character, the
   * HTML parser's own rule) — plain text never enters the engine, so a
   * comparison like `score < 10` cannot be mangled into `score &lt; 10`, and
   * the engineless production fallback (render empty) can never blank plain
   * text.
   */
  test('it should leave markup-free text with `<` untouched by the engine', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          c: { type: 'content', content: 'score < 10, done' },
        }),
      },
      {
        plugins: [dompurify()],
        $security: { sanitizer: undefined, allowHtml: ['content'] },
      }
    )

    await nextTick()

    expect(form.text()).toContain('score < 10, done')
  })
})

describe('slot content semantics', () => {
  /**
   * The safe baseline. Plain text in a slot is ordinary content; gating it
   * would only push users toward broader opt-ins. Text renders through Vue's
   * escaping with no configuration at all — no `allowHtml`, no sanitizer.
   */
  test('it should render a plain text slot string with no security config', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            slots: { label: 'Custom label' },
          },
        }),
      },
      { $security: {} }
    )

    await nextTick()

    expect(form.find('.vf-label-group').text()).toBe('Custom label')
  })

  /**
   * A scope boundary. `banAttrs` governs prop **bags** (`parts`, cell `attrs`,
   * schema entries); slot HTML is governed solely by the sanitizer's policy
   * (`sanitizeOptions: { FORBID_ATTR: [...] }` for attribute bans inside
   * sanitized HTML). A `banAttrs` entry does not reach into slot markup — the
   * HTML renders per the sanitizer's verdict, `style` attribute included.
   */
  test('it should not apply `banAttrs` to slot HTML', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          el: {
            type: 'text',
            label: 'Foo',
            slots: {
              label: '<div class="ok" style="color: red">x</div>',
            },
          },
        }),
      },
      {
        $security: {
          allowHtml: ['slots'],
          sanitizer: (html: string) => html,
          banAttrs: ['style'],
        },
      }
    )

    await nextTick()

    expect(form.find('.vf-label-group div.ok').attributes('style')).toContain(
      'color: red'
    )
  })

  /**
   * Warning fatigue: a rejected name repeated across dozens of elements
   * flooding the console would train developers to ignore security warnings
   * entirely. Each rejected name warns once per instance, no matter how many
   * elements use it.
   */
  test('it should warn once per rejected name across elements', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    createForm(
      {
        schema: defineSchema({
          a: { type: 'text', label: 'A', template: 'Resolved' },
          b: { type: 'text', label: 'B', template: 'Resolved' },
        }),
      },
      { $security: {} },
      withComponents
    )

    await nextTick()

    const hits = warn.mock.calls.filter((call) =>
      String(call[0]).includes('`Resolved` is not listed')
    )
    expect(hits).toHaveLength(1)

    warn.mockRestore()
  })
})

describe('cipher configuration is validated', () => {
  /**
   * A half-configured cipher pair. `encrypt` without `decrypt` makes every
   * stored draft permanently unreadable; `decrypt` without `encrypt` feeds
   * plaintext to a decryptor. Either way the app believes it configured
   * encryption and did not. A dev warning names the missing half at instance
   * creation.
   */
  test('it should warn when encrypt is configured without decrypt', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    createForm(
      { schema: defineSchema({ name: { type: 'text', default: 'John' } }) },
      { $security: { encrypt: (value: string) => value } }
    )

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '`$security.encrypt` is configured without `decrypt`'
      )
    )

    warnSpy.mockRestore()
  })

  /** The mirror case — same warning, naming `encrypt` as the missing half. */
  test('it should warn when decrypt is configured without encrypt', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    createForm(
      { schema: defineSchema({ name: { type: 'text', default: 'John' } }) },
      { $security: { decrypt: (value: string) => value } }
    )

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '`$security.decrypt` is configured without `encrypt`'
      )
    )

    warnSpy.mockRestore()
  })

  /** No false alarms on a correct configuration. */
  test('it should not warn when both ciphers are configured', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    createForm(
      { schema: defineSchema({ name: { type: 'text', default: 'John' } }) },
      {
        $security: {
          encrypt: (value: string) => value,
          decrypt: (value: string) => value,
        },
      }
    )

    expect(warnSpy).not.toHaveBeenCalled()

    warnSpy.mockRestore()
  })
})

describe('DOMPurify plugin plumbing', () => {
  /**
   * Configuration fidelity. `sanitizeOptions` is the documented way to tighten
   * the engine; if it silently didn't reach `DOMPurify.sanitize()`, apps would
   * believe restrictions were in force. Options pass through verbatim — here
   * `ALLOWED_TAGS` reduces the allowed vocabulary to `em`, so `b` is stripped
   * while `em` stays.
   */
  test('it should pass sanitizeOptions through to the engine', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          c: {
            type: 'content',
            content: '<b>bold</b><em>kept</em>',
          },
        }),
      },
      {
        plugins: [dompurify()],
        $security: {
          sanitizer: undefined,
          allowHtml: ['content'],
          sanitizeOptions: { ALLOWED_TAGS: ['em'] },
        } as any,
      }
    )

    await nextTick()

    expect(form.find('.vf-content em').exists()).toBe(true)
    expect(form.find('.vf-content b').exists()).toBe(false)
  })

  /**
   * Configuration fidelity for the hook variant. `sanitizeInit` receives the
   * DOMPurify instance before first use; a hook added there (the documented
   * `rel` hardening pattern) shows up on the rendered output.
   */
  test('it should apply sanitizeInit hooks to the engine', async () => {
    const { form } = createForm(
      {
        schema: defineSchema({
          c: {
            type: 'content',
            content: '<a href="https://example.com">link</a>',
          },
        }),
      },
      {
        plugins: [dompurify()],
        $security: {
          sanitizer: undefined,
          allowHtml: ['content'],
          sanitizeInit: (dp: any) => {
            dp.addHook('afterSanitizeAttributes', (node: any) => {
              if (node.tagName === 'A') {
                node.setAttribute('rel', 'noopener noreferrer')
              }
            })
            return dp
          },
        } as any,
      }
    )

    await nextTick()

    const link = form.find('.vf-content a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('rel')).toBe('noopener noreferrer')
  })
})
