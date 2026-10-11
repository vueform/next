import {
  useModel,
  defineComputedSchema,
  defineSchema,
  getValidationModule,
  type StandardSchemaV1,
} from '@vueform/core'
import { defineComponent } from 'vue'
import { z } from 'zod'

import { createForm, flushPromises, mountApp } from '../../helpers'

/**
 * Builds a spec-compliant Standard Schema V1 mock around a validate function.
 */
const standardSchema = <I = any, O = I>(
  validate: (
    value: any
  ) => StandardSchemaV1.Result<O> | Promise<StandardSchemaV1.Result<O>>
): StandardSchemaV1<I, O> => ({
  '~standard': { version: 1, vendor: 'test', validate },
})

/**
 * Element-level mock: string values shorter than `min` fail with `message`.
 */
const minLength = (min: number, message = 'Too short') =>
  standardSchema((value) =>
    typeof value === 'string' && value.length >= min
      ? { value }
      : { issues: [{ message }] }
  )

/**
 * Form-level mock: `password` and `confirm` must match, reported at `confirm`.
 */
const passwordsMatch = standardSchema((value: any) =>
  value?.password === value?.confirm
    ? { value }
    : {
        issues: [{ message: 'Passwords must match', path: ['confirm'] }],
      }
)

/**
 * Form-level mock that always fails with a pathless (root-level) issue.
 */
const alwaysRootIssue = standardSchema(() => ({
  issues: [{ message: 'Form is invalid' }],
}))

/**
 * Form-level mock that always passes.
 */
const alwaysValid = standardSchema((value) => ({ value }))

/**
 * Runs a factory inside a mounted component's setup (so `useConfig()` resolves)
 * and returns its result.
 */
const inSetup = <T>(fn: () => T): T => {
  let result!: T
  mountApp(
    defineComponent({
      template: '<div />',
      setup() {
        result = fn()
        return {}
      },
    }) as any
  )
  return result
}

