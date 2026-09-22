import {
  defineSchema,
  hasHttpModule,
  HttpError,
  model,
  useHttp,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
} from '@vueform/core'
import { createForm } from '../../helpers'

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

describe('HTTP Provider', () => {
  describe('Custom Adapter', () => {
    it('should use custom adapter from config', async () => {
      let adapterCalled = false

      const customAdapter: HttpAdapter = async <T = any>(config) => {
        adapterCalled = true
        return {
          data: { custom: true } as T,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        }
      }

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter: customAdapter } }
      )

      await form$.submit()

      expect(adapterCalled).toBe(true)
    })

    it('should pass merged config to custom adapter', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        {
          $http: {
            adapter,
            baseURL: 'https://api.example.com',
            headers: { Authorization: 'Bearer token' },
          },
        }
      )

      await form$.submit()

      expect(calls[0].baseURL).toBe('https://api.example.com')
      expect(calls[0].headers?.Authorization).toBe('Bearer token')
    })
  })

  describe('Config Defaults', () => {
    it('should apply baseURL from config', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/users',
        },
        { $http: { adapter, baseURL: 'https://api.example.com' } }
      )

      await form$.submit()

      expect(calls[0].baseURL).toBe('https://api.example.com')
    })

    it('should apply default headers from config', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        {
          $http: {
            adapter,
            headers: { 'X-Api-Key': 'abc123' },
          },
        }
      )

      await form$.submit()

      expect(calls[0].headers?.['X-Api-Key']).toBe('abc123')
    })

    it('should apply timeout from config', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter, timeout: 5000 } }
      )

      await form$.submit()

      expect(calls[0].timeout).toBe(5000)
    })

    it('should apply withCredentials from config', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { adapter, withCredentials: true } }
      )

      await form$.submit()

      expect(calls[0].withCredentials).toBe(true)
    })
  })

  describe('Fetch Adapter', () => {
    let fetchSpy: ReturnType<typeof vi.fn>

    beforeEach(() => {
      fetchSpy = vi.fn()
      // @ts-ignore
      globalThis.fetch = fetchSpy
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should use the fetch adapter by default', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ id: 1 }), {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' },
        })
      )

      const { form$ } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        endpoint: '/api/users',
      })

      await form$.submit()

      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    it('should build URL with baseURL', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200, statusText: 'OK' })
      )

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/users',
        },
        { $http: { baseURL: 'https://api.example.com' } }
      )

      await form$.submit()

      const calledUrl = fetchSpy.mock.calls[0][0]
      expect(calledUrl).toBe('https://api.example.com/users')
    })

    it('should use same-origin credentials by default', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200, statusText: 'OK' })
      )

      const { form$ } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        endpoint: '/api/users',
      })

      await form$.submit()

      const fetchOptions = fetchSpy.mock.calls[0][1]
      expect(fetchOptions.credentials).toBe('same-origin')
    })

    it('should use include credentials when withCredentials is true', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200, statusText: 'OK' })
      )

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        { $http: { withCredentials: true } }
      )

      await form$.submit()

      const fetchOptions = fetchSpy.mock.calls[0][1]
      expect(fetchOptions.credentials).toBe('include')
    })

    it('should send FormData body when requestType is form', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({}), { status: 200, statusText: 'OK' })
      )

      const { form$ } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        endpoint: '/api/users',
        json: false,
      })

      await form$.submit()

      const fetchOptions = fetchSpy.mock.calls[0][1]
      expect(fetchOptions.body).toBeInstanceOf(FormData)
    })

    it('should throw HttpError on non-ok response', async () => {
      fetchSpy.mockResolvedValue(
        new Response(JSON.stringify({ error: 'Not Found' }), {
          status: 404,
          statusText: 'Not Found',
        })
      )

      const { form$ } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        endpoint: '/api/users',
      })

      const result = await form$.submit()

      expect(result?.type).toBe('fail')
    })

    it('should throw HttpError on network failure', async () => {
      fetchSpy.mockRejectedValue(new TypeError('Failed to fetch'))

      const { form$ } = createForm({
        schema: defineSchema({
          name: { type: 'text', default: 'John' },
        }),
        endpoint: '/api/users',
      })

      const result = await form$.submit()

      expect(result?.type).toBe('fail')
    })
  })

  describe('Interceptors', () => {
    it('should apply config-level onRequest interceptor to every request', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        {
          $http: {
            adapter,
            onRequest: [
              (config) => {
                config.headers = {
                  ...config.headers,
                  Authorization: 'Bearer test-token',
                }
                return config
              },
            ],
          },
        }
      )

      await form$.submit()

      expect(calls[0].headers?.Authorization).toBe('Bearer test-token')
    })

    it('should apply config-level onResponse interceptor to every response', async () => {
      const { adapter } = mockAdapter({ data: { id: 1 } })

      let capturedStatus: number | undefined

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        {
          $http: {
            adapter,
            onResponse: [
              (response) => {
                capturedStatus = response.status
                return response
              },
            ],
          },
        }
      )

      await form$.submit()

      expect(capturedStatus).toBe(200)
    })

    it('should run config interceptors in registration order', async () => {
      const order: string[] = []
      const { adapter } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        {
          $http: {
            adapter,
            onRequest: [
              (config) => {
                order.push('request-1')
                return config
              },
              (config) => {
                order.push('request-2')
                return config
              },
            ],
            onResponse: [
              (response) => {
                order.push('response-1')
                return response
              },
              (response) => {
                order.push('response-2')
                return response
              },
            ],
          },
        }
      )

      await form$.submit()

      expect(order).toEqual([
        'request-1',
        'request-2',
        'response-1',
        'response-2',
      ])
    })

    it('should support multiple config-level interceptors', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        {
          $http: {
            adapter,
            onRequest: [
              (config) => {
                config.headers = {
                  ...config.headers,
                  'X-First': 'one',
                }
                return config
              },
              (config) => {
                config.headers = {
                  ...config.headers,
                  'X-Second': 'two',
                }
                return config
              },
            ],
          },
        }
      )

      await form$.submit()

      expect(calls[0].headers?.['X-First']).toBe('one')
      expect(calls[0].headers?.['X-Second']).toBe('two')
    })

    it('should support async config-level interceptors', async () => {
      const { adapter, calls } = mockAdapter()

      const { form$ } = createForm(
        {
          schema: defineSchema({
            name: { type: 'text', default: 'John' },
          }),
          endpoint: '/api/users',
        },
        {
          $http: {
            adapter,
            onRequest: [
              async (config) => {
                await new Promise((r) => setTimeout(r, 10))
                config.headers = {
                  ...config.headers,
                  Authorization: 'Bearer async-token',
                }
                return config
              },
            ],
          },
        }
      )

      await form$.submit()

      expect(calls[0].headers?.Authorization).toBe('Bearer async-token')
    })
  })

  describe('HttpError', () => {
    it('should contain status and data from response', () => {
      const config: HttpRequestConfig = { url: '/test' }
      const response: HttpResponse = {
        data: { error: 'bad request' },
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config,
      }

      const error = new HttpError('Request failed', config, 'http', response)

      expect(error.status).toBe(400)
      expect(error.data).toEqual({ error: 'bad request' })
      expect(error.reason).toBe('http')
      expect(error.response).toBe(response)
      expect(error.config).toBe(config)
      expect(error.name).toBe('HttpError')
      expect(error.message).toBe('Request failed')
    })

    it('should be an instance of Error', () => {
      const error = new HttpError('fail', { url: '/test' }, 'unknown')
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(HttpError)
    })

    it('should handle missing response', () => {
      const error = new HttpError('Network error', { url: '/test' }, 'network')
      expect(error.status).toBeUndefined()
      expect(error.data).toBeUndefined()
      expect(error.response).toBeUndefined()
    })
  })
})

