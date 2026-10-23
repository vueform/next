# Testing

A Vueform form is a Vue component, so the established Vue testing stack applies — there's no Vueform-specific framework to learn. This chapter shows the patterns that work best in practice: mounting a form with the Vueform plugin installed, driving it through its public context, and asserting on the data, the validation state, and the submission result.

The examples use [Vitest](https://vitest.dev/) and [Vue Test Utils](https://test-utils.vuejs.org/), which is the recommended combination. The same patterns transfer to Jest or any other test runner that can drive a Vue component.

## Setup

Install the test runner, the Vue testing utility, and a DOM environment:

::: code-group

```bash [npm]
npm install -D vitest @vue/test-utils @vitejs/plugin-vue happy-dom
```

```bash [pnpm]
pnpm add -D vitest @vue/test-utils @vitejs/plugin-vue happy-dom
```

:::

Point Vitest at `happy-dom` (or `jsdom`) so Vueform's render output has a DOM to mount into:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
  },
})
```

## Mounting a Form

The simplest way to render a Vueform form in a test is to mount `!VfForm` directly with the schema as a prop and install `createVueform` as a global plugin:

```ts
import { mount } from '@vue/test-utils'
import { createVueform } from '@vueform/ui/origin'
import { VfForm } from '@vueform/ui/components'
import { defineSchema } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text' },
  email: { type: 'text', rules: ['required', 'email'] },
  save: { type: 'button', text: 'Save', action: 'submit' },
})

const wrapper = mount(VfForm, {
  props: { schema },
  global: {
    plugins: [createVueform()],
  },
})

const form$ = wrapper.vm
```

`wrapper.vm` is the form's [Context](/guide/context) — the same object you'd get from a `ref` in application code. Every assertion in the rest of this chapter is made through it.

For repeated use, wrap this in a helper:

```ts
import { mount } from '@vue/test-utils'
import { createVueform } from '@vueform/ui/origin'
import { VfForm } from '@vueform/ui/components'
import type { FormSchema } from '@vueform/ui'

export function mountForm(
  schema: FormSchema,
  model?: Record<string, any>,
  props?: Record<string, any>
) {
  const wrapper = mount(VfForm, {
    props: { schema, modelValue: model, ...props },
    global: {
      plugins: [createVueform()],
    },
  })

  return { wrapper, form$: wrapper.vm }
}
```

## Asserting on the Model

The form's current values live on `form$.model`. Read it directly, and use `form$.find()` to drive individual elements:

```ts
test('updates the model when an element changes', async () => {
  const { form$ } = mountForm(schema, { name: 'John' })

  expect(form$.model.name).toBe('John')

  form$.find('name').update('Jane')

  expect(form$.model.name).toBe('Jane')
})
```

For DOM-driven changes, dispatch an input event and let Vueform's two-way binding do the rest:

```ts
test('updates the model when the user types', async () => {
  const { wrapper, form$ } = mountForm(schema)

  const input = wrapper.find('input[name="name"]')
  await input.setValue('Jane')

  expect(form$.model.name).toBe('Jane')
})
```

## Asserting on Validation

`form$.validate()` validates every element and resolves with `true` when everything passed. Afterwards `form$.invalid` reflects the final state, and `form$.errors` holds the error messages keyed by element path:

```ts
test('reports the email rule when the value is invalid', async () => {
  const { form$ } = mountForm(schema, { email: 'not-an-email' })

  const valid = await form$.validate()

  expect(valid).toBe(false)
  expect(form$.invalid).toBe(true)
  expect(form$.errors.email[0]).toContain('valid email address')
})
```

Per-element checks work the same way through the element context, where `errors` is a plain array of the element's own messages:

```ts
test('exposes errors on the element context', async () => {
  const { form$ } = mountForm(schema, { email: '' })
  const email$ = form$.find('email')

  await email$.validate()

  expect(email$.invalid).toBe(true)
  expect(email$.errors[0]).toMatch(/required/i)
})
```

Elements that already validated without errors against their current value are skipped on subsequent `validate()` calls. Pass `validate({ force: true })` to re-run everything regardless — useful for rules whose outcome can change without the value changing, like async server checks.

When using async rules, `form$.busy` is `true` while any element is debouncing or awaiting an async check — await `validate()` and that flag resolves to `false` again before your assertion runs.

## Asserting on Submission

`form$.submit()` runs the full submission lifecycle and resolves with a discriminated [`SubmitResult`](/guide/submit#submit-result). Branch on `result.type` to assert the outcome.

A failed client-side validation short-circuits before any request is made, so testing the `invalid` branch needs no endpoint and no network mocking:

```ts
test('short-circuits with an invalid result when validation fails', async () => {
  const { form$ } = mountForm(schema, { email: 'broken' })

  const result = await form$.submit()

  expect(result?.type).toBe('invalid')

  if (result?.type === 'invalid') {
    expect(result.errors.email).toBeDefined()
  }
})
```

A `success` result only exists when a request was actually made — through the `endpoint` prop or a `@submit` handler returning a response. A valid form with no endpoint configured resolves with `undefined` after validating. So the success-path test gives the form an endpoint and swaps the HTTP adapter for a stub (covered in depth [below](#mocking-http)):

```ts
import type { HttpAdapter } from '@vueform/ui'

