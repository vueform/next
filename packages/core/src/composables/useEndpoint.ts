import { useHttp } from './useHttp'
import type { HttpRequestConfig, HttpInstance } from '#core/modules/http'

/**
 * A string URL, request config, or function that `useEndpoint` can resolve.
 */
type EndpointDefinition =
  | string
  | HttpRequestConfig
  | ((http: HttpInstance, ...args: any[]) => any)

/**
 * Resolves an endpoint definition into an HTTP response, handling string URLs,
 * config objects, and callback functions.
 *
 * Setup-only (resolves the calling component's instance). Throws when the
 * `http` module is not registered.
 *
 * @private
 * @param endpoint The endpoint definition to resolve.
 * @param data Optional data payload to send with the request.
 */
export async function useEndpoint<T = any>(
  endpoint: EndpointDefinition | undefined,
  data?: any
): Promise<T | undefined> {
  const $http = useHttp()

  if (!endpoint) return undefined

  if (typeof endpoint === 'string') {
    const response = data
      ? await $http.post<T>(endpoint, data)
      : await $http.get<T>(endpoint)
    return response.data
  }

  if (typeof endpoint === 'function') {
    return await endpoint($http, data)
  }

  // Object config — merge in data if provided and not already set
  const config = data && !endpoint.data ? { ...endpoint, data } : endpoint

  return (await $http.request<T>(config)).data
}