describe('Standard Schema', () => {
  describe('Element rules', () => {
    it('should accept a Standard Schema as the whole rules prop', async () => {
      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text', rules: minLength(3), default: 'ab' },
        }),
      })

      await name.validate()
      expect(name.invalid).toBe(true)
      expect(name.errors).toContain('Too short')
    })

    it('should apply a Standard Schema only when $if is met', async () => {
      const { type, name } = createForm({
        schema: defineSchema({
          type: { type: 'text', default: '' },
          name: {
            type: 'text',
            rules: { rules: minLength(3), $if: [['type', '==', 'strict']] },
            default: 'ab',
          },
        }),
      })

      await name.validate()
      expect(name.invalid).toBe(false)

      type.update('strict')
      await name.validate()
      expect(name.invalid).toBe(true)
      expect(name.errors).toContain('Too short')

      name.update('abcd')
      await name.validate()
      expect(name.invalid).toBe(false)
    })

    it('should apply a Standard Schema $if per language', async () => {
      const { type, title, form$ } = createForm(
        {
          schema: defineSchema({
            type: { type: 'text', default: '' },
            title: {
              type: 'text',
              translate: true,
              default: { en: 'ab', de: 'abcd' },
              rules: {
                en: {
                  rules: minLength(3, 'Too short'),
                  $if: [['type', '==', 'strict']],
                },
                de: {
                  rules: minLength(5, 'Too short'),
                  $if: [['type', '==', 'strict']],
                },
              },
            },
          }),
        },
        { languages: { en: 'English', de: 'German' } }
      )

      await title.validate()
      expect(title.invalid).toBe(false)

      type.update('strict')
      await title.validate()
      expect(title.invalid).toBe(true)
      expect(form$.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            language: 'en',
            rule: 'standard_schema',
            message: 'Too short',
          }),
          expect.objectContaining({
            language: 'de',
            rule: 'standard_schema',
            message: 'Too short',
          }),
        ])
      )

      title.update({ en: 'abc', de: 'abcde' })
      await title.validate()
      expect(title.invalid).toBe(false)
    })

    it('should accept a Standard Schema as an array member alongside string rules', async () => {
      const { name } = createForm({
        schema: defineSchema({
          name: {
            type: 'text',
            rules: ['required', minLength(3)],
            default: 'ab',
          },
        }),
      })

      await name.validate()
      expect(name.invalid).toBe(true)
      expect(name.errors).toContain('Too short')
    })

    it('should pass when the value satisfies the Standard Schema', async () => {
      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text', rules: minLength(3), default: 'abcd' },
        }),
      })

      await name.validate()
      expect(name.invalid).toBe(false)
      expect(name.errors).toEqual([])
    })

    it('should support async Standard Schemas', async () => {
      const asyncMin = standardSchema(async (value) =>
        typeof value === 'string' && value.length >= 3
          ? { value }
          : { issues: [{ message: 'Too short async' }] }
      )

      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text', rules: asyncMin, default: 'ab' },
        }),
      })

      await name.validate()
      expect(name.invalid).toBe(true)
      expect(name.errors).toContain('Too short async')
    })

    it('should skip empty values when combined with nullable rules', async () => {
      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text', rules: ['nullable', minLength(3)] },
        }),
      })

      await name.validate()
      expect(name.invalid).toBe(false)
    })
  })

  describe('Form-level validationSchema prop', () => {
    it('should map issues to element validation state by path', async () => {
      const { form$, confirm } = createForm({
        schema: defineSchema({
          password: { type: 'text', default: 'secret' },
          confirm: { type: 'text', default: 'different' },
        }),
        validationSchema: passwordsMatch,
      })

      const valid = await form$.validate()

      expect(valid).toBe(false)
      expect(form$.invalid).toBe(true)
      expect(confirm.invalid).toBe(true)
      expect(confirm.errors).toContain('Passwords must match')
      expect(form$.errors.confirm).toContain('Passwords must match')

      // Message bags stay user-space — issues flow through validation state.
      expect(confirm.messageBag.errors.value).toEqual([])
      expect(form$.messageBag.errors.value).toEqual([])
    })

    it('should put pathless issues on the form root', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          name: { type: 'text' },
        }),
        validationSchema: alwaysRootIssue,
      })

      const valid = await form$.validate()

      expect(valid).toBe(false)
      expect(form$.invalid).toBe(true)
      expect(form$.hasError).toBe(true)
      expect(form$.errors['']).toContain('Form is invalid')
      expect(form$.messageBag.errors.value).toEqual([])
    })

    it('should clear cross-field issues when another element makes the model valid', async () => {
      const { form$, confirm, password } = createForm({
        schema: defineSchema({
          password: { type: 'text', default: 'secret' },
          confirm: { type: 'text', default: 'different' },
        }),
        validationSchema: passwordsMatch,
      })

      await form$.validate()
      expect(form$.invalid).toBe(true)

      // Changing `password` doesn't re-run `confirm`'s own validation — the
      // schema rule revalidates through its issue-bucket watcher, exactly like
      // a `same:password` rule does through its param watcher.
      password.update('different')
      await flushPromises()

      expect(form$.invalid).toBe(false)
      expect(confirm.errors).toEqual([])
    })

    it('should clear issues on the next validation after the element itself changes', async () => {
      const { form$, confirm } = createForm({
        schema: defineSchema({
          password: { type: 'text', default: 'secret' },
          confirm: { type: 'text', default: 'different' },
        }),
        validationSchema: passwordsMatch,
      })

      await form$.validate()
      expect(form$.invalid).toBe(true)

      // A programmatic self-update invalidates the element's own validators
      // (like any regular rule), so the error clears on the next validation.
      confirm.update('secret')
      await form$.validate()

      expect(form$.invalid).toBe(false)
      expect(confirm.errors).toEqual([])
    })

    it('should not show issues before the first validation', async () => {
      const { form$, confirm } = createForm({
        schema: defineSchema({
          password: { type: 'text', default: 'secret' },
          confirm: { type: 'text', default: 'different' },
        }),
        validationSchema: passwordsMatch,
      })

      expect(form$.invalid).toBe(false)
      expect(confirm.errors).toEqual([])
    })

    it('should replace stale issues on revalidation', async () => {
      const { form$, confirm } = createForm({
        schema: defineSchema({
          password: { type: 'text', default: 'secret' },
          confirm: { type: 'text', default: 'different' },
        }),
        validationSchema: passwordsMatch,
      })

      await form$.validate()
      expect(confirm.errors).toEqual(['Passwords must match'])

      await form$.validate()
      expect(confirm.errors).toEqual(['Passwords must match'])
    })

    it('should prevent submission while invalid', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          password: { type: 'text', default: 'secret' },
          confirm: { type: 'text', default: 'different' },
        }),
        validationSchema: passwordsMatch,
      })

      const result = await form$.submit()

      expect(result?.type).toBe('invalid')
    })
  })

  describe('defineSchema second argument', () => {
    it('should pick up the attached Standard Schema automatically', async () => {
      const schema = defineSchema(
        {
          password: { type: 'text', default: 'secret' },
          confirm: { type: 'text', default: 'different' },
        },
        passwordsMatch
      )

      const { form$, confirm } = createForm({ schema })

      const valid = await form$.validate()

      expect(valid).toBe(false)
      expect(confirm.errors).toContain('Passwords must match')
    })

    it('should let the validationSchema prop override the attached schema', async () => {
      const schema = defineSchema(
        {
          name: { type: 'text' },
        },
        alwaysRootIssue
      )

      const { form$ } = createForm({ schema, validationSchema: alwaysValid })

      const valid = await form$.validate()

      expect(valid).toBe(true)
      expect(form$.invalid).toBe(false)
    })
  })

  describe('defineComputedSchema second argument', () => {
    it('should pick up the Standard Schema attached to the computed ref', async () => {
      const schema = defineComputedSchema(
        () => ({
          password: { type: 'text', default: 'secret' },
          confirm: { type: 'text', default: 'different' },
        }),
        passwordsMatch
      )

      const { form$, confirm } = createForm({ schema })

      const valid = await form$.validate()

      expect(valid).toBe(false)
      expect(confirm.errors).toContain('Passwords must match')
    })
  })

  describe('useModel validationSchema option', () => {
    it('should run the Standard Schema on headless validate()', async () => {
      const model$ = inSetup(() =>
        useModel(
          {
            password: { type: 'text', default: 'secret' },
            confirm: { type: 'text', default: 'different' },
          },
          undefined,
          passwordsMatch
        )
      )

      const valid = await model$.validate()

      expect(valid).toBe(false)
      expect(model$.invalid).toBe(true)
      expect(model$.errors).toContain('Passwords must match')
    })

    it('should pick up a Standard Schema attached via defineSchema', async () => {
      const model$ = inSetup(() =>
        useModel(
          defineSchema(
            {
              password: { type: 'text', default: 'secret' },
              confirm: { type: 'text', default: 'different' },
            },
            passwordsMatch
          )
        )
      )

      const valid = await model$.validate()

      expect(valid).toBe(false)
      expect(model$.errors).toContain('Passwords must match')
    })

    it('should be picked up by a form adopting the model instance', async () => {
      const model$ = inSetup(() =>
        useModel(
          {
            password: { type: 'text', default: 'secret' },
            confirm: { type: 'text', default: 'different' },
          },
          undefined,
          passwordsMatch
        )
      )

      const { form$, confirm } = createForm({
        schema: {
          password: { type: 'text' },
          confirm: { type: 'text' },
        },
        modelValue: model$,
      })

      const valid = await form$.validate()

      expect(valid).toBe(false)
      expect(confirm.errors).toContain('Passwords must match')
    })

    it('should win over a schema attached via defineSchema when adopted', async () => {
      const attached = standardSchema(() => ({
        issues: [{ message: 'From attached', path: ['confirm'] }],
      }))
      const explicit = standardSchema(() => ({
        issues: [{ message: 'From instance', path: ['confirm'] }],
      }))

      const schema = defineSchema(
        {
          password: { type: 'text', default: 'secret' },
          confirm: { type: 'text', default: 'different' },
        },
        attached
      )

      const model$ = inSetup(() => useModel(schema, undefined, explicit))

      const { form$, confirm } = createForm({
        schema,
        modelValue: model$,
      })

      const valid = await form$.validate()

      expect(valid).toBe(false)
      expect(confirm.errors).toContain('From instance')
      expect(confirm.errors).not.toContain('From attached')
    })

    it('should surface a pathless issue exactly once on headless validate()', async () => {
      const model$ = inSetup(() =>
        useModel({ name: { type: 'text' } }, undefined, alwaysRootIssue)
      )

      await model$.validate()

      expect(
        model$.errors.filter((e: string) => e === 'Form is invalid').length
      ).toBe(1)
    })

    // The headless engine registers no path-`''` owner (root-bucket issues go
    // through the validator's rollup fallback), so the mounted form root's own
    // owner doesn't duplicate them after adoption.
    it('should not duplicate pathless issues when a form adopts the instance', async () => {
      const model$ = inSetup(() =>
        useModel({ name: { type: 'text' } }, undefined, alwaysRootIssue)
      )

      const { form$ } = createForm({
        schema: { name: { type: 'text' } },
        modelValue: model$,
      })

      await form$.validate()
      await flushPromises()

      expect(
        form$.issues.filter((i: any) => i.message === 'Form is invalid').length
      ).toBe(1)
      expect(
        model$.errors.filter((e: string) => e === 'Form is invalid').length
      ).toBe(1)
    })

    it('should not duplicate path-targeted issues when a form adopts the instance', async () => {
      const model$ = inSetup(() =>
        useModel(
          {
            password: { type: 'text', default: 'secret' },
            confirm: { type: 'text', default: 'different' },
          },
          undefined,
          passwordsMatch
        )
      )

      const { form$ } = createForm({
        schema: {
          password: { type: 'text' },
          confirm: { type: 'text' },
        },
        modelValue: model$,
      })

      await form$.validate()
      await flushPromises()

      expect(
        form$.issues.filter((i: any) => i.message === 'Passwords must match')
          .length
      ).toBe(1)
    })

    // The engine's per-node owners go dormant while a mounted element claims
    // their node, so they never duplicate the mounted owners in the rollups.
    it('should not duplicate issues when the instance was validated headlessly before a form adopts it', async () => {
      const model$ = inSetup(() =>
        useModel(
          {
            password: { type: 'text', default: 'secret' },
            confirm: { type: 'text', default: 'different' },
          },
          undefined,
          passwordsMatch
        )
      )

      // Headless validation first — the engine creates its own node owners.
      await model$.validate()

      const { form$ } = createForm({
        schema: {
          password: { type: 'text' },
          confirm: { type: 'text' },
        },
        modelValue: model$,
      })

      await form$.validate()
      await flushPromises()

      expect(
        form$.issues.filter((i: any) => i.message === 'Passwords must match')
          .length
      ).toBe(1)
    })

    it('should not duplicate issues when the instance validates while a form is mounted', async () => {
      const model$ = inSetup(() =>
        useModel(
          {
            password: { type: 'text', default: 'secret' },
            confirm: { type: 'text', default: 'different' },
          },
          undefined,
          passwordsMatch
        )
      )

      const { form$ } = createForm({
        schema: {
          password: { type: 'text' },
          confirm: { type: 'text' },
        },
        modelValue: model$,
      })

      // Validating through the instance while mounted must not create a
      // second set of active owners for the same paths.
      await model$.validate()
      await flushPromises()

      expect(
        model$.errors.filter((e: string) => e === 'Passwords must match').length
      ).toBe(1)
      expect(
        form$.issues.filter((i: any) => i.message === 'Passwords must match')
          .length
      ).toBe(1)
    })
  })

  describe('Zod integration', () => {
    it('should run a Zod schema as an element rule', async () => {
      const { name } = createForm({
        schema: defineSchema({
          name: {
            type: 'text',
            rules: z.string().min(3, 'Too short zod'),
            default: 'ab',
          },
        }),
      })

      await name.validate()
      expect(name.invalid).toBe(true)
      expect(name.errors).toContain('Too short zod')
    })

    it('should mix a Zod schema with string rules in an array', async () => {
      const { name } = createForm({
        schema: defineSchema({
          name: {
            type: 'text',
            rules: ['required', z.string().email('Invalid email zod')],
            default: 'not-an-email',
          },
        }),
      })

      await name.validate()
      expect(name.invalid).toBe(true)
      expect(name.errors).toContain('Invalid email zod')
    })

    it('should let nullable Zod schemas pass empty elements', async () => {
      const { name } = createForm({
        schema: defineSchema({
          name: { type: 'text', rules: z.string().min(3).nullable() },
        }),
      })

      await name.validate()
      expect(name.invalid).toBe(false)
    })

    it('should map Zod refine issues to elements via defineSchema', async () => {
      const schema = defineSchema(
        {
          password: { type: 'text', default: 'secret' },
          confirm: { type: 'text', default: 'different' },
        },
        z
          .object({
            password: z.string(),
            confirm: z.string(),
          })
          .refine((data) => data.password === data.confirm, {
            message: 'Passwords must match zod',
            path: ['confirm'],
          })
      )

      const { form$, confirm, password } = createForm({ schema })

      const valid = await form$.validate()

      expect(valid).toBe(false)
      expect(confirm.errors).toContain('Passwords must match zod')

      password.update('different')
      await flushPromises()

      expect(form$.invalid).toBe(false)
      expect(confirm.errors).toEqual([])
    })

    it('should run a Zod schema on headless useModel validate()', async () => {
      const model$ = inSetup(() =>
        useModel(
          {
            email: { type: 'text', default: 'not-an-email' },
          },
          undefined,
          z.object({
            email: z.string().email('Invalid email zod'),
          })
        )
      )

      const valid = await model$.validate()

      expect(valid).toBe(false)
      expect(model$.invalid).toBe(true)
      expect(model$.errors).toContain('Invalid email zod')
    })
  })

  describe('toStandardSchema', () => {
    it('should export the live form as a Standard Schema', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required|email' },
        }),
      })

      const schema = form$.toStandardSchema()
      expect(schema['~standard'].vendor).toBe('vueform')

      const invalid = await schema['~standard'].validate({ email: '' })
      expect(invalid).toMatchObject({
        issues: expect.arrayContaining([
          expect.objectContaining({
            path: ['email'],
          }),
        ]),
      })

      const valid = await schema['~standard'].validate({
        email: 'user@example.com',
      })
      expect(valid).toEqual({ value: { email: 'user@example.com' } })
    })

    it('should accept a form$ via the toStandardSchema helper', async () => {
      const { form$, vueform } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
      })

      const schema = getValidationModule(vueform).toStandardSchema(form$)
      const result = await schema!['~standard'].validate({ email: '' })
      expect(result).toHaveProperty('issues')
    })

    it('should merge form-level schema issues into the export', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          password: { type: 'text', default: 'a' },
          confirm: { type: 'text', default: 'b' },
        }),
        validationSchema: passwordsMatch,
      })

      const schema = form$.toStandardSchema()
      const result = await schema['~standard'].validate({
        password: 'a',
        confirm: 'b',
      })

      expect(result).toMatchObject({
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: 'Passwords must match',
            path: ['confirm'],
          }),
        ]),
      })
    })

    it('should resolve rule params against the exported value', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          username: { type: 'text', rules: 'min:5' },
        }),
      })

      const schema = form$.toStandardSchema()

      const invalid = await schema['~standard'].validate({ username: 'abc' })
      expect(invalid).toMatchObject({
        issues: expect.arrayContaining([
          expect.objectContaining({ path: ['username'] }),
        ]),
      })

      const valid = await schema['~standard'].validate({
        username: 'abcdef',
      })
      expect(valid).toEqual({ value: { username: 'abcdef' } })
    })

    it('should resolve cross-field rules against the exported value', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          password: { type: 'text', rules: 'required' },
          password_confirmation: { type: 'text', rules: 'same:password' },
        }),
      })

      const schema = form$.toStandardSchema()

      // The comparison must read `password` from the exported value, not the
      // live (empty) form model.
      const invalid = await schema['~standard'].validate({
        password: 'secret',
        password_confirmation: 'different',
      })
      expect(invalid).toMatchObject({
        issues: expect.arrayContaining([
          expect.objectContaining({ path: ['password_confirmation'] }),
        ]),
      })

      const valid = await schema['~standard'].validate({
        password: 'secret',
        password_confirmation: 'secret',
      })
      expect(valid).toEqual({
        value: { password: 'secret', password_confirmation: 'secret' },
      })
    })

    it('should skip conditionally inactive rules based on the exported value', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          type: { type: 'text' },
          company: {
            type: 'text',
            rules: [{ rules: 'required', $if: [['type', '==', 'business']] }],
          },
        }),
      })

      const schema = form$.toStandardSchema()

      const inactive = await schema['~standard'].validate({
        type: 'personal',
        company: '',
      })
      expect(inactive).toEqual({
        value: { type: 'personal', company: '' },
      })

      const active = await schema['~standard'].validate({
        type: 'business',
        company: '',
      })
      expect(active).toMatchObject({
        issues: expect.arrayContaining([
          expect.objectContaining({ path: ['company'] }),
        ]),
      })
    })
  })
})
