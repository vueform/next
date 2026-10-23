---
outline: [2,3]
---

# Testing

A form's data layer — values, rules, conditions, payload, submission — runs without a component, so most form logic is testable with no DOM and no mount. Mounting is for what only the rendered form does — inputs, error display, focus, button actions. There is no Vueform-specific test framework to learn; any runner that can drive a Vue component works, and the examples here use [Vitest](https://vitest.dev/) with [Vue Test Utils](https://test-utils.vuejs.org/).

## Testing Without a Component

`useModel` depends on a setup context, which a test file doesn't have — so create a Vueform instance with `createVueform()` and build the model from the instance instead, no app and no mount required (see [Outside a Setup Context](/guide/vueform-instance#outside-a-setup-context) for why this route exists):

```ts
import { createVueform } from '@vueform/ui/origin'

const { useModel } = createVueform()

const schema = {
  name: { type: 'text' },
  email: { type: 'text', rules: 'required|email' },
}

test('accepts the data once the email is fixed', async () => {
  const model = useModel({ schema }, { email: 'not-an-email' })

  expect(await model.validate()).toBe(false)
  expect(model.errors.email).toHaveLength(1)

  model.set('email', 'jane@example.com')

  expect(await model.validate()).toBe(true)
  expect(model.payload).toEqual({ name: null, email: 'jane@example.com' })
})
```

