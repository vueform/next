---
outline: [2,3]
---

# HTTP

Every request Vueform makes — [submissions](/guide/submit), [autosave](/guide/autosave), items loaded from an endpoint — goes through one built-in HTTP layer. The same layer is exposed to your application as `useHttp`, so your own requests share the base URL, headers, interceptors, and error handling that Vueform's internal ones use.

Underneath, the actual transport is a swappable adapter — dependency-free Fetch by default, your own client when you want one.

## Basic Usage

`useHttp()` returns an instance of the HTTP module. Its shape mirrors any modern HTTP client — `request`, `get`, `post`, `put`, `patch`, `delete`, plus [instance-scoped interceptors](#interceptors):

```vue
<script setup lang="ts">
import { useHttp } from '@vueform/ui'

const $http = useHttp()

const loadUsers = async () => {
  const { data } = await $http.get('/api/users')
}
</script>
```

Called with no argument, `useHttp()` resolves the app's configuration by injection, so it belongs in `<script setup>`. Outside a setup context — a store, a route guard, a plain script — the same client is available on the instance returned by `createVueform` as `!vueform.$http`:

```ts
// vueform.ts
import { createVueform } from '@vueform/ui/origin'

export const vueform = createVueform({
  // your configuration
})

// stores/countries.ts
import { vueform } from '@/vueform'

const { data } = await vueform.$http.get('/api/countries')
```

Keeping a reference to the instance for exactly this purpose is covered in [Outside a Setup Context](/guide/vueform-instance#outside-a-setup-context).

The module is browser-only. During [SSR](/guide/ssr#http-is-client-side) the built-in adapter refuses to send requests, so data a page needs before it renders belongs in your framework's own data-fetching layer.

## Request Methods

Each shorthand returns a `Promise<HttpResponse<T>>`:

| Method | Signature |
| --- | --- |
| `$http.get(url, config?)` | GET request, no body. |
| `$http.post(url, data?, config?)` | POST with optional body. |
| `$http.put(url, data?, config?)` | PUT with optional body. |
| `$http.patch(url, data?, config?)` | PATCH with optional body. |
| `$http.delete(url, config?)` | DELETE request, no body. |
| `$http.request(config)` | Full request driven by an `HttpRequestConfig`. |

The last argument is a partial `HttpRequestConfig` overriding the [defaults](#configuring-defaults) for that one call:

```ts
const { data } = await $http.get('/api/users', {
  params: { page: 2, limit: 50 },
  headers: { 'X-Trace-Id': '...' },
  timeout: 5000,
})
```

For non-standard methods or full control, use `$http.request()` directly:

```ts
const { data } = await $http.request({
  url: '/api/users',
  method: 'POST',
  data: { name: 'John' },
  requestType: 'json',
  responseType: 'json',
})
```

`requestType` picks the body encoding (`'json'`, `'form'`, `'multipart'`, `'urlencoded'`, `'text'`) and `responseType` how the response body is parsed (`'json'`, `'text'`, `'blob'`, `'arrayBuffer'`).

## The Response Object

Every method resolves to a normalized `!HttpResponse` — the same shape no matter which adapter is behind it:

```ts
const response = await $http.get('/api/users')

response.data       // parsed body
response.status     // 200
response.statusText // 'OK'
response.headers    // Record<string, string>
response.config     // the request config that produced this response
```

Pass the response data type as a generic for end-to-end typing:

```ts
type User = { id: number; name: string }

const { data } = await $http.get<User[]>('/api/users')
//          ^| data@"User[]""
```

## Configuring Defaults

Application-wide defaults live under the `$http` key of `createVueform`. Every request — Vueform's own and yours — picks them up:

```ts
import { createVueform } from '@vueform/ui/origin'

app.use(
  createVueform({
    $http: {
      baseURL: 'https://api.example.com',
      headers: { 'X-App': 'myapp' },
      timeout: 10000,
      withCredentials: true,
    },
  })
)
```

Per-request config overrides the defaults, and headers are merged. When nothing sets them, requests go out as `GET` with `'json'` body encoding. The full option table — including `defaultMethod`, `requestType`, `base64`, and the interceptor and adapter keys — lives at [`$http`](/guide/configuration#http).

## Interceptors

Interceptors hook into requests and responses at two scopes — **app-wide**, declared in the `$http` config, and **instance**, registered on a `useHttp()` instance and applying only to requests made through it.

App-wide interceptors go in the `onRequest` / `onResponse` arrays of `$http` and run on every request — submissions, autosave, and manual calls alike:

```ts
createVueform({
  $http: {
    onRequest: [(config) => {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${getToken()}`,
      }
      return config
    }],
    onResponse: [(response) => {
      trackResponse(response.status)
      return response
    }],
  },
})
```

Instance interceptors are registered with `$http.onRequest()` / `$http.onResponse()` and apply **only to calls made through that instance** — form submissions, autosave, and other `useHttp()` instances are untouched, and the interceptors are released with the instance:

```ts
const $http = useHttp()

