import type { VueformInstance } from '@core/helpers'
import { getSecurityModule } from '@core/modules/security'
import { HttpError } from './error'
import { resolveRequestUrl } from './resolveUrl'
import type {
  HttpAdapter,
  HttpRequestConfig,
  HttpResponse,
  HttpModule,
  HttpInstance,
  RequestInterceptor,
  ResponseInterceptor,
} from './types'

const noAdapterConfigured: HttpAdapter = async () => {
  throw new Error(
    '[Vueform error]: No `http` adapter is configured. Provide ' +
      '`$http.adapter` — `fetchHttpAdapter` (from `@vueform/core`), or a ' +
      'custom `HttpAdapter`.'
  )
}

/**
 * Creates an http instance from the given app config (uses `$http` for request
 * defaults, interceptors, and the adapter).
 *
 * @param config The app config (only `$http` is used).
 */
export function createHttp(vueform: VueformInstance): HttpModule {
  const { config } = vueform

  const {
    adapter,
    defaultMethod,
    requestType,
    baseURL,
    timeout,
    headers,
    withCredentials,
    base64,
    onRequest: globalRequestInterceptors,
    onResponse: globalResponseInterceptors,
  } = config.$http ?? {}

  const httpAdapter: HttpAdapter = adapter ?? noAdapterConfigured

  const defaults: Partial<HttpRequestConfig> = {
    method: defaultMethod || 'GET',
    requestType: requestType || 'json',
    baseURL,
    timeout,
    headers: headers || {},
    withCredentials: withCredentials,
    base64: base64 || false,
  }

  async function request<T = any>(
    reqConfig: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    let merged: HttpRequestConfig = {
      ...defaults,
      ...reqConfig,
      headers: { ...defaults.headers, ...reqConfig.headers },
    }

    if (globalRequestInterceptors) {
      for (const interceptor of globalRequestInterceptors) {
        merged = await interceptor(merged)
      }
    }

    // Origin policy runs AFTER the interceptors — they have the final word on
    // the URL — and before any adapter, so custom adapters are covered too.
    // The judged URL comes from the same `resolveRequestUrl` the fetch
    // adapter uses, so the policy check and the actual request can't drift.
    const target = resolveRequestUrl(merged.url ?? '', merged.baseURL)

    if (!getSecurityModule(vueform).allowsOrigin(target)) {
      throw new HttpError(
        `Request to \`${target}\` was blocked: cross-origin requests are denied by default. Add its origin to \`$security.allowOrigins\` (or set \`['*']\` to allow any).`,
        merged,
        'blocked'
      )
    }

    let response = await httpAdapter<T>(merged)

    if (globalResponseInterceptors) {
      for (const interceptor of globalResponseInterceptors) {
        response = (await interceptor(response)) as HttpResponse<T>
      }
    }

    return response
  }

  /**
   * Builds the verb shorthands (`get`, `post`, …) around a request function, so
   * the module and every instance share one definition.
   */
  const methodsFor = (send: typeof request) => ({
    get: <T = any>(url: string, c?: Partial<HttpRequestConfig>) =>
      send<T>({ ...c, url, method: 'GET' }),
    post: <T = any>(url: string, data?: any, c?: Partial<HttpRequestConfig>) =>
      send<T>({ ...c, url, method: 'POST', data }),
    put: <T = any>(url: string, data?: any, c?: Partial<HttpRequestConfig>) =>
      send<T>({ ...c, url, method: 'PUT', data }),
    patch: <T = any>(url: string, data?: any, c?: Partial<HttpRequestConfig>) =>
      send<T>({ ...c, url, method: 'PATCH', data }),
    delete: <T = any>(url: string, c?: Partial<HttpRequestConfig>) =>
      send<T>({ ...c, url, method: 'DELETE' }),
  })

  /**
   * Creates an instance: the same client surface backed by this module, plus
   * `onRequest` / `onResponse` interceptors applying only to requests made
   * through the instance. Instance interceptors nest around the config-declared
   * ones: instance request → config request → adapter → config response →
   * instance response.
   */
  const make = (): HttpInstance => {
    const requestInterceptors: RequestInterceptor[] = []
    const responseInterceptors: ResponseInterceptor[] = []

    const instanceRequest = async <T = any>(
      reqConfig: HttpRequestConfig
    ): Promise<HttpResponse<T>> => {
      let intercepted = reqConfig

      for (const interceptor of requestInterceptors) {
        intercepted = await interceptor(intercepted)
      }

      let response = await request<T>(intercepted)

      for (const interceptor of responseInterceptors) {
        response = (await interceptor(response)) as HttpResponse<T>
      }

      return response
    }

    return {
      request: instanceRequest,
      ...methodsFor(instanceRequest),
      onRequest: (fn: RequestInterceptor) => {
        requestInterceptors.push(fn)
      },
      onResponse: (fn: ResponseInterceptor) => {
        responseInterceptors.push(fn)
      },
    }
  }

  return {
    request,
    ...methodsFor(request),
    make,
  }
}
