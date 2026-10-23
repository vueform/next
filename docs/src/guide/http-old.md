---
outline: [2,3]
---

# HTTP

Everything Vueform sends over the wire — [submissions](/guide/submit), [autosave](/guide/autosave), items loaded from an endpoint — goes through one built-in HTTP layer. The same layer is exposed to your application as `useHttp()`, so your own requests share the base URL, headers, interceptors, and error handling that Vueform's internal ones use.

The default implementation rides on the Fetch API with zero dependencies. When you'd rather use Axios, ofetch, or your in-house client, you swap the **adapter** underneath and everything on top keeps working unchanged.

::: warning Client-side only
The HTTP module is designed for the browser. During [SSR](/guide/ssr) the built-in fetch adapter refuses to send requests — a server-side `submit()` fails with `reason: 'ssr'`, and endpoint-driven items wait for hydration. For data a page needs before it renders, use your framework's server-side data fetching instead of `useHttp()`.
:::

## Basic Usage

`useHttp()` returns an instance of the HTTP module. Its shape mirrors any modern HTTP client — `request`, `get`, `post`, `put`, `patch`, `delete`, plus [instance-scoped interceptors](#interceptors):

```vue
<script setup lang="ts">
import { useHttp } from '@vueform/ui'

const $http = useHttp()

const loadUsers = async () => {
  const { data } = await $http.get('/api/users')
}

const createUser = async () => {
  const { data } = await $http.post('/api/users', { name: 'John' })
}
</script>
```

`useHttp()` is callable anywhere once `createVueform` has run — components, route guards, stores, plain scripts. It doesn't depend on a component setup context.

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

The last argument is a partial `HttpRequestConfig` overriding the global defaults for that one call:

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
  headers: { 'X-Custom': 'value' },
  requestType: 'json',
  responseType: 'json',
  timeout: 5000,
})
```

`requestType` picks the body encoding (`'json'`, `'form'`, `'multipart'`, `'urlencoded'`, `'text'`) and `responseType` how the response body is parsed (`'json'`, `'text'`, `'blob'`, `'arrayBuffer'`).

## The Response Object

Every method resolves to a normalized `HttpResponse` — the same shape no matter which adapter is behind it:

```ts
const response = await $http.get<User[]>('/api/users')

response.data       // parsed body, typed as User[]
response.status     // 200
response.statusText // 'OK'
response.headers    // Record<string, string>
response.config     // the request config that produced this response
```

Pass the response data type as a generic for end-to-end typing:

```ts
type User = { id: number; name: string }

const { data } = await $http.get<User[]>('/api/users')
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

Per-request config overrides the defaults; headers are merged. See [`$http`](/guide/configuration#http) for the full option table — `baseURL`, `headers`, `timeout`, `defaultMethod`, `requestType`, `responseType`, `withCredentials`, `base64`, `onRequest`, `onResponse`, and `adapter`.

## Submitting Through `!useHttp`

The most common reason to reach for `useHttp()` is taking over part of the submission flow without giving up Vueform's [result lifecycle](/guide/submit#submit-result). The `endpoint` function and the `@submit` handler both accept an `HttpResponse` as a return value, and any `HttpError` they throw is caught and classified exactly like errors from a string `endpoint`:

```ts
import { defineSchema, useForm, useHttp } from '@vueform/ui'

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

Because the call goes through the configured adapter, your custom submission logic still benefits from `baseURL`, default headers, interceptors, and adapter swaps.

## Loading Data

For select-style elements, you often don't need a manual request at all — the `items` prop accepts an endpoint URL directly, fetched through this same HTTP layer:

```vue
<VfSelect name="country" items="/api/countries" />
```

For everything else — prefilling a record, hitting a side endpoint when a value changes — call `useHttp()` yourself:

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

## Interceptors

Interceptors hook into requests and responses at two scopes: **app-wide**, declared in the `$http` config, and **instance**, registered on a `useHttp()` instance and applying only to requests made through it.

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

## Aborting Requests

Pass an `AbortSignal` in the per-request config to cancel an in-flight request:

```ts
const controller = new AbortController()

const promise = $http.get('/api/slow', { signal: controller.signal })

controller.abort()
```

An aborted request throws an `HttpError` with `reason: 'abort'`. The form's own submission has a shortcut — `form$.abort()`, covered in [Aborting an In-Flight Request](/guide/submit#aborting-an-in-flight-request).

## Error Handling

Failures throw an `HttpError` carrying enough context to react without parsing messages:

```ts
import { HttpError } from '@vueform/ui'

try {
  await $http.post('/api/users', { name: 'John' })
} catch (error) {
  if (error instanceof HttpError) {
    error.reason   // 'http' | 'network' | 'timeout' | 'abort' | 'unknown'
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
| `'abort'` | The request was canceled via an `AbortSignal`. |
| `'unknown'` | Catch-all for unexpected adapter failures. |

::: tip
Inside an `endpoint` function or `@submit` handler you don't need to catch `HttpError` yourself — Vueform catches it and turns it into the appropriate [submit result](/guide/submit#submit-result) (`invalid` for `422`, `fail` otherwise).
:::

## Switching the Adapter

The **adapter** is the function that actually performs a request: it takes an `HttpRequestConfig` and returns an `HttpResponse`. The `@vueform/ui` package wires in the Fetch-based `fetchHttpAdapter` by default; replace it under `$http.adapter` to route everything through your own client:

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

Once installed, every call — through `useHttp()` and Vueform's internal flows alike — runs through your adapter, while interceptors, defaults, and error classification keep working unchanged.

Ready-made adapters ship as plugins so you only bundle what you use: [Axios](/plugins/axios) and [unjs/ofetch](/plugins/ofetch). Because requests and responses are always normalized into Vueform's own shapes, swapping adapters is non-breaking — your form code, endpoint handlers, and `useHttp()` calls don't change.