Everything validation, conditions, and payload projection do applies at this tier — [Validation Without a Form](/guide/validation#validation-without-a-form) covers the validation side, and the members are the [Model API](/guide/model#the-model-api).

Submission is headless-testable too. Give the model an `endpoint` and `model.submit()` runs the real submission engine against the instance's HTTP layer, so the adapter stub from [Stubbing the HTTP Adapter](#stubbing-the-http-adapter) plugs into `createVueform()` here the same way.

## Mounting a Form

Mounting needs a DOM environment in the test runner — point Vitest's `environment` at `happy-dom` or `jsdom`. The form itself mounts like any Vue component, with `createVueform()` installed as a global plugin to register the components, rules, modules, theme, and locale. A small helper keeps that to one line per test:

```ts
import { mount } from '@vue/test-utils'
import { createVueform } from '@vueform/ui/origin'
import { VfForm } from '@vueform/ui/components'
import type { FormSchema, UserConfig } from '@vueform/ui'

export function mountForm(
  schema: FormSchema,
  props: Record<string, any> = {},
  config: UserConfig = {}
) {
  const wrapper = mount(VfForm, {
    props: { schema, ...props },
    global: { plugins: [createVueform(config)] },
  })

  return { wrapper, form$: wrapper.vm }
}
```

`wrapper.vm` is the form's [context](/guide/context#form-context) — every member the context carries is on it.

`mountForm`'s two optional arguments, `props` and `config`, are the knobs the rest of this chapter turns. `props` is forwarded to `!VfForm` as mount props — passing `modelValue: { email: '...' }` seeds initial values with a plain object, and passing a `!useModel` instance attaches it, like [any other model shape](/guide/model#other-model-shapes). `config` becomes the `createVueform()` configuration, which is where later sections put test-specific options — an HTTP stub, `nativeEmit`, `lazy`.

That last one matters for DOM assertions. With the global [`lazy`](/guide/configuration#lazy) option on (the default), elements in inactive steps or tabs defer rendering their DOM until the browser goes idle — and where `requestIdleCallback` is missing, as in most DOM shims, idle means a 300 ms timeout. Visible elements render at mount, so most tests never notice; tests asserting on inactive pages should pass `lazy: false` in the test config.

## Asserting Through the Context

The context is the fastest assertion surface — read `form$.data`, write through element contexts, and check validation state without touching the DOM:

```ts
const schema = {
  name: { type: 'text' },
  email: { type: 'text', rules: 'required|email' },
}

test('reports the broken email', async () => {
  const { form$ } = mountForm(schema, { modelValue: { email: 'broken' } })

  form$.find('name').update('Jane')
  expect(form$.data.name).toBe('Jane')

  await form$.validate()

  expect(form$.invalid).toBe(true)
  expect(form$.errors.email).toHaveLength(1) // form errors, keyed by path
  expect(form$.find('email').errors).toHaveLength(1) // the element's own string[]
})
```

`validate({ force: true })`, the skip-if-already-passing behavior, and the `busy` flag for async rules are covered in [Driving Validation from Code](/guide/validation#driving-validation-from-code).

## Asserting Through the DOM

For what the user actually sees, drive the form through Vue Test Utils' DOM helpers. `setValue()` on an input updates the model through the element's own binding, and clicking a submit button runs the same `submit()` lifecycle as calling it. One timing rule applies — the context updates synchronously, but the DOM updates on Vue's next flush, so await `nextTick()` (or `flushPromises()`) before reading rendered output:

```ts
import { nextTick } from 'vue'

test('renders the error message', async () => {
  const { wrapper, form$ } = mountForm(schema)

  await wrapper.find('input[name="email"]').setValue('broken')

  await form$.validate()
  await nextTick()

  expect(wrapper.find('.vf-error').exists()).toBe(true)
})
```

Selectors like `.vf-error` come from the theme's [class map](/guide/classes), so they couple the test to the theme. The robust alternative is a stable `data-testid` set through a [part](/guide/parts):

```ts
const schema = {
  email: { type: 'text', parts: { input: { 'data-testid': 'email-input' } } },
}

wrapper.find('[data-testid="email-input"]')
```

To apply test IDs app-wide instead of per element, set the part through [defaults](/guide/defaults) or presets. Element `id` attributes come from Vue's [`useId()`](https://vuejs.org/api/composition-api-helpers.html#useid) by default and are stable per mount order; snapshot tests that need a fixed scheme can swap the generator via the [`uid`](/guide/configuration#uid) option.

## Asserting on Submission

`form$.submit()` resolves with a `SubmitResult` — branch on its `type`, and see [the result](/guide/submit#the-result) for the four shapes. A client-side validation failure short-circuits before any request, so the `invalid` branch needs no endpoint and no stub:

```ts
test('never reaches the network when invalid', async () => {
  const { form$ } = mountForm(schema, { modelValue: { email: 'broken' } })

  const result = await form$.submit()

  expect(result).toMatchObject({ type: 'invalid', source: 'client' })
})
```

A valid form without an `endpoint` resolves with `undefined` — there is nothing to send to — so a success-path test needs an endpoint plus a stubbed transport.

### Stubbing the HTTP Adapter

Replace `$http.adapter` in the test's `createVueform()` config. Only the transport is swapped — defaults, interceptors, origin policy, and error classification still run, exactly as [Switching the Adapter](/guide/http#switching-the-adapter) describes. A `vi.fn()` adapter doubles as a spy on what was sent:

```ts
import type { HttpRequestConfig, HttpResponse } from '@vueform/ui'

const adapter = vi.fn(
  async (config: HttpRequestConfig): Promise<HttpResponse> => ({
    data: { ok: true },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  })
)

test('posts the payload to the endpoint', async () => {
  const { form$ } = mountForm(
    schema,
    {
      modelValue: { name: 'Jane', email: 'jane@example.com' },
      endpoint: '/api/subscribe',
    },
    { $http: { adapter } }
  )

  const result = await form$.submit()

  expect(result?.type).toBe('success')
  expect(adapter).toHaveBeenCalledWith(
    expect.objectContaining({
      url: '/api/subscribe',
      method: 'POST',
      data: { name: 'Jane', email: 'jane@example.com' },
    })
  )
})
```

The `data` the adapter receives is the plain payload object, alongside `requestType: 'form'` (`'json'` with the `json` prop) — encoding it into `FormData` is the real adapter's job, so a stub asserts on plain objects.

To simulate the other outcomes, mirror what the built-in adapter does:

| To get | Make the stub |
| --- | --- |
| `fail` with reason `'http'` | Return a response with a non-`2xx` status. |
| `invalid` with source `'server'` | Throw `new HttpError(message, config, 'http', response)` where `response.status` is `422`. |
| `fail` with another reason | Throw an `HttpError` with that `reason` — `'network'`, `'timeout'`, and the rest. |

One policy survives the stub. The [origin check](/guide/security#request-origins) runs before any adapter, so relative endpoint URLs always pass but an absolute one must be allowed via `$security.allowOrigins` in the test config, or the attempt fails with reason `'blocked'` without the stub ever being called:

```ts
mountForm(
  schema,
  { endpoint: 'https://api.example.com/subscribe' },
  {
    $http: { adapter }, // the stub from above
    $security: { allowOrigins: ['https://api.example.com'] },
  }
)
```

## Asserting on Events

By default Vueform calls `on*` listeners directly instead of going through Vue's `emit()`, so `wrapper.emitted()` records none of Vueform's events. Assert with spies instead — pass any `on*` handler as a mount prop, or subscribe with `form$.on()` as [Subscribing from Code](/guide/event-handlers#subscribing-from-code) describes:

```ts
test('fires success', async () => {
  const onSuccess = vi.fn()

  const { form$ } = mountForm(
    schema,
    {
      modelValue: { email: 'jane@example.com' },
      endpoint: '/api/subscribe',
      onSuccess,
    },
    { $http: { adapter } } // the stub from above
  )

  await form$.submit()

  expect(onSuccess).toHaveBeenCalledWith(
    expect.objectContaining({ type: 'success' })
  )
})
```

Setting `nativeEmit: true` in the test config makes `wrapper.emitted()` work, with the trade-offs described in [Falling Back to Native Vue Emits](/guide/event-handlers#falling-back-to-native-vue-emits) — and a test config that diverges from the app's is no longer testing the app's behavior.

## End-to-End Tests

[Playwright](https://playwright.dev/) and [Cypress](https://www.cypress.io/) need no Vueform integration — a running Vueform form is plain DOM, driven and asserted like any other page. The `data-testid` parts approach from [above](#asserting-through-the-dom) is what keeps E2E selectors stable across theme and template changes.