describe('Instance interceptors (useHttp)', () => {
  it('should apply instance interceptors only to that instance', async () => {
    const { adapter, calls } = mockAdapter()

    const { vueform } = createForm(
      { schema: defineSchema({ name: { type: 'text' } }) },
      { $http: { adapter } }
    )

    const $http = useHttp(vueform)
    const $other = useHttp(vueform)

    $http.onRequest((config) => {
      config.headers = { ...config.headers, 'X-Instance': 'yes' }
      return config
    })

    await $http.get('/api/a')
    await $other.get('/api/b')

    expect(calls[0].headers?.['X-Instance']).toBe('yes')
    expect(calls[1].headers?.['X-Instance']).toBeUndefined()
  })

  it('should not apply instance interceptors to form submissions', async () => {
    const { adapter, calls } = mockAdapter()

    const { form$, vueform } = createForm(
      {
        schema: defineSchema({ name: { type: 'text', default: 'John' } }),
        endpoint: '/api/users',
      },
      { $http: { adapter } }
    )

    const $http = useHttp(vueform)

    $http.onRequest((config) => {
      config.headers = { ...config.headers, 'X-Instance': 'yes' }
      return config
    })

    await form$.submit()

    expect(calls[0].headers?.['X-Instance']).toBeUndefined()
  })

  it('should wrap config-declared interceptors like an onion', async () => {
    const order: string[] = []
    const { adapter } = mockAdapter()

    const { vueform } = createForm(
      { schema: defineSchema({ name: { type: 'text' } }) },
      {
        $http: {
          adapter,
          onRequest: [
            (config) => {
              order.push('config-request')
              return config
            },
          ],
          onResponse: [
            (response) => {
              order.push('config-response')
              return response
            },
          ],
        },
      }
    )

    const $http = useHttp(vueform)

    $http.onRequest((config) => {
      order.push('instance-request')
      return config
    })
    $http.onResponse((response) => {
      order.push('instance-response')
      return response
    })

    await $http.get('/api/a')

    expect(order).toEqual([
      'instance-request',
      'config-request',
      'config-response',
      'instance-response',
    ])
  })
})

describe('Without the http module', () => {
  const schema = defineSchema({ name: { type: 'text' } })

  it('acquires an inert instance instead of throwing, and rejects on request', async () => {
    const { vueform } = createForm({ schema }, { modules: { model } })

    expect(hasHttpModule(vueform)).toBe(false)

    const $http = useHttp(vueform)
    $http.onRequest((config) => config) // inert, must not throw

    await expect($http.get('/api/a')).rejects.toThrow(
      'The `http` module is not registered'
    )
    await expect($http.request({ url: '/api/a' })).rejects.toThrow(
      'The `http` module is not registered'
    )
  })

  it('mounts a form (setup acquires useHttp()) without throwing', () => {
    const { form$ } = createForm({ schema }, { modules: { model } })

    expect(form$.find('name')).toBeTruthy()
  })

  it('rejects an endpoint submission with the descriptive error', async () => {
    const { form$ } = createForm(
      { schema, endpoint: '/submit' },
      { modules: { model } }
    )

    await expect(form$.submit()).rejects.toThrow(
      'The `http` module is not registered'
    )
  })
})
