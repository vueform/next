import { defineSchema, createRule } from '#core'

import { createForm, flushPromises } from '../../helpers'

describe('Validation', () => {
  describe('Basic Usage', () => {
    it('should validate rules defined as pipe-separated string', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required|email' },
        }),
      })

      await email.validate()
      expect(email.invalid).toBe(true)
      expect(email.errors.length).toBeGreaterThan(0)
    })

    it('should validate rules defined as array', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: ['required', 'email'] },
        }),
      })

      await email.validate()
      expect(email.invalid).toBe(true)
      expect(email.errors.length).toBeGreaterThan(0)
    })

    it('should produce equivalent validity for string and array formats', async () => {
      const { str } = createForm({
        schema: defineSchema({
          str: { type: 'text', rules: 'required' },
        }),
      })

      const { arr } = createForm({
        schema: defineSchema({
          arr: { type: 'text', rules: ['required'] },
        }),
      })

      await str.validate()
      await arr.validate()
      expect(str.invalid).toBe(arr.invalid)
      expect(str.errors.length).toBe(arr.errors.length)
    })

    it('should pass validation when value satisfies rules', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: {
            type: 'text',
            rules: 'required|email',
            default: 'test@example.com',
          },
        }),
      })

      await email.validate()
      expect(email.invalid).toBe(false)
      expect(email.errors).toEqual([])
    })
  })

  describe('Rule Parameters', () => {
    it('should validate positional parameters', async () => {
      const { short, long } = createForm({
        schema: defineSchema({
          short: { type: 'text', rules: 'min:5', default: 'ab' },
          long: { type: 'text', rules: 'min:5', default: 'abcdef' },
        }),
      })

      await short.validate()
      await long.validate()
      expect(short.invalid).toBe(true)
      expect(long.invalid).toBe(false)
    })

    it('should validate element reference parameters', async () => {
      const { confirm } = createForm({
        schema: defineSchema({
          password: { type: 'text', default: 'secret123' },
          confirm: {
            type: 'text',
            rules: 'same:password',
            default: 'different',
          },
        }),
      })

      await confirm.validate()
      expect(confirm.invalid).toBe(true)

      confirm.update('secret123')
      await confirm.validate()
      expect(confirm.invalid).toBe(false)
    })
  })

  describe('Validation Triggers', () => {
    it('should start unvalidated with no errors', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required|email' },
        }),
      })

      expect(email.validated).toBe(false)
      expect(email.invalid).toBe(false)
      expect(email.errors).toEqual([])
    })

    it('should validate on input when validateOn includes change', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
        validateOn: ['change'],
      })

      email.handleInput('')
      await flushPromises()

      expect(email.validated).toBe(true)
      expect(email.invalid).toBe(true)
    })

    it('should not validate on input when validateOn is blur only', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
        validateOn: ['blur'],
      })

      email.handleInput('')
      await flushPromises()

      expect(email.validated).toBe(false)
      expect(email.invalid).toBe(false)
    })

    it('should validate on blur when validateOn includes blur', async () => {
      const { form, email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
        validateOn: ['blur'],
      })

      await form.find('input').trigger('blur')
      await flushPromises()

      expect(email.touched).toBe(true)
      expect(email.validated).toBe(true)
      expect(email.invalid).toBe(true)
    })

    it('should revalidate on input after blur when validateOn is blur', async () => {
      const { form, email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
        validateOn: ['blur'],
      })

      await form.find('input').trigger('blur')
      await flushPromises()
      expect(email.invalid).toBe(true)

      email.handleInput('hello')
      await flushPromises()

      expect(email.invalid).toBe(false)
    })

    it('should not validate on input before the element is touched when validateOn is blur', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
        validateOn: ['blur'],
      })

      // Typing alone must not mark the element touched, so blur-gated live
      // validation stays off until an actual blur.
      email.handleInput('')
      await flushPromises()

      expect(email.touched).toBe(false)
      expect(email.validated).toBe(false)
    })

    it('should not validate on blur when validateOn is submit only', async () => {
      const { form, email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
        validateOn: ['submit'],
      })

      email.handleInput('')
      await form.find('input').trigger('blur')
      await flushPromises()

      expect(email.validated).toBe(false)
      expect(email.invalid).toBe(false)
    })

    it('should validate on explicit form validate when validateOn is submit only', async () => {
      const { form$, email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
        validateOn: ['submit'],
      })

      await form$.validate()
      await flushPromises()

      expect(email.validated).toBe(true)
      expect(email.invalid).toBe(true)
    })

    it('should block next when validateOn includes next', async () => {
      const { form$ } = createForm({
        stepped: true,
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', rules: 'required' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
        }),
      })

      await form$.steps.next()
      await flushPromises()

      expect(form$.steps.page).toBe('step1')
      expect(form$.find('name').invalid).toBe(true)
    })

    it('should skip next validation when validateOn does not include next', async () => {
      const { form$ } = createForm({
        stepped: true,
        validateOn: ['submit'],
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text', rules: 'required' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text' } },
          },
        }),
      })

      await form$.steps.next()
      await flushPromises()

      expect(form$.steps.page).toBe('step2')
      expect(form$.find('name').validated).toBe(false)
    })

    it('should block back when validateOn includes back', async () => {
      const { form$ } = createForm({
        stepped: true,
        validateOn: ['back'],
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text', rules: 'required' } },
          },
        }),
      })

      form$.steps.select('step2')
      await flushPromises()

      await form$.steps.back()
      await flushPromises()

      expect(form$.steps.page).toBe('step2')
      expect(form$.find('email').invalid).toBe(true)
    })

    it('should skip back validation when validateOn does not include back', async () => {
      const { form$ } = createForm({
        stepped: true,
        validateOn: ['submit'],
        schema: defineSchema({
          step1: {
            type: 'group',
            page: 'Step 1',
            schema: { name: { type: 'text' } },
          },
          step2: {
            type: 'group',
            page: 'Step 2',
            schema: { email: { type: 'text', rules: 'required' } },
          },
        }),
      })

      form$.steps.select('step2')
      await flushPromises()

      await form$.steps.back()
      await flushPromises()

      expect(form$.steps.page).toBe('step1')
      expect(form$.find('email').validated).toBe(false)
    })
  })

  describe('Custom rule deps', () => {
    it('should revalidate a custom rule when a declared dep changes', async () => {
      const matches = createRule(
        'matches_other',
        (value, { form$ }) => value === form$?.find('other')?.value,
        { deps: ['other'], message: 'Must match other' }
      )

      const { field, other } = createForm({
        schema: defineSchema({
          other: { type: 'text', default: 'left' },
          field: {
            type: 'text',
            rules: [matches],
            default: 'right',
          },
        }),
      })

      await field.validate()
      expect(field.invalid).toBe(true)

      other.update('right')
      await flushPromises()

      expect(field.invalid).toBe(false)
    })

    it('should resolve function deps at index time', async () => {
      const matches = createRule(
        'matches_other_fn',
        (value, { form$ }) => value === form$?.find('other')?.value,
        {
          deps: () => ['other'],
          message: 'Must match other',
        }
      )

      const { field, other } = createForm({
        schema: defineSchema({
          other: { type: 'text', default: 'left' },
          field: {
            type: 'text',
            rules: [matches],
            default: 'right',
          },
        }),
      })

      await field.validate()
      expect(field.invalid).toBe(true)

      other.update('right')
      await flushPromises()

      expect(field.invalid).toBe(false)
    })

    it('should skip dep revalidation until the owner has been validated', async () => {
      const matches = createRule(
        'matches_other_gated',
        (value, { form$ }) => value === form$?.find('other')?.value,
        { deps: ['other'] }
      )

      const { field, other } = createForm({
        schema: defineSchema({
          other: { type: 'text', default: 'left' },
          field: {
            type: 'text',
            rules: [matches],
            default: 'right',
          },
        }),
      })

      other.update('right')
      await flushPromises()

      expect(field.validated).toBe(false)
      expect(field.invalid).toBe(false)
    })
  })

  describe('Structured issues', () => {
    it('should expose form$.issues after validation', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required|email', default: 'nope' },
        }),
      })

      await form$.validate()
      await flushPromises()

      expect(form$.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: 'email',
            rule: 'email',
            message: expect.stringContaining('email'),
          }),
        ])
      )
    })

    it('should include language on translatable issues', async () => {
      const { form$ } = createForm(
        {
          schema: defineSchema({
            title: { type: 'text', rules: 'required', translate: true },
          }),
        },
        { languages: { en: 'English', fr: 'French' } }
      )

      await form$.validate()
      await flushPromises()

      const languages = form$.issues.map((issue: any) => issue.language)
      expect(languages).toEqual(expect.arrayContaining(['en', 'fr']))
    })
  })

  describe('Debouncing', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should delay validation with element-level debounce', async () => {
      const { username } = createForm({
        schema: defineSchema({
          username: { type: 'text', rules: 'required', debounce: 300 },
        }),
      })

      const promise = username.validate()

      expect(username.validated).toBe(false)

      await vi.advanceTimersByTimeAsync(300)
      await promise

      expect(username.validated).toBe(true)
      expect(username.invalid).toBe(true)
    })

    it('should delay only the specific rule with rule-level debounce', async () => {
      const { username } = createForm({
        schema: defineSchema({
          username: {
            type: 'text',
            rules: 'min:3,debounce=500',
            default: 'ab',
          },
        }),
      })

      const promise = username.validate()

      expect(username.validated).toBe(false)

      await vi.advanceTimersByTimeAsync(500)
      await promise

      expect(username.validated).toBe(true)
      expect(username.invalid).toBe(true)
    })
  })

  describe('Bail', () => {
    it('should stop after first failing rule by default (bail: true)', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required|email|min:5' },
        }),
      })

      await email.validate()
      expect(email.invalid).toBe(true)
      expect(email.errors).toHaveLength(1)
    })

    it('should run all rules when bail is false', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required|email|min:5', bail: false },
        }),
      })

      await email.validate()
      expect(email.invalid).toBe(true)
      expect(email.errors.length).toBeGreaterThan(1)
    })
  })

  describe('Conditional RulesProp', () => {
    it('should activate rule only when condition is met', async () => {
      const { subscribe, email } = createForm({
        schema: defineSchema({
          subscribe: { type: 'text', default: '' },
          email: {
            type: 'text',
            rules: [{ rules: 'required', $if: [['subscribe', '==', 'yes']] }],
          },
        }),
      })

      await email.validate()
      expect(email.invalid).toBe(false)

      subscribe.update('yes')
      await email.validate()
      expect(email.invalid).toBe(true)
    })

    it('should deactivate rule when condition becomes false', async () => {
      const { subscribe, email } = createForm({
        schema: defineSchema({
          subscribe: { type: 'text', default: 'yes' },
          email: {
            type: 'text',
            rules: [{ rules: 'required', $if: [['subscribe', '==', 'yes']] }],
          },
        }),
      })

      await email.validate()
      expect(email.invalid).toBe(true)

      subscribe.update('no')
      await email.validate()
      expect(email.invalid).toBe(false)
    })

    it('should support multiple conditional rules', async () => {
      const { type, amount } = createForm({
        schema: defineSchema({
          type: { type: 'text', default: 'premium' },
          amount: {
            type: 'text',
            rules: [
              'numeric',
              { rules: 'required', $if: [['type', '!=', 'free']] },
              { rules: 'min:10', $if: [['type', '==', 'premium']] },
            ],
            default: '5',
          },
        }),
      })

      await amount.validate()
      expect(amount.invalid).toBe(true)

      amount.update('15')
      await amount.validate()
      expect(amount.invalid).toBe(false)

      type.update('basic')
      amount.update('1')
      await amount.validate()
      expect(amount.invalid).toBe(false)
    })

    it('should apply one $if to multiple rules', async () => {
      const { type, amount } = createForm({
        schema: defineSchema({
          type: { type: 'text', default: 'premium' },
          amount: {
            type: 'text',
            rules: {
              rules: ['required', 'min:10'],
              $if: [['type', '==', 'premium']],
            },
            default: '5',
          },
        }),
      })

      await amount.validate()
      expect(amount.invalid).toBe(true)

      amount.update('15')
      await amount.validate()
      expect(amount.invalid).toBe(false)

      type.update('basic')
      amount.update('')
      await amount.validate()
      expect(amount.invalid).toBe(false)
    })

    describe('with multilingual rules', () => {
      const languages = { en: 'English', de: 'German' }

      it('should apply the same $if to every language', async () => {
        const { type, title, form$ } = createForm(
          {
            schema: defineSchema({
              type: { type: 'text', default: '' },
              title: {
                type: 'text',
                translate: true,
                rules: {
                  rules: 'required',
                  $if: [['type', '==', 'business']],
                },
              },
            }),
          },
          { languages }
        )

        await title.validate()
        expect(title.invalid).toBe(false)

        type.update('business')
        await title.validate()
        expect(title.invalid).toBe(true)
        expect(form$.issues.map((issue: any) => issue.language)).toEqual(
          expect.arrayContaining(['en', 'de'])
        )

        title.update({ en: 'Hello', de: '' })
        await title.validate()
        expect(title.invalid).toBe(true)
        expect(form$.issues.map((issue: any) => issue.language)).toEqual(['de'])

        title.update({ en: 'Hello', de: 'Hallo' })
        await title.validate()
        expect(title.invalid).toBe(false)

        type.update('personal')
        title.update({ en: '', de: '' })
        await title.validate()
        expect(title.invalid).toBe(false)
      })

      it('should apply per-language $if with different rules', async () => {
        const { type, title, form$ } = createForm(
          {
            schema: defineSchema({
              type: { type: 'text', default: '' },
              title: {
                type: 'text',
                translate: true,
                default: { en: '', de: 'nope' },
                rules: {
                  en: {
                    rules: 'required',
                    $if: [['type', '==', 'business']],
                  },
                  de: {
                    rules: 'email',
                    $if: [['type', '==', 'business']],
                  },
                },
              },
            }),
          },
          { languages }
        )

        await title.validate()
        expect(title.invalid).toBe(false)

        type.update('business')
        await title.validate()
        expect(title.invalid).toBe(true)
        expect(form$.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ language: 'en', rule: 'required' }),
            expect.objectContaining({ language: 'de', rule: 'email' }),
          ])
        )

        title.update({ en: 'Hello', de: 'user@example.com' })
        await title.validate()
        expect(title.invalid).toBe(false)
      })

      it('should use a different $if per language', async () => {
        const { country, title, form$ } = createForm(
          {
            schema: defineSchema({
              country: { type: 'text', default: '' },
              title: {
                type: 'text',
                translate: true,
                rules: {
                  en: {
                    rules: 'required',
                    $if: [['country', '==', 'us']],
                  },
                  de: {
                    rules: 'required',
                    $if: [['country', '==', 'de']],
                  },
                },
              },
            }),
          },
          { languages }
        )

        country.update('us')
        await title.validate()
        expect(title.invalid).toBe(true)
        expect(form$.issues.map((issue: any) => issue.language)).toEqual(['en'])

        country.update('de')
        await title.validate()
        expect(title.invalid).toBe(true)
        expect(form$.issues.map((issue: any) => issue.language)).toEqual(['de'])

        country.update('fr')
        await title.validate()
        expect(title.invalid).toBe(false)
      })

      it('should mix always-on and conditional rules per language', async () => {
        const { flag, title, form$ } = createForm(
          {
            schema: defineSchema({
              flag: { type: 'text', default: '' },
              title: {
                type: 'text',
                translate: true,
                rules: {
                  en: [{ rules: 'required', $if: [['flag', '==', 'yes']] }],
                  de: 'required',
                },
              },
            }),
          },
          { languages }
        )

        await title.validate()
        expect(title.invalid).toBe(true)
        expect(form$.issues.map((issue: any) => issue.language)).toEqual(['de'])

        flag.update('yes')
        await title.validate()
        expect(title.invalid).toBe(true)
        expect(form$.issues.map((issue: any) => issue.language)).toEqual(
          expect.arrayContaining(['en', 'de'])
        )

        title.update({ en: 'Hello', de: 'Hallo' })
        await title.validate()
        expect(title.invalid).toBe(false)
      })

      it('should deactivate multilingual conditional rules when $if becomes false', async () => {
        const { type, title } = createForm(
          {
            schema: defineSchema({
              type: { type: 'text', default: 'business' },
              title: {
                type: 'text',
                translate: true,
                rules: {
                  en: {
                    rules: 'required',
                    $if: [['type', '==', 'business']],
                  },
                  de: {
                    rules: 'required',
                    $if: [['type', '==', 'business']],
                  },
                },
              },
            }),
          },
          { languages }
        )

        await title.validate()
        expect(title.invalid).toBe(true)

        type.update('personal')
        await title.validate()
        expect(title.invalid).toBe(false)
      })
    })
  })

  describe('Custom RulesProp', () => {
    it('should validate with inline custom rule returning boolean', async () => {
      const lowercase = createRule(
        'lowercase',
        (value) => value === value.toLowerCase()
      )

      const { username } = createForm({
        schema: defineSchema({
          username: { type: 'text', rules: [lowercase], default: 'ABC' },
        }),
      })

      await username.validate()
      expect(username.invalid).toBe(true)

      username.update('abc')
      await username.validate()
      expect(username.invalid).toBe(false)
    })

    it('should use string return as error message', async () => {
      const lowercase = createRule(
        'lowercase',
        (value) => value === value.toLowerCase() || 'Must be lowercase'
      )

      const { username } = createForm(
        {
          schema: defineSchema({
            username: { type: 'text', rules: [lowercase], default: 'ABC' },
          }),
        },
        { fallbackLocale: 'en_US' }
      )

      await username.validate()
      expect(username.invalid).toBe(true)
      expect(username.errors).toContain('Must be lowercase')
    })

    it('should use message option from createRule', async () => {
      const lowercase = createRule(
        'lowercase',
        (value) => value === value.toLowerCase(),
        {
          message: 'The {attribute} must be lowercase.',
        }
      )

      const { username } = createForm(
        {
          schema: defineSchema({
            username: { type: 'text', rules: [lowercase], default: 'ABC' },
          }),
        },
        { fallbackLocale: 'en_US' }
      )

      await username.validate()
      expect(username.invalid).toBe(true)
      expect(username.errors[0]).toContain('must be lowercase')
    })

    it('should merge messageParams onto default placeholders', async () => {
      const matches = createRule(
        'matches_other',
        (value, { params }) => value === params.other$?.value,
        {
          params: ['other$'],
          message: 'The {attribute} must match {other}.',
          messageParams: ({ params }) => ({
            other: params.other$?.genericName,
          }),
        }
      )

      const { field } = createForm(
        {
          schema: defineSchema({
            other: { type: 'text', label: 'Other', default: 'left' },
            field: {
              type: 'text',
              label: 'Field',
              rules: [matches('other')],
              default: 'right',
            },
          }),
        },
        { fallbackLocale: 'en_US' }
      )

      await field.validate()
      expect(field.errors[0]).toBe('The Field must match Other.')
    })

    it('should support inline rule with positional params', async () => {
      const minWords = createRule(
        'min_words',
        (value, { params }) => {
          const count = value.trim().split(/\s+/).length
          return count >= Number(params.min)
        },
        {
          params: ['min'] as const,
          message: 'The {attribute} must have at least {min} words.',
        }
      )

      const { bio } = createForm(
        {
          schema: defineSchema({
            bio: { type: 'text', rules: [minWords(3)], default: 'hello' },
          }),
        },
        { fallbackLocale: 'en_US' }
      )

      await bio.validate()
      expect(bio.invalid).toBe(true)

      bio.update('hello world again')
      await bio.validate()
      expect(bio.invalid).toBe(false)
    })

    it('should support inline rule with named params', async () => {
      const minWords = createRule(
        'min_words',
        (value, { params }) => {
          const count = value.trim().split(/\s+/).length
          return count >= Number(params.min)
        },
        {
          params: ['min'] as const,
          message: 'The {attribute} must have at least {min} words.',
        }
      )

      const { bio } = createForm(
        {
          schema: defineSchema({
            bio: {
              type: 'text',
              rules: [minWords({ min: 3 })],
              default: 'one two',
            },
          }),
        },
        { fallbackLocale: 'en_US' }
      )

      await bio.validate()
      expect(bio.invalid).toBe(true)

      bio.update('one two three')
      await bio.validate()
      expect(bio.invalid).toBe(false)
    })

    it('should support inline rule with multiple positional params', async () => {
      const wordsBetween = createRule(
        'words_between',
        (value, { params }) => {
          const count = value.trim().split(/\s+/).length
          return count >= Number(params.min) && count <= Number(params.max)
        },
        {
          params: ['min', 'max'] as const,
        }
      )

      const { bio } = createForm({
        schema: defineSchema({
          bio: { type: 'text', rules: [wordsBetween(2, 4)], default: 'hello' },
        }),
      })

      await bio.validate()
      expect(bio.invalid).toBe(true)

      bio.update('hello world')
      await bio.validate()
      expect(bio.invalid).toBe(false)

      bio.update('one two three four five')
      await bio.validate()
      expect(bio.invalid).toBe(true)
    })

    it('should support inline rule with variadic params', async () => {
      const oneOf = createRule(
        'one_of',
        (value, { params }) => params.includes(value),
        { params: true }
      )

      const { color } = createForm({
        schema: defineSchema({
          color: {
            type: 'text',
            rules: [oneOf('red', 'green', 'blue')],
            default: 'yellow',
          },
        }),
      })

      await color.validate()
      expect(color.invalid).toBe(true)

      color.update('green')
      await color.validate()
      expect(color.invalid).toBe(false)
    })

    it('should interpolate params in error messages for inline rules', async () => {
      const minWords = createRule(
        'min_words',
        (value, { params }) => {
          const count = value.trim().split(/\s+/).length
          return count >= Number(params.min)
        },
        {
          params: ['min'] as const,
          message: 'The {attribute} must have at least {min} words.',
        }
      )

      const { bio } = createForm(
        {
          schema: defineSchema({
            bio: { type: 'text', rules: [minWords(3)], default: 'hello' },
          }),
        },
        { fallbackLocale: 'en_US' }
      )

      await bio.validate()
      expect(bio.invalid).toBe(true)
      expect(bio.errors[0]).toContain('3')
      expect(bio.errors[0]).toContain('bio')
    })

    it('should support globally registered custom rules', async () => {
      const phone = createRule(
        'phone',
        (value) => /^\+?[\d\s\-()]+$/.test(value),
        {
          message: 'The {attribute} must be a valid phone number.',
        }
      )

      const { tel } = createForm(
        {
          schema: defineSchema({
            tel: { type: 'text', rules: 'phone', default: 'not-a-phone!' },
          }),
        },
        { rules: { phone }, fallbackLocale: 'en_US' }
      )

      await tel.validate()
      expect(tel.invalid).toBe(true)
      expect(tel.errors[0]).toContain('phone number')

      tel.update('+1 (555) 123-4567')
      await tel.validate()
      expect(tel.invalid).toBe(false)
    })
  })

  describe('Async Validation', () => {
    it('should resolve async rule correctly', async () => {
      const asyncRule = createRule('async_rule', async () => true)

      const { username } = createForm({
        schema: defineSchema({
          username: { type: 'text', rules: [asyncRule], default: 'test' },
        }),
      })

      await username.validate()
      expect(username.invalid).toBe(false)
      expect(username.validated).toBe(true)
    })

    it('should handle async rule that fails', async () => {
      const asyncRule = createRule('async_rule', async () => false)

      const { username } = createForm({
        schema: defineSchema({
          username: { type: 'text', rules: [asyncRule], default: 'test' },
        }),
      })

      await username.validate()
      expect(username.invalid).toBe(true)
    })

    it('should set busy to false after async rule completes', async () => {
      const asyncRule = createRule('async_rule', async () => true)

      const { username } = createForm({
        schema: defineSchema({
          username: { type: 'text', rules: [asyncRule], default: 'test' },
        }),
      })

      await username.validate()
      expect(username.busy).toBe(false)
      expect(username.pending).toBe(false)
    })
  })

  describe('Custom Error Messages', () => {
    it('should use element-level messages prop for custom rules', async () => {
      const noSpaces = createRule('no_spaces', (value) => !/\s/.test(value))

      const { username } = createForm(
        {
          schema: defineSchema({
            username: {
              type: 'text',
              rules: [noSpaces],
              default: 'has space',
              ruleMessages: { no_spaces: 'No spaces allowed in username.' },
            },
          }),
        },
        { fallbackLocale: 'en_US' }
      )

      await username.validate()
      expect(username.errors).toContain('No spaces allowed in username.')
    })

    it('should use form-level messages prop for custom rules', async () => {
      const noSpaces = createRule('no_spaces', (value) => !/\s/.test(value))

      const { first, last } = createForm(
        {
          schema: defineSchema({
            first: { type: 'text', rules: [noSpaces], default: 'has space' },
            last: { type: 'text', rules: [noSpaces], default: 'has space' },
          }),
          ruleMessages: { no_spaces: 'No spaces allowed.' },
        },
        { fallbackLocale: 'en_US' }
      )

      await first.validate()
      await last.validate()
      expect(first.errors).toContain('No spaces allowed.')
      expect(last.errors).toContain('No spaces allowed.')
    })

    it('should prioritize element-level messages over form-level', async () => {
      const noSpaces = createRule('no_spaces', (value) => !/\s/.test(value))

      const { username } = createForm(
        {
          schema: defineSchema({
            username: {
              type: 'text',
              rules: [noSpaces],
              default: 'has space',
              ruleMessages: { no_spaces: 'Username: no spaces.' },
            },
          }),
          ruleMessages: { no_spaces: 'No spaces allowed.' },
        },
        { fallbackLocale: 'en_US' }
      )

      await username.validate()
      expect(username.errors).toContain('Username: no spaces.')
      expect(username.errors).not.toContain('No spaces allowed.')
    })

    it('should replace {attribute} with displayName', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: {
            type: 'text',
            rules: 'required',
            displayName: 'email address',
          },
        }),
      })

      await email.validate()
      expect(email.errors[0]).toContain('email address')
    })

    it('should replace {attribute} with element name by default', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: {
            type: 'text',
            rules: 'required',
          },
        }),
      })

      await email.validate()
      expect(email.errors[0]).toContain('email')
    })
  })

  describe('Manual Error Management', () => {
    it('should add error with messageBag.append', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
        }),
      })

      email.messageBag.append('Server error occurred.', 'error')
      expect(email.errors).toContain('Server error occurred.')
    })

    it('should prepend error with messageBag.prepend', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
      })

      await email.validate()
      email.messageBag.prepend('Top error.', 'error')

      expect(email.errors[0]).toBe('Top error.')
    })

    it('should remove error with messageBag.remove', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
        }),
      })

      email.messageBag.append('Removable error.', 'error')
      expect(email.errors).toContain('Removable error.')

      email.messageBag.remove('Removable error.', 'error')
      expect(email.errors).not.toContain('Removable error.')
    })

    it('should clear errors with messageBag.clear("errors")', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
        }),
      })

      email.messageBag.append('Error 1', 'error')
      email.messageBag.append('Error 2', 'error')
      expect(email.errors).toHaveLength(2)

      email.messageBag.clear('errors')
      expect(email.errors).toHaveLength(0)
    })

    it('should clear all with messageBag.clear()', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
        }),
      })

      email.messageBag.append('An error.', 'error')
      email.messageBag.append('A message.', 'message')

      email.messageBag.clear()
      expect(email.errors).toHaveLength(0)
      expect(email.messages).toHaveLength(0)
    })

    it('should auto-clear custom errors on value change by default', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
        }),
      })

      email.messageBag.append('Custom error.', 'error')
      expect(email.errors).toContain('Custom error.')

      email.update('new@example.com')
      expect(email.errors).not.toContain('Custom error.')
    })

    it('should persist custom errors on value change when clearCustomErrors is false', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
        }),
        clearCustomErrors: false,
      })

      email.messageBag.append('Persistent error.', 'error')
      expect(email.errors).toContain('Persistent error.')

      email.update('new@example.com')
      expect(email.errors).toContain('Persistent error.')
    })
  })

  describe('Validation State (Element)', () => {
    it('should set invalid to true after failed validation', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
      })

      expect(email.invalid).toBe(false)
      await email.validate()
      expect(email.invalid).toBe(true)
    })

    it('should set validated to true after validation runs', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: {
            type: 'text',
            rules: 'required',
            default: 'test@example.com',
          },
        }),
      })

      expect(email.validated).toBe(false)
      await email.validate()
      expect(email.validated).toBe(true)
    })

    it('should reflect dirty state when value changes from initial', () => {
      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'initial' },
        }),
      })

      expect(name.dirty).toBe(false)
      name.update('changed')
      expect(name.dirty).toBe(true)
      name.update('initial')
      expect(name.dirty).toBe(false)
    })

    it('should reflect empty state', () => {
      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text' },
        }),
      })

      expect(name.empty).toBe(true)
      name.update('hello')
      expect(name.empty).toBe(false)
      name.update('')
      expect(name.empty).toBe(true)
    })

    it('should set required to true when active required rule exists', () => {
      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
      })

      expect(name.required).toBe(true)
    })

    it('should set required to true when active accepted rule exists', () => {
      const { terms } = createForm({
        schema: defineSchema({
          terms: { type: 'text', rules: 'accepted' },
        }),
      })

      expect(terms.required).toBe(true)
    })

    it('should set required to false when no required or accepted rule', () => {
      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text', rules: 'email' },
        }),
      })

      expect(name.required).toBe(false)
    })

    it('should set completed to true when all rules pass', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: {
            type: 'text',
            rules: 'required|email',
            default: 'test@example.com',
          },
        }),
      })

      expect(email.completed).toBe(false)
      await email.validate()
      expect(email.completed).toBe(true)
    })

    it('should set completed to true when no rules are defined', () => {
      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text' },
        }),
      })

      expect(name.completed).toBe(true)
    })

    it('should set completed to false when validation fails', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
      })

      await email.validate()
      expect(email.completed).toBe(false)
    })

    it('should contain error messages in errors array', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
      })

      await email.validate()
      expect(email.errors.length).toBeGreaterThan(0)
      expect(typeof email.errors[0]).toBe('string')
    })

    it('should respect maxErrors for displayErrors', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: {
            type: 'text',
            rules: 'required|email|min:5',
            bail: false,
            maxErrors: 2,
          },
        }),
      })

      await email.validate()
      expect(email.errors.length).toBeGreaterThan(2)
      expect(email.displayErrors).toHaveLength(2)
    })
  })

  describe('Validation State (Form)', () => {
    it('should aggregate invalid from children', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          first: { type: 'text', rules: 'required' },
          last: { type: 'text', rules: 'required', default: 'Doe' },
        }),
      })

      await form$.validate()
      expect(form$.invalid).toBe(true)
    })

    it('should set validated to true when all children are validated', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          first: { type: 'text', rules: 'required', default: 'John' },
          last: { type: 'text', rules: 'required', default: 'Doe' },
        }),
      })

      expect(form$.validated).toBe(false)
      await form$.validate()
      expect(form$.validated).toBe(true)
    })

    it('should not be invalid when all children pass', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          first: { type: 'text', rules: 'required', default: 'John' },
          last: { type: 'text', rules: 'required', default: 'Doe' },
        }),
      })

      await form$.validate()
      expect(form$.invalid).toBe(false)
    })
  })

  describe('Validation Methods', () => {
    it('should run rules and return validity from el$.validate()', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: {
            type: 'text',
            rules: 'required',
            default: 'test@example.com',
          },
        }),
      })

      const result = await email.validate()
      expect(result).toBe(true)
      expect(email.invalid).toBe(false)
    })

    it('should return false from el$.validate() when invalid', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
      })

      const result = await email.validate()
      expect(result).toBe(false)
      expect(email.invalid).toBe(true)
    })

    it('should reset validation state with el$.unvalidate()', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
      })

      await email.validate()
      expect(email.validated).toBe(true)
      expect(email.invalid).toBe(true)

      email.unvalidate()
      expect(email.validated).toBe(false)
      expect(email.invalid).toBe(false)
    })

    it('should mark as not validated with el$.invalidate()', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: {
            type: 'text',
            rules: 'required',
            default: 'test@example.com',
          },
        }),
      })

      await email.validate()
      expect(email.validated).toBe(true)

      email.invalidate()
      expect(email.validated).toBe(false)
    })

    it('should clear custom errors with el$.clearErrors()', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
        }),
      })

      email.messageBag.append('Custom error.', 'error')
      expect(email.errors).toContain('Custom error.')

      email.clearErrors()
      expect(email.errors).toHaveLength(0)
    })

    it('should clear custom messages with el$.clearMessages()', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
        }),
      })

      email.messageBag.append('A message.', 'message')
      expect(email.messages).toContain('A message.')

      email.clearMessages()
      expect(email.messages).toHaveLength(0)
    })

    it('should clear both errors and messages with el$.clearMessageBag()', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text' },
        }),
      })

      email.messageBag.append('An error.', 'error')
      email.messageBag.append('A message.', 'message')

      email.clearMessageBag()
      expect(email.errors).toHaveLength(0)
      expect(email.messages).toHaveLength(0)
    })

    it('should validate all elements with form$.validate()', async () => {
      const { form$, first, last } = createForm({
        schema: defineSchema({
          first: { type: 'text', rules: 'required' },
          last: { type: 'text', rules: 'required' },
        }),
      })

      await form$.validate()
      expect(first.invalid).toBe(true)
      expect(last.invalid).toBe(true)
      expect(form$.invalid).toBe(true)
    })

    it('should return true from form$.validate() when all valid', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          first: { type: 'text', rules: 'required', default: 'John' },
          last: { type: 'text', rules: 'required', default: 'Doe' },
        }),
      })

      const result = await form$.validate()
      expect(result).toBe(true)
    })
  })

  describe('Error Display', () => {
    it('should limit displayed errors with maxErrors', async () => {
      const { email } = createForm({
        schema: defineSchema({
          email: {
            type: 'text',
            rules: 'required|email|min:5',
            bail: false,
            maxErrors: 1,
          },
        }),
      })

      await email.validate()
      expect(email.errors.length).toBeGreaterThan(1)
      expect(email.displayErrors).toHaveLength(1)
    })

    it('should skip validation when nullable and value is empty', async () => {
      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text', rules: 'nullable|email' },
        }),
      })

      await name.validate()
      expect(name.invalid).toBe(false)

      name.update('not-an-email')
      await name.validate()
      expect(name.invalid).toBe(true)

      name.update('')
      await name.validate()
      expect(name.invalid).toBe(false)
    })
  })

  // Plain inputs can have children (e.g. addons). Their aggregate state
  // (invalid, pending, debouncing, validated, dirty, completed) must reflect
  // the state of those children in addition to the element's own validations.
  describe('Validation State (Children / Addons)', () => {
    describe('invalid', () => {
      it('should be invalid when a child addon rule fails', async () => {
        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
                rules: 'required',
              },
            },
          }),
        })

        expect(el.invalid).toBe(false)

        await cur.validate()
        await flushPromises()

        // The host has no rules of its own, but the failing addon makes it invalid.
        expect(cur.invalid).toBe(true)
        expect(el.invalid).toBe(true)
      })

      it('should stay valid when the child addon passes', async () => {
        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
                rules: 'required',
                default: 'USD',
              },
            },
          }),
        })

        await cur.validate()
        await flushPromises()

        expect(cur.invalid).toBe(false)
        expect(el.invalid).toBe(false)
      })

      it('should be invalid from the child even when its own rules pass', async () => {
        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              rules: 'required',
              default: 'filled',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
                rules: 'required',
              },
            },
          }),
        })

        await el.validate()
        await cur.validate()
        await flushPromises()

        // The host's own validation passes, but the addon fails.
        expect(el.invalid).toBe(true)
      })

      it('should clear invalid once the child becomes valid', async () => {
        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
                rules: 'required',
              },
            },
          }),
        })

        await cur.validate()
        await flushPromises()
        expect(el.invalid).toBe(true)

        cur.update('USD')
        await cur.validate()
        await flushPromises()

        expect(cur.invalid).toBe(false)
        expect(el.invalid).toBe(false)
      })
    })

    describe('validated', () => {
      it('should not be validated until the child is validated too', async () => {
        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              rules: 'required',
              default: 'filled',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
                rules: 'required',
                default: 'USD',
              },
            },
          }),
        })

        await el.validate()
        await flushPromises()

        // The host's own validation ran, but the addon has not been validated yet.
        expect(cur.validated).toBe(false)
        expect(el.validated).toBe(false)

        await cur.validate()
        await flushPromises()

        expect(cur.validated).toBe(true)
        expect(el.validated).toBe(true)
      })
    })

    describe('pending', () => {
      it('should be pending while the child runs an async rule', async () => {
        // Resolved manually below so the pending assertions can never race
        // a wall-clock timer (which made this test flaky under CI load).
        let resolveSlow!: (value: boolean) => void
        const slow = createRule(
          'slow',
          () =>
            new Promise<boolean>((resolve) => {
              resolveSlow = resolve
            })
        )

        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
                rules: [slow],
                default: 'USD',
              },
            },
          }),
        })

        const promise = cur.validate()
        await flushPromises()

        // The async rule on the addon keeps the host pending/busy.
        expect(cur.pending).toBe(true)
        expect(el.pending).toBe(true)
        expect(el.busy).toBe(true)

        resolveSlow(true)
        await promise
        await flushPromises()

        expect(cur.pending).toBe(false)
        expect(el.pending).toBe(false)
        expect(el.busy).toBe(false)
      })
    })

    describe('debouncing', () => {
      beforeEach(() => {
        vi.useFakeTimers()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('should be debouncing while the child rule debounces', async () => {
        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
                rules: 'required',
                debounce: 300,
                default: 'USD',
              },
            },
          }),
        })

        const promise = cur.validate()

        // The debounce window on the addon keeps the host debouncing/busy.
        expect(cur.debouncing).toBe(true)
        expect(el.debouncing).toBe(true)
        expect(el.busy).toBe(true)

        await vi.advanceTimersByTimeAsync(300)
        await promise

        expect(cur.debouncing).toBe(false)
        expect(el.debouncing).toBe(false)
        expect(el.busy).toBe(false)
      })
    })

    describe('dirty', () => {
      it('should be dirty when the child value changes', () => {
        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              default: 'unchanged',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
              },
            },
          }),
        })

        expect(el.dirty).toBe(false)

        // The host's own value is untouched; only the addon changes.
        cur.update('EUR')

        expect(cur.dirty).toBe(true)
        expect(el.dirty).toBe(true)
      })

      it('should return to clean when the child reverts', () => {
        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
                default: 'USD',
              },
            },
          }),
        })

        expect(el.dirty).toBe(false)

        cur.update('EUR')
        expect(el.dirty).toBe(true)

        cur.update('USD')
        expect(el.dirty).toBe(false)
      })
    })

    describe('completed', () => {
      it('should be completed when the child also has no rules', () => {
        const { el } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
              },
            },
          }),
        })

        expect(el.completed).toBe(true)
      })

      it('should not be completed until a ruled child validates', async () => {
        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
                rules: 'required',
                default: 'USD',
              },
            },
          }),
        })

        // The addon has a rule that has not run yet, so the host is not completed.
        expect(el.completed).toBe(false)

        await cur.validate()
        await flushPromises()

        expect(el.completed).toBe(true)
      })

      it('should not be completed when the child is invalid', async () => {
        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
                rules: 'required',
              },
            },
          }),
        })

        await cur.validate()
        await flushPromises()

        expect(cur.invalid).toBe(true)
        expect(el.completed).toBe(false)
      })
    })

    describe('messages', () => {
      it('should surface custom messages from a hoisting child', () => {
        const { el, cur } = createForm({
          schema: defineSchema({
            el: {
              type: 'text',
              addonBefore: {
                type: 'select',
                name: 'cur',
                items: ['USD', 'EUR'],
              },
            },
          }),
        })

        cur.messageBag.append('Addon message.', 'message')

        expect(cur.hoisted).toBe(true)
        expect(el.messages).toContain('Addon message.')
      })
    })
  })
})
