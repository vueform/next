import { createForm } from '../../helpers'
import {
  defineSchema,
  HttpError,
  type HttpErrorReason,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from '#core'

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

function errorAdapter(
  status: number,
  data: any = null,
  reason?: HttpErrorReason
): HttpAdapter {
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
      reason ?? 'http',
      response
    )
  }
}

describe('Form Submission', () => {
  const oc = (obj: Record<string, any>) => expect.objectContaining(obj)

  describe('Request', () => {
    it('should send a request when form has a string endpoint', async () => {
      const { adapter, calls } = mockAdapter({ data: { ok: true } })

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(calls).toHaveLength(1)
      expect(calls[0].url).toBe('/api/users')
    })

    it('should use POST method by default for form submit', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(calls[0].method).toBe('POST')
    })

    it('should use custom method when specified', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
          method: 'PUT',
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(calls[0].method).toBe('PUT')
    })

    it('should send form data in the request', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
            email: { type: 'text', default: 'john@example.com' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(calls[0].data).toEqual({
        name: 'John',
        email: 'john@example.com',
      })
    })

    it('should send custom headers from form props', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
          headers: { 'X-Custom': 'test' },
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(calls[0].headers).toEqual(form$.props.headers ?? calls[0].headers)
    })

    it('should use json requestType when json prop is true', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
          json: true,
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(calls[0].requestType).toBe('json')
    })

    it('should use form requestType when json prop is false', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
          json: false,
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(calls[0].requestType).toBe('form')
    })

    it('should pass base64 option to http request', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
          base64: true,
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(calls[0].base64).toBe(true)
    })
  })

  describe('Result', () => {
    it('should return success result on successful submit', async () => {
      const { adapter } = mockAdapter({ data: { id: 1 } })

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter } }
      )

      const result = await form$.submit()

      expect(result).toEqual(
        oc({ type: 'success', data: { id: 1 }, status: 200 })
      )
    })

    it('should store response on successful submit', async () => {
      const { adapter } = mockAdapter({
        data: { id: 1 },
        status: 201,
        statusText: 'Created',
      })

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(form$.response?.data).toEqual({ id: 1 })
      expect(form$.response?.status).toBe(201)
    })

    it('should return client invalid result when validation fails', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', rules: 'required' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter } }
      )

      const result = await form$.submit()

      expect(calls).toHaveLength(0)
      expect(result).toEqual(oc({ type: 'invalid', source: 'client' }))
    })

    it('should return fail result on server error', async () => {
      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter: errorAdapter(500) } }
      )

      const result = await form$.submit()

      expect(result).toEqual(oc({ type: 'fail', status: 500 }))
    })

    it('should return server invalid result on 422', async () => {
      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        {
          $http: { adapter: errorAdapter(422, { name: ['Name is required'] }) },
        }
      )

      const result = await form$.submit()

      expect(result).toEqual(oc({ type: 'invalid', source: 'server' }))
    })

    it('should include errors and issues on the client invalid result', async () => {
      const { form$ } = createForm({
        schema: defineSchema({
          name: { type: 'text', rules: 'required' },
        }),
        endpoint: '/api/users',
      })

      const result: any = await form$.submit()

      expect(result.errors.name).toHaveLength(1)
      expect(result.issues).toEqual([oc({ path: 'name', rule: 'required' })])
    })

    it('should synthesize issues on the server invalid result', async () => {
      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        {
          $http: { adapter: errorAdapter(422, { name: ['Name is required'] }) },
        }
      )

      const result: any = await form$.submit()

      expect(result.issues).toEqual([
        oc({ path: 'name', rule: 'server', message: 'Name is required' }),
      ])
    })

    it('should include response data in fail result', async () => {
      const errorData = { message: 'Something went wrong' }

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter: errorAdapter(500, errorData) } }
      )

      const result = await form$.submit()

      expect(result).toEqual(oc({ type: 'fail', data: errorData }))
    })

    it('should return fail result with abort reason', async () => {
      const abortAdapter: HttpAdapter = async (config) => {
        throw new HttpError('Request aborted', config, 'abort')
      }

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter: abortAdapter } }
      )

      const result = await form$.submit()

      expect(result).toEqual(oc({ type: 'fail', reason: 'abort' }))
    })

    it('should return fail result with network reason', async () => {
      const networkAdapter: HttpAdapter = async (config) => {
        throw new HttpError('Network Error', config, 'network')
      }

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter: networkAdapter } }
      )

      const result = await form$.submit()

      expect(result).toEqual(oc({ type: 'fail', reason: 'network' }))
    })
  })

  describe('Endpoint Function', () => {
    it('should support function endpoint that returns a response', async () => {
      const { adapter } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: () => ({
            data: { id: 42 },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: { url: '/api/users' },
          }),
        },
        { $http: { adapter } }
      )

      const result = await form$.submit()

      expect(result).toEqual(oc({ type: 'success', data: { id: 42 } }))
    })

    it('should support function endpoint that returns false to cancel', async () => {
      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: () => false,
        },
        { $http: { adapter: mockAdapter().adapter } }
      )

      const result = await form$.submit()

      expect(result).toEqual(oc({ type: 'cancelled', reason: 'prevented' }))
    })

    it('should support function endpoint that returns a URL string', async () => {
      const { adapter, calls } = mockAdapter({ data: { id: 1 } })

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: () => '/api/dynamic-endpoint',
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(calls).toHaveLength(1)
      expect(calls[0].url).toBe('/api/dynamic-endpoint')
    })
  })

  describe('Events', () => {
    it('should fire success event on successful submit', async () => {
      const { adapter } = mockAdapter({ data: { id: 1 } })
      const successHandler = vi.fn()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter } }
      )

      form$.on('success', successHandler)
      await form$.submit()

      expect(successHandler).toHaveBeenCalledTimes(1)
      expect(successHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', data: { id: 1 } })
      )
    })

    it('should fire fail event on server error', async () => {
      const failHandler = vi.fn()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter: errorAdapter(500, { error: 'fail' }) } }
      )

      form$.on('fail', failHandler)
      await form$.submit()

      expect(failHandler).toHaveBeenCalledTimes(1)
      expect(failHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'fail', status: 500 })
      )
    })

    it('should fire response event on successful submit', async () => {
      const { adapter } = mockAdapter({ data: { id: 1 }, status: 200 })
      const responseHandler = vi.fn()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter } }
      )

      form$.on('response', responseHandler)
      await form$.submit()

      expect(responseHandler).toHaveBeenCalledTimes(1)
      expect(responseHandler).toHaveBeenCalledWith(
        expect.objectContaining({ data: { id: 1 }, status: 200 })
      )
    })

    it('should fire response event on error with response', async () => {
      const responseHandler = vi.fn()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter: errorAdapter(500, { error: 'fail' }) } }
      )

      form$.on('response', responseHandler)
      await form$.submit()

      expect(responseHandler).toHaveBeenCalledTimes(1)
    })

    it('should fire invalid event on 422 response', async () => {
      const invalidHandler = vi.fn()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter: errorAdapter(422, { name: ['Required'] }) } }
      )

      form$.on('serverInvalid', invalidHandler)
      await form$.submit()

      expect(invalidHandler).toHaveBeenCalledTimes(1)
      expect(invalidHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'invalid', source: 'server' })
      )
    })
  })

  describe('State', () => {
    it('should set submitting to false after successful submit', async () => {
      const { adapter } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(form$.submitting).toBe(false)
    })

    it('should set submitting to false after failed submit', async () => {
      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter: errorAdapter(500) } }
      )

      await form$.submit()

      expect(form$.submitting).toBe(false)
    })
  })

  describe('Post-Submit Behavior', () => {
    it('should reset form on success when resetOnSuccess is true', async () => {
      const { adapter } = mockAdapter({ data: { id: 1 } })

      const { form$, name } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
          resetOnSuccess: true,
        },
        { $http: { adapter } }
      )

      name.update('Changed')
      expect(name.value).toBe('Changed')

      await form$.submit()

      expect(name.value).toBe('John')
    })

    it('should clear form on success when clearOnSuccess is true', async () => {
      const { adapter } = mockAdapter({ data: { id: 1 } })

      const { form$, name } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
          clearOnSuccess: true,
        },
        { $http: { adapter } }
      )

      await form$.submit()

      expect(name.value).toBeFalsy()
    })
  })
})
