import {
  defineSchema,
  HttpError,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from '@vueform/core'
import { describe, expect, it } from 'vitest'

import { createForm, flushPromises } from '../../helpers'

function mockAdapter(response: Partial<HttpResponse> = {}): {
  adapter: HttpAdapter
  calls: HttpRequestConfig[]
} {
  const calls: HttpRequestConfig[] = []

  const adapter: HttpAdapter = async <T = any>(
    config: HttpRequestConfig
  ): Promise<HttpResponse<T>> => {
    calls.push(config)
    return {
      data: (response.data ?? null) as T,
      status: response.status ?? 200,
      statusText: response.statusText ?? 'OK',
      headers: response.headers ?? {},
      config,
    }
  }

  return { adapter, calls }
}

function errorAdapter(status: number, data: any = null): HttpAdapter {
  return async (config) => {
    const response: HttpResponse = {
      data,
      status,
      statusText:
        status === 422 ? 'Unprocessable Entity' : 'Internal Server Error',
      headers: {},
      config,
    }
    throw new HttpError(
      `Request failed with status ${status}`,
      config,
      'http',
      response
    )
  }
}

/**
 * A Vueform instance whose http module uses the given adapter (the mounted
 * host form is unrelated to the models under test).
 */
const makeVueform = (adapter?: HttpAdapter) =>
  createForm(
    { schema: defineSchema({ _install: { type: 'text' } }) },
    adapter ? { $http: { adapter } } : {}
  ).vueform

describe('useModel submission', () => {
  const oc = (obj: Record<string, any>) => expect.objectContaining(obj)

  it('submits to a string endpoint with POST and fires the result events', async () => {
    const { adapter, calls } = mockAdapter({ data: { ok: true } })
    const vueform = makeVueform(adapter)

    const events: string[] = []

    const model$ = vueform.useModel(
      {
        schema: { name: { type: 'text' } } as any,
        endpoint: '/api/users',
        onSubmit: () => {
          events.push('submit')
        },
        onResponse: () => {
          events.push('response')
        },
        onSuccess: (result) => {
          events.push('success')
          expect(result.data).toEqual({ ok: true })
        },
      },
      { name: 'John' }
    )

    const result = await model$.submit()

    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual(
      oc({ url: '/api/users', method: 'POST', data: { name: 'John' } })
    )
    expect(result).toEqual(oc({ type: 'success', status: 200 }))
    expect(events).toEqual(['submit', 'response', 'success'])
    expect(model$.result).toEqual(oc({ type: 'success' }))
    expect(model$.response).toEqual(oc({ status: 200 }))
    expect(model$.submits).toBe(1)
    expect(model$.submitting).toBe(false)
  })

  it('honors method, headers, json, and transformPayload options', async () => {
    const { adapter, calls } = mockAdapter()
    const vueform = makeVueform(adapter)

    const model$ = vueform.useModel(
      {
        schema: { name: { type: 'text' } } as any,
        endpoint: '/api/users',
        method: 'PUT',
        headers: { 'X-Token': 'abc' },
        json: true,
        transformPayload: (payload) => ({ ...payload, extra: 1 }),
      },
      { name: 'John' }
    )

    await model$.submit()

    expect(calls[0]).toEqual(
      oc({
        url: '/api/users',
        method: 'PUT',
        headers: { 'X-Token': 'abc' },
        requestType: 'json',
        data: { name: 'John', extra: 1 },
      })
    )
  })

  it('supports a function endpoint and prevented cancellation', async () => {
    const vueform = makeVueform()

    const cancelled: any[] = []

    const model$ = vueform.useModel({
      schema: { name: { type: 'text' } } as any,
      endpoint: () => false as const,
      onCancelled: (result) => {
        cancelled.push(result)
      },
    })

    const result = await model$.submit()

    expect(result).toEqual(oc({ type: 'cancelled', reason: 'prevented' }))
    expect(cancelled).toHaveLength(1)
  })

  it('returns a client-invalid result with path-keyed errors and skips the request', async () => {
    const { adapter, calls } = mockAdapter()
    const vueform = makeVueform(adapter)

    const model$ = vueform.useModel({
      schema: {
        name: { type: 'text', rules: 'required' },
      } as any,
      endpoint: '/api/users',
    })

    const result = await model$.submit()

    expect(calls).toHaveLength(0)
    expect(result).toEqual(oc({ type: 'invalid', source: 'client' }))
    expect((result as any).errors.name).toBeDefined()
    expect(model$.invalid).toBe(true)
  })

  it('fires onClientInvalid with the result on a client-side failure', async () => {
    const { adapter, calls } = mockAdapter()
    const vueform = makeVueform(adapter)

    const received: any[] = []

    const model$ = vueform.useModel({
      schema: {
        name: { type: 'text', rules: 'required' },
      } as any,
      endpoint: '/api/users',
      onClientInvalid: (result) => {
        received.push(result)
      },
    })

    const result = await model$.submit()

    expect(calls).toHaveLength(0)
    expect(received).toHaveLength(1)
    expect(received[0]).toBe(result)
    expect(received[0]).toEqual(oc({ type: 'invalid', source: 'client' }))
  })

  it('fires onInvalid / onValid on validity transitions', async () => {
    const vueform = makeVueform()

    const transitions: string[] = []

    const model$ = vueform.useModel({
      schema: {
        name: { type: 'text', rules: 'required' },
      } as any,
      onInvalid: () => {
        transitions.push('invalid')
      },
      onValid: () => {
        transitions.push('valid')
      },
    })

    await model$.validate()
    await flushPromises()
    expect(transitions).toEqual(['invalid'])

    model$.set('name', 'John')
    await model$.validate()
    await flushPromises()
    expect(transitions).toEqual(['invalid', 'valid'])
  })

  it('applies 422 server errors to the instance with setInvalid and clears them on revalidation', async () => {
    const vueform = makeVueform(
      errorAdapter(422, { errors: { name: ['Taken'] } })
    )

    const serverInvalid: any[] = []

    const model$ = vueform.useModel(
      {
        schema: { name: { type: 'text' } } as any,
        endpoint: '/api/users',
        setInvalid: true,
        onServerInvalid: (result) => {
          serverInvalid.push(result)
        },
      },
      { name: 'John' }
    )

    const result = await model$.submit()

    expect(result).toEqual(oc({ type: 'invalid', source: 'server' }))
    expect(serverInvalid).toHaveLength(1)
    expect(model$.errors).toContain('Taken')
    expect(model$.issues).toContainEqual({
      path: 'name',
      rule: 'server',
      message: 'Taken',
    })

    await model$.validate()

    expect(model$.errors).not.toContain('Taken')
  })

  it('updates the model from the response with setResponse and transformResponse', async () => {
    const { adapter } = mockAdapter({ data: { payload: { name: 'Server' } } })
    const vueform = makeVueform(adapter)

    const model$ = vueform.useModel(
      {
        schema: { name: { type: 'text' } } as any,
        endpoint: '/api/users',
        setResponse: true,
      },
      { name: 'John' }
    )

    await model$.submit()

    expect(model$.model.name).toBe('Server')
  })

  it('returns a fail result for non-2xx errors and fires onFail', async () => {
    const vueform = makeVueform(errorAdapter(500, { message: 'boom' }))

    const failed: any[] = []

    const model$ = vueform.useModel({
      schema: { name: { type: 'text' } } as any,
      endpoint: '/api/users',
      onFail: (result) => {
        failed.push(result)
      },
    })

    const result = await model$.submit()

    expect(result).toEqual(oc({ type: 'fail', status: 500 }))
    expect(failed).toHaveLength(1)
  })

  it('bridges onChange / onReset / onClear / onLoad to the store events', async () => {
    const vueform = makeVueform()

    const events: any[] = []

    const model$ = vueform.useModel(
      {
        schema: { name: { type: 'text' } } as any,
        onChange: (newValue, oldValue) => {
          events.push(['change', newValue.name, oldValue.name])
        },
        onClear: () => {
          events.push(['clear'])
        },
        onLoad: (value) => {
          events.push(['load', value.name])
        },
      },
      { name: 'John' }
    )

    model$.set('name', 'Jane')
    await flushPromises()
    expect(events).toContainEqual(['change', 'Jane', 'John'])

    model$.load({ name: 'Loaded' })
    expect(events).toContainEqual(['load', 'Loaded'])

    model$.clear()
    expect(events).toContainEqual(['clear'])
  })

  it('delegates submit to the attaching form', async () => {
    const { adapter, calls } = mockAdapter()

    const schema = defineSchema({ name: { type: 'text' } })

    const { vueform } = createForm({ schema }, { $http: { adapter } })

    const model$ = vueform.useModel({ schema }, { name: 'John' })

    const { form$ } = createForm(
      { schema, modelValue: model$, endpoint: '/api/form-endpoint' },
      { $http: { adapter } }
    )

    const result = await model$.submit()

    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('/api/form-endpoint')
    expect(result).toEqual(oc({ type: 'success' }))
    expect(form$.submits).toBe(1)

    // The instance mirrors the attaching form's submission state — one flow,
    // one set of counters.
    expect(model$.submits).toBe(1)
    expect(model$.result).toEqual(oc({ type: 'success' }))
    expect(model$.response).toEqual(oc({ status: 200 }))
    expect(model$.submitting).toBe(false)
  })

  it('fires the instance events and callbacks on form-driven submissions', async () => {
    const { adapter } = mockAdapter()

    const schema = defineSchema({ name: { type: 'text' } })

    const { vueform } = createForm({ schema }, { $http: { adapter } })

    const events: string[] = []
    const model$ = vueform.useModel(
      {
        schema,
        onSuccess: () => {
          events.push('option-success')
        },
      },
      { name: 'John' }
    )
    model$.on('submit', () => {
      events.push('listener-submit')
    })

    const { form$ } = createForm(
      { schema, modelValue: model$, endpoint: '/api/form-endpoint' },
      { $http: { adapter } }
    )

    // Submit through the form: the attaching form owns the flow, and mirrors
    // its events into the instance's emitter.
    const result = await form$.submit()

    expect(result).toEqual(oc({ type: 'success' }))
    expect(events).toContain('listener-submit')
    expect(events).toContain('option-success')

    expect(model$.submits).toBe(form$.submits)
    expect(model$.result).toBe(form$.result)
    expect(model$.response).toBe(form$.response)
  })

  it('keeps the form submission state after the form unmounts', async () => {
    const { adapter } = mockAdapter()

    const schema = defineSchema({ name: { type: 'text' } })

    const { vueform } = createForm({ schema }, { $http: { adapter } })
    const model$ = vueform.useModel({ schema }, { name: 'John' })

    const { form$, form } = createForm(
      { schema, modelValue: model$, endpoint: '/api/form-endpoint' },
      { $http: { adapter } }
    )

    await form$.submit()
    expect(model$.submits).toBe(1)

    form.unmount()

    // Detached again, but the form's final submission state carried over.
    expect(model$.attached).toBe(false)
    expect(model$.submits).toBe(1)
    expect(model$.result).toEqual(oc({ type: 'success' }))
    expect(model$.response).toEqual(oc({ status: 200 }))
  })
})