$http.onRequest((config) => {
  config.headers = { ...config.headers, 'X-Custom': 'value' }
  return config
})
```

For an instance's requests the two scopes nest like an onion: instance request interceptors → app-wide request interceptors → the adapter call → app-wide response interceptors → instance response interceptors. Interceptors can be `async` — the request awaits each one.

## Error Handling

Failures throw an `!HttpError` carrying enough context to react without parsing messages:

```ts
import { HttpError } from '@vueform/ui'

try {
  await $http.post('/api/users', { name: 'John' })
} catch (error) {
  if (error instanceof HttpError) {
    error.reason   // what failed — see the table below
    error.status   // HTTP status, when the server responded
    error.data     // parsed response body, when available
    error.response // full HttpResponse, when available
    error.config   // the request config that produced the error
  }
}
```

| `reason` | When |
| --- | --- |
| `'http'` | The server responded with a non-`2xx` status. |
| `'network'` | The request never reached the server (DNS, offline, CORS, …). |
| `'timeout'` | The configured `timeout` elapsed. |
| `'abort'` | The request was [canceled](#aborting-requests) via an `AbortSignal`. |
| `'blocked'` | The target origin isn't allowed by [`allowOrigins`](/guide/security#request-origins). |
| `'ssr'` | The request was attempted during [server-side rendering](/guide/ssr#http-is-client-side). |
| `'unknown'` | Catch-all for unexpected adapter failures. |

`error.config` is safe to hand to an error reporter — credential-bearing headers such as `Authorization` and `Cookie` arrive as `'[redacted]'`, so a token attached by an interceptor never ends up in a log.

## Aborting Requests

Pass an `AbortSignal` in the per-request config to cancel an in-flight request:

```ts
const controller = new AbortController()

const promise = $http.get('/api/slow', { signal: controller.signal })

controller.abort()
```

An aborted request throws an `HttpError` with `reason: 'abort'`. The form's own submission has a shortcut — `form$.abort()`, covered in [Aborting](/guide/submit#aborting).

## Inside the Form Flow

The most common reason to reach for `useHttp()` is taking over part of the submission flow without giving up Vueform's result lifecycle. An `endpoint` function or `@submit` handler that returns an `HttpResponse` feeds [classification](/guide/submit#the-result) exactly as if Vueform had made the request itself, and an `HttpError` it throws is caught and classified the same way — a `422` becomes an `invalid` result, a network failure a `fail`:

```ts
import { useForm, useHttp } from '@vueform/ui'

const $http = useHttp()

const [Form] = useForm({
  schema,
  endpoint: async (data) => {
    return await $http.post('/api/registration', {
      ...data,
      captchaToken: await getCaptchaToken(),
    })
  },
})
```

Because the call goes through the configured module, your custom submission logic still benefits from `baseURL`, default headers, interceptors, and adapter swaps. The two takeover points and their other return values are covered in [Owning the Request](/guide/submit#owning-the-request).

Data flows the other way through the same layer. Select-style elements don't need a manual request at all — their `items` prop accepts an endpoint URL directly:

```vue
<VfSelect name="country" items="/api/countries" />
```

For everything else — prefilling a record, hitting a side endpoint when a value changes — call `useHttp()` yourself and hand the result to the form:

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useForm, useHttp } from '@vueform/ui'

const $http = useHttp()

const [Form, form$] = useForm({ schema })

onMounted(async () => {
  const { data } = await $http.get('/api/profile')

  form$.load(data)
})
</script>
```

## Switching the Adapter

The **adapter** is the function that actually performs a request. It takes an `HttpRequestConfig`, returns a `Promise<HttpResponse>`, and throws an `HttpError` on failure. The `@vueform/ui` presets wire in `fetchHttpAdapter`, based on the native [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), by default; replace it under `$http.adapter` to route everything through your own client:

```ts
import { createVueform, type HttpAdapter } from '@vueform/ui/origin'

const customAdapter: HttpAdapter = async (config) => {
  const response = await myClient.request({
    url: config.url,
    method: config.method,
    body: config.data,
    headers: config.headers,
  })

  return {
    data: response.body,
    status: response.statusCode,
    statusText: response.statusMessage,
    headers: response.headers,
    config,
  }
}

createVueform({
  $http: { adapter: customAdapter }, // [!code highlight]
})
```

Once installed, every call — through `useHttp()` and Vueform's internal flows alike — runs through your adapter, while defaults, interceptors, and error classification keep working unchanged. The [origin policy](/guide/security#request-origins) also stays in force, because it's checked before the adapter is called — a custom adapter can't bypass it.

Ready-made adapters ship as plugins so you only bundle what you use: [Axios](/plugins/axios) and [unjs/ofetch](/plugins/ofetch). Because requests and responses are always normalized into Vueform's own shapes, swapping adapters is non-breaking — your form code, endpoint handlers, and `useHttp()` calls don't change.
