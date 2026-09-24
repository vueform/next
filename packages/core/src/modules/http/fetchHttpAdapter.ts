import {
  HttpError,
  type HttpAdapter,
  type HttpRequestConfig,
  type HttpResponse,
  type RequestType,
} from '@core/modules/http'
import { isFileValue, toFormData, warn, isDev } from '@core/utils'
import { resolveRequestUrl } from './resolveUrl'

function buildURL(config: HttpRequestConfig): string {
  const { baseURL, params } = config

  let url = resolveRequestUrl(config.url, baseURL)

  if (params) {
    const query = Object.entries(params)
      .filter(([, v]) => v != null)
      .map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
      )
      .join('&')

    if (query) {
      url += (url.includes('?') ? '&' : '?') + query
    }
  }

  return url
}

const isFile = isFileValue

function containsFiles(data: any): boolean {
  if (isFile(data)) return true
  if (Array.isArray(data)) return data.some(containsFiles)
  if (data && typeof data === 'object' && !(data instanceof Date)) {
    return Object.values(data).some(containsFiles)
  }
  return false
}

async function fileToBase64(file: File | Blob): Promise<string> {
  if (typeof FileReader !== 'undefined') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // SSR fallback: FileReader is not available in Node.js
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const type = file.type || 'application/octet-stream'
  return `data:${type};base64,${btoa(binary)}`
}

async function convertFilesToBase64(data: any): Promise<any> {
  if (isFile(data)) {
    return await fileToBase64(data)
  }

  if (Array.isArray(data)) {
    return Promise.all(data.map(convertFilesToBase64))
  }

  if (data && typeof data === 'object' && !(data instanceof Date)) {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = await convertFilesToBase64(value)
    }
    return result
  }

  return data
}

async function prepareBody(
  data: any,
  headers: Headers,
  requestType: RequestType = 'json',
  base64: boolean = false
): Promise<BodyInit | undefined> {
  if (data == null) return undefined

  if (
    (typeof FormData !== 'undefined' && data instanceof FormData) ||
    (typeof Blob !== 'undefined' && data instanceof Blob) ||
    (typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams)
  ) {
    return data
  }

  switch (requestType) {
    case 'form':
    case 'multipart': {
      if (typeof data === 'object') return toFormData(data)
      return data
    }

    case 'urlencoded': {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/x-www-form-urlencoded')
      }
      if (typeof data === 'object') {
        return new URLSearchParams(
          Object.entries(data)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)])
        )
      }
      return String(data)
    }

    case 'text': {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'text/plain')
      }
      return typeof data === 'string' ? data : JSON.stringify(data)
    }

    case 'json':
    default: {
      if (typeof data === 'string') return data

      // Handle files in JSON mode
      if (containsFiles(data)) {
        if (base64) {
          data = await convertFilesToBase64(data)
        } else if (isDev()) {
          warn(
            'Request data contains File/Blob objects but requestType is "json". ' +
              'Files cannot be serialized as JSON. Use requestType: "form" for file uploads, ' +
              'convert files to base64 manually, or enable automatic base64 conversion ' +
              'with { base64: true }'
          )
        }
      }

      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }

      return JSON.stringify(data)
    }
  }
}

/**
 * The Fetch-backed adapter: no dependencies, uses the global `fetch`. Not wired
 * in by default — presets that want it configure it explicitly via
 * `$http.adapter`, so consumers who bring their own adapter (axios, ky, a
 * custom one) never bundle this implementation.
 */
export const fetchHttpAdapter: HttpAdapter = async (config) => {
  if (typeof window === 'undefined') {
    // No fetch environment: refuse honestly instead of minting a fake
    // `{ status: 0 }` success — a submit that never left the machine must
    // classify as a failure, not wipe the user's data as "submitted".
    // (Endpoint-driven items never reach here: they are client-gated at the
    // source and refetch after hydration.)
    throw new HttpError(
      'HTTP requests are not available during SSR',
      config,
      'ssr'
    )
  }

  const url = buildURL(config)
  const method = (config.method || 'GET').toUpperCase()
  const headers = new Headers(config.headers)

  const body = ['GET', 'HEAD'].includes(method)
    ? undefined
    : await prepareBody(config.data, headers, config.requestType, config.base64)

  // Timeout
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let signal = config.signal

  if (config.timeout && config.timeout > 0) {
    const controller = new AbortController()
    if (config.signal) {
      config.signal.addEventListener('abort', () =>
        controller.abort(config.signal!.reason)
      )
    }
    signal = controller.signal
    timeoutId = setTimeout(() => controller.abort('timeout'), config.timeout)
  }

  let response: Response

  try {
    response = await fetch(url, {
      method,
      headers,
      body,
      signal,
      credentials: config.withCredentials ? 'include' : 'same-origin',
    })
  } catch (error: any) {
    clearTimeout(timeoutId)

    const isAbort = error?.name === 'AbortError' || signal?.aborted
    const isTimeout = error === 'timeout' || error?.message?.includes('timeout')
    const reason = isTimeout ? 'timeout' : isAbort ? 'abort' : 'network'

    const messages: Record<string, string> = {
      timeout: `Timeout of ${config.timeout}ms exceeded`,
      abort: 'Request aborted',
      network: `Network Error: ${error?.message}`,
    }

    throw new HttpError(messages[reason], config, reason)
  }

  clearTimeout(timeoutId)

  let data: any
  try {
    switch (config.responseType) {
      case 'text':
        data = await response.text()
        break
      case 'blob':
        data = await response.blob()
        break
      case 'arrayBuffer':
        data = await response.arrayBuffer()
        break
      default: {
        const text = await response.text()
        data = text ? JSON.parse(text) : null
      }
    }
  } catch {
    data = null
  }

  const httpResponse: HttpResponse = {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    config,
  }

  if (!response.ok) {
    throw new HttpError(
      `Request failed with status ${response.status}`,
      config,
      'http',
      httpResponse
    )
  }

  return httpResponse
}