const mockAdapter: HttpAdapter = async (config) => ({
  data: { ok: true },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

test('submits the form when the data is valid', async () => {
  const wrapper = mount(VfForm, {
    props: {
      schema,
      modelValue: { name: 'Jane', email: 'jane@example.com' },
      endpoint: '/api/subscribe',
    },
    global: {
      plugins: [createVueform({ $http: { adapter: mockAdapter } })],
    },
  })

  const result = await wrapper.vm.submit()

  expect(result?.type).toBe('success')
  expect(result?.data).toEqual({ ok: true })
})
```

The submit button can be exercised through the DOM too — find it and trigger a click. The form runs the same lifecycle either way, so assertions on `form$.submitting`, `form$.invalid`, or the resolved data are identical.

## Mocking `$http`

When a test should not hit the network — for example a form whose submission posts to an API, or a [`VfSelect`](/components/VfSelect) that loads options — replace the **adapter** via the `$http` config. The adapter is the low-level function that performs the actual fetch; all higher-level methods (`get`, `post`, etc.), interceptors, and error classification remain intact:

```ts
import { mount } from '@vue/test-utils'
import { createVueform } from '@vueform/ui/origin'
import { VfForm } from '@vueform/ui/components'
import type { HttpAdapter } from '@vueform/ui'

const mockAdapter: HttpAdapter = async (config) => ({
  data: {},
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

function mountWithMockHttp(schema, model) {
  return mount(VfForm, {
    props: { schema, modelValue: model },
    global: {
      plugins: [
        createVueform({
          $http: { adapter: mockAdapter },
        }),
      ],
    },
  })
}
```

You can vary the response based on `config.url` or `config.method`:

```ts
const mockAdapter: HttpAdapter = async (config) => ({
  data: config.url === '/users' ? [{ id: 1, name: 'Jane' }] : {},
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})
```

### Spying on Requests

Wrap the adapter in `vi.fn()` to also assert on _what_ was sent. The adapter receives the final, fully merged `HttpRequestConfig` — URL, method, payload, headers — so a single spy verifies the whole request pipeline:

```ts
import type { HttpResponse } from '@vueform/ui'

test('posts the payload to the endpoint', async () => {
  const adapter = vi.fn(
    async (config): Promise<HttpResponse> => ({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    })
  )

  const wrapper = mount(VfForm, {
    props: {
      schema,
      modelValue: { name: 'Jane', email: 'jane@example.com' },
      endpoint: '/api/subscribe',
    },
    global: {
      plugins: [createVueform({ $http: { adapter } })],
    },
  })

  await wrapper.vm.submit()

  expect(adapter).toHaveBeenCalledTimes(1)
  expect(adapter).toHaveBeenCalledWith(
    expect.objectContaining({
      url: '/api/subscribe',
      method: 'POST',
      data: { name: 'Jane', email: 'jane@example.com' },
    })
  )
})
```

To simulate failures, throw an `HttpError` from the adapter — that's what the built-in `fetchHttpAdapter` does on non-`2xx` statuses, and the form classifies it into an `invalid` (`422`) or `fail` result exactly as in production. A response the adapter _returns_ always counts as success, whatever its status code. See [HTTP](/guide/http#switching-the-adapter) for the full adapter contract and [`$http`](/guide/configuration#http) for the other options you can set alongside it.

## DOM Assertions

For tests that should verify what the user actually sees — visible labels, rendered error messages, the state of a button — use Vue Test Utils' DOM helpers against the same wrapper:

```ts
test('renders the email error message in the DOM', async () => {
  const { wrapper, form$ } = mountForm(schema, { email: '' })

  await form$.validate()

  const errors = wrapper.findAll('.vf-error')
  expect(errors.some((e) => /required/i.test(e.text()))).toBe(true)
})
```

The class names used in `find` / `findAll` selectors come from the resolved [class map](/guide/classes#class-keys). Targeting class names couples the test to the theme — if that matters, add a stable `data-testid` attribute through the [`parts`](/guide/parts) prop (e.g. `parts: { input: { 'data-testid': 'email-input' } }`), app-wide via [defaults](/guide/defaults), and select on that instead.

## End-to-End Testing

End-to-end tools like [Playwright](https://playwright.dev/) and [Cypress](https://www.cypress.io/) need no special Vueform integration. Once your app is running, a Vueform form is just rendered DOM — selectors, input events, network mocks, and screenshot assertions all behave like they do against any Vue UI. The unit-test patterns above (asserting on the model after typing, waiting for validation, inspecting submission outcomes) translate directly into E2E flows.
