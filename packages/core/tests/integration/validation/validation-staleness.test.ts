import {
  useModel,
  defineSchema,
  createRule,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
  type StandardSchemaV1,
} from '@vueform/core'
import { defineComponent } from 'vue'

import { createForm, flushPromises, mountApp } from '../../helpers'

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

function mockAdapter(): {
  adapter: HttpAdapter
  calls: HttpRequestConfig[]
} {
  const calls: HttpRequestConfig[] = []

  const adapter: HttpAdapter = async <T = any>(
    config: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    calls.push(config)
    return {
      data: null as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }
  }

  return { adapter, calls }
}

const standardSchema = (
  validate: (value: unknown) => StandardSchemaV1.Result<unknown>
): StandardSchemaV1 => ({
  '~standard': { version: 1, vendor: 'test', validate },
})

describe('Validation Staleness', () => {
  describe('Store-driven validated staleness', () => {
    it('should mark an element unvalidated after an external form update', async () => {
      const { form$, email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required|email' },
        }),
      })

      email.update('valid@example.com')
      await email.validate()
      expect(email.validated).toBe(true)
      expect(email.invalid).toBe(false)

      form$.update({ email: 'changed' })
      await flushPromises()

      expect(email.validated).toBe(false)
    })

    it('should mark an element validated again once the stale value is re-validated', async () => {
      const { form$, email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required|email' },
        }),
      })

      email.update('valid@example.com')
      await email.validate()

      form$.update({ email: 'not-an-email' })
      await flushPromises()
      expect(email.validated).toBe(false)

      await email.validate()
      expect(email.validated).toBe(true)
      expect(email.invalid).toBe(true)
    })

    it('should stay unvalidated after the value returns to the validated one until it re-runs', async () => {
      const { form$, email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required|email' },
        }),
      })

      email.update('valid@example.com')
      await email.validate()

      form$.update({ email: 'changed' })
      await flushPromises()
      expect(email.validated).toBe(false)

      form$.update({ email: 'valid@example.com' })
      await flushPromises()
      expect(email.validated).toBe(false)

      await email.validate()
      expect(email.validated).toBe(true)
      expect(email.invalid).toBe(false)
    })

    it('should mark a mounted element unvalidated when an attached model is written externally', async () => {
      const schema = defineSchema({
        email: { type: 'text', rules: 'required|email' },
      })

      const model$ = inSetup(() =>
        useModel({ schema }, { email: 'valid@example.com' })
      ) as any

      const { email } = createForm({ schema, modelValue: model$ })
      await flushPromises()

      await email.validate()
      expect(email.validated).toBe(true)
      expect(email.invalid).toBe(false)

      model$.set('email', 'nope')
      await flushPromises()

      expect(email.validated).toBe(false)

      await model$.validate()
      expect(model$.invalid).toBe(true)
    })

    it('should mark the form-level validation schema stale on external writes', async () => {
      const passwordsMatch = standardSchema((value: any) =>
        value?.password === value?.confirm
          ? { value }
          : { issues: [{ message: 'Passwords must match', path: ['confirm'] }] }
      )

      const { form$ } = createForm({
        schema: defineSchema({
          password: { type: 'text' },
          confirm: { type: 'text' },
        }),
        validationSchema: passwordsMatch,
      })

      await form$.validate()
      expect(form$.validated).toBe(true)
      expect(form$.invalid).toBe(false)

      form$.update({ password: 'secret', confirm: 'other' })
      await flushPromises()

      await form$.validate()
      expect(form$.invalid).toBe(true)
    })
  })

  describe('Cross-field revalidation on external writes', () => {
    it('should revalidate a dependent element when its dependency changes via form update', async () => {
      const matches = createRule(
        'matches_other',
        (value, { form$ }) => value === form$?.find('other')?.value,
        { deps: ['other'], message: 'Must match other' }
      )

      const { form$, field } = createForm({
        schema: defineSchema({
          other: { type: 'text', default: 'left' },
          field: { type: 'text', rules: [matches], default: 'left' },
        }),
      })

      await field.validate()
      expect(field.invalid).toBe(false)

      form$.update({ other: 'right' })
      await flushPromises()

      expect(field.invalid).toBe(true)
    })
  })

  describe('Submit validation floor', () => {
    it('should validate a never-validated form on submit regardless of validateOn', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            email: { type: 'text', rules: 'required' },
          }),
          validateOn: ['blur'],
          endpoint: '/submit',
        },
        { $http: { adapter } }
      )

      const result = await form$.submit()

      expect(result?.type).toBe('invalid')
      expect((result as any).source).toBe('client')
      expect(calls.length).toBe(0)
    })

    it('should not re-run rules that already validated the current value', async () => {
      const { adapter, calls } = mockAdapter()
      const check = vi.fn((value: any) => !!value)
      const filled = createRule('filled_spy', check, { message: 'Required' })

      const { form$, email } = createForm(
        {
          schema: defineSchema({
            email: { type: 'text', rules: [filled] },
          }),
          validateOn: ['blur'],
          endpoint: '/submit',
        },
        { $http: { adapter } }
      )

      email.update('hello')
      await email.validate()
      expect(check).toHaveBeenCalledTimes(1)

      const result = await form$.submit()

      expect(check).toHaveBeenCalledTimes(1)
      expect(result?.type).toBe('success')
      expect(calls.length).toBe(1)
    })

    it('should re-run currently-invalid elements on submit for a fresh chance', async () => {
      const { adapter, calls } = mockAdapter()
      const check = vi.fn((value: any) => !!value)
      const filled = createRule('filled_spy2', check, { message: 'Required' })

      const { form$, email } = createForm(
        {
          schema: defineSchema({
            email: { type: 'text', rules: [filled] },
          }),
          validateOn: ['blur'],
          endpoint: '/submit',
        },
        { $http: { adapter } }
      )

      await email.validate()
      expect(email.invalid).toBe(true)
      expect(check).toHaveBeenCalledTimes(1)

      const result = await form$.submit()

      // The value didn't change, but invalid elements re-run on every attempt
      // (async server checks may pass now); the request still doesn't go out.
      expect(check).toHaveBeenCalledTimes(2)
      expect(result?.type).toBe('invalid')
      expect(calls.length).toBe(0)
    })

    it('should re-validate an element whose value changed since it validated', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$, email } = createForm(
        {
          schema: defineSchema({
            email: { type: 'text', rules: 'required' },
          }),
          validateOn: ['blur'],
          endpoint: '/submit',
        },
        { $http: { adapter } }
      )

      email.update('hello')
      await email.validate()
      expect(email.invalid).toBe(false)

      form$.update({ email: '' })
      await flushPromises()

      const result = await form$.submit()

      expect(result?.type).toBe('invalid')
      expect(calls.length).toBe(0)
    })

    it('should force full re-validation when the submit trigger is explicit', async () => {
      const { adapter, calls } = mockAdapter()
      const check = vi.fn((value: any) => !!value)
      const filled = createRule('filled_spy3', check, { message: 'Required' })

      const { form$, email } = createForm(
        {
          schema: defineSchema({
            email: { type: 'text', rules: [filled] },
          }),
          validateOn: ['blur', 'submit'],
          endpoint: '/submit',
        },
        { $http: { adapter } }
      )

      email.update('hello')
      await email.validate()
      expect(email.invalid).toBe(false)
      expect(check).toHaveBeenCalledTimes(1)

      const result = await form$.submit()

      // Explicit 'submit' means force: even the validated-and-valid element
      // re-runs, prior results ignored.
      expect(check).toHaveBeenCalledTimes(2)
      expect(result?.type).toBe('success')
      expect(calls.length).toBe(1)
    })

    it('should skip validation entirely when disableValidation is called', async () => {
      const { adapter, calls } = mockAdapter()
      const check = vi.fn((value: any) => !!value)
      const filled = createRule('filled_spy4', check, { message: 'Required' })

      const { form$ } = createForm(
        {
          schema: defineSchema({
            email: { type: 'text', rules: [filled] },
          }),
          endpoint: '/submit',
        },
        { $http: { adapter } }
      )

      form$.disableValidation()

      const result = await form$.submit()

      expect(check).not.toHaveBeenCalled()
      expect(result?.type).toBe('success')
      expect(calls.length).toBe(1)
    })
  })

  describe('Synchronous validation fast path', () => {
    it('should apply results of synchronous rules in the same tick', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: {
            type: 'text',
            rules: 'required|email|min:5',
            default: 'valid@example.com',
          },
        }),
      })

      const promise = email.validate()

      // No await: all three rules are synchronous, so their results must have
      // been applied before the microtask queue runs.
      expect(email.validated).toBe(true)
      expect(email.invalid).toBe(false)

      return promise
    })

    it('should apply a failing synchronous rule in the same tick', () => {
      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: 'required' },
        }),
      })

      const promise = email.validate()

      expect(email.invalid).toBe(true)
      expect(email.errors.length).toBeGreaterThan(0)

      return promise
    })

    it('should keep async rules asynchronous', async () => {
      const asyncRule = createRule(
        'async_check',
        async (value: any) => !!value,
        { message: 'Required' }
      )

      const { email } = createForm({
        schema: defineSchema({
          email: { type: 'text', rules: [asyncRule] },
        }),
      })

      const promise = email.validate()

      expect(email.validated).toBe(false)
      expect(email.pending).toBe(true)

      await promise
      expect(email.validated).toBe(true)
      expect(email.invalid).toBe(true)
    })
  })
})
