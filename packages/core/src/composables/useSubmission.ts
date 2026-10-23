import { ref } from 'vue'

import {
  HttpError,
  type HttpInstance,
  type HttpResponse,
  type RequestMethod,
} from '#src/modules/http'
import type { Issue } from '#src/modules/validation'
import type { EndpointProp } from '#src/types'
import { isPlainObject } from '#src/utils'

/**
 * The submission-related props shared between the form blueprint and
 * `useModel`'s options: endpoint configuration, request encoding, server
 * response handling, and the payload / server-error / response transforms.
 */
export interface SubmissionProps {
  /**
   * The HTTP method for form submission (e.g. POST, PUT).
   */
  method?: RequestMethod

  /**
   * The URL or async function handling form submission.
   */
  endpoint?: EndpointProp

  /**
   * Whether to set validation errors on elements from a 422 server response.
   */
  setInvalid?: boolean

  /**
   * Whether to update form data with the server response data.
   */
  setResponse?: boolean

  /**
   * Whether to send form data as JSON instead of FormData.
   */
  json?: boolean

  /**
   * Whether to encode file uploads as base64.
   */
  base64?: boolean

  /**
   * Custom HTTP headers to include in the submission request.
   */
  headers?: Record<string, string>

  /**
   * Transforms form data before submission.
   *
   * @param payload The form payload to transform.
   * @param context$ The form's component context.
   */
  transformPayload?: (
    payload: Record<string, any>,
    context$: any
  ) => Record<string, any>

  /**
   * Transforms the server's validation error response.
   *
   * @param data The raw error response data.
   * @param context$ The form's component context.
   */
  transformServerInvalid?: (
    data: Record<string, any>,
    context$: any
  ) => Record<string, any>

  /**
   * Transforms the server response data when `setResponse` is enabled.
   *
   * @param data The raw response payload.
   * @param context$ The form's component context.
   */
  transformResponse?: (data: any, context$: any) => Record<string, any>
}

/**
 * The submission-related events shared between the form blueprint and
 * `useModel`'s callbacks.
 */
export interface SubmissionEmits<TContext = any> {
  /**
   * Emitted when the form becomes invalid due to client-side validation errors.
   *
   * @param context$ The form's component context.
   */
  invalid: [context$: TContext]

  /**
   * Emitted when the form passes validation.
   *
   * @param context$ The form's component context.
   */
  valid: [context$: TContext]

  /**
   * Emitted when the form is submitted, before the HTTP request is sent.
   *
   * @param payload The submitted form payload.
   * @param context$ The form's component context.
   */
  submit: [payload: FormData | Record<string, any>, context$: TContext]

  /**
   * Emitted when an HTTP response is received from the server.
   *
   * @param response The HTTP response object.
   */
  response: [response: HttpResponse]

  /**
   * Emitted when form submission fails due to a network or server error.
   *
   * @param result The failure result object.
   */
  fail: [result: SubmitFail]

  /**
   * Emitted when a submission attempt fails client-side validation, before any
   * request is made.
   *
   * @param result The client-invalid result object.
   */
  clientInvalid: [result: SubmitClientInvalid]

  /**
   * Emitted when form submission fails due to server-side validation errors
   * (a 422 response).
   *
   * @param result The server-invalid result object.
   */
  serverInvalid: [result: SubmitServerInvalid]

  /**
   * Emitted when form submission succeeds.
   *
   * @param result The success result object.
   */
  success: [result: SubmitSuccess]

  /**
   * Emitted when form submission is canceled before sending a request (e.g.
   * the form is invalid, loading, disabled, already submitting, or a `submit`
   * handler / `endpoint` function returned `false`).
   *
   * @param result The canceled result object.
   */
  canceled: [result: SubmitCanceled]
}

/**
 * Result returned when form submission succeeds with a server response.
 */
export interface SubmitSuccess {
  /**
   * The result type discriminator, always 'success'.
   */
  type: 'success'

  /**
   * The response data returned by the server.
   */
  data: any

  /**
   * The HTTP status code of the response.
   */
  status: number

  /**
   * The full HTTP response object.
   */
  response: HttpResponse

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}

/**
 * Result returned when form submission is rejected due to client-side
 * validation errors.
 */
export interface SubmitClientInvalid {
  /**
   * The result type discriminator, always 'invalid'.
   */
  type: 'invalid'

  /**
   * The error source, always 'client' for client-side validation failures.
   */
  source: 'client'

  /**
   * Validation errors keyed by element path.
   */
  errors: Record<string, string[]>

  /**
   * Structured validation issues (`{ path, rule, message }`) — the same
   * projection as `form$.issues` at the time of submission.
   */
  issues: Issue[]

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}

/**
 * Result returned when the server responds with a 422 validation error.
 */
export interface SubmitServerInvalid {
  /**
   * The result type discriminator, always 'invalid'.
   */
  type: 'invalid'

  /**
   * The error source, always 'server' for 422 validation responses.
   */
  source: 'server'

  /**
   * Validation errors keyed by element path, transformed via
   * `transformServerInvalid`.
   */
  errors: Record<string, string[]>

  /**
   * Structured issues synthesized from `errors` (`rule: 'server'`), mirroring
   * the client-side `issues` shape.
   */
  issues: Issue[]

  /**
   * The raw response data from the server.
   */
  data: any

  /**
   * The full HTTP response object.
   */
  response: HttpResponse

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}

/**
 * Union of client-side and server-side validation failure results.
 */
export type SubmitInvalid = SubmitClientInvalid | SubmitServerInvalid

/**
 * Result returned when form submission fails due to a network or server error.
 */
export interface SubmitFail {
  /**
   * The result type discriminator, always 'fail'.
   */
  type: 'fail'

  /**
   * The category of the failure (e.g. network error, timeout, abort, an origin
   * blocked by `$security.allowOrigins`, or an SSR-time request).
   */
  reason:
    | 'network'
    | 'timeout'
    | 'http'
    | 'abort'
    | 'blocked'
    | 'ssr'
    | 'unknown'

  /**
   * The HTTP status code, or null if no response was received.
   */
  status: number | null

  /**
   * A human-readable error message describing the failure.
   */
  message: string

  /**
   * The response data if available, or null.
   */
  data: any | null

  /**
   * The HTTP response object if available, or null.
   */
  response: HttpResponse | null

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}

/**
 * Result returned when form submission is canceled before sending a request.
 */
export interface SubmitCanceled {
  /**
   * The result type discriminator, always 'canceled'.
   */
  type: 'canceled'

  /**
   * The reason the submission was canceled (e.g. form was invalid, disabled,
   * or already submitting).
   */
  reason: 'loading' | 'disabled' | 'submitting' | 'prevented' | 'unknown'

  /**
   * The form context instance at the time of submission.
   */
  context$: any
}

/**
 * Discriminated union of all possible form submission outcomes.
 */
export type SubmitResult =
  | SubmitSuccess
  | SubmitInvalid
  | SubmitFail
  | SubmitCanceled

/**
 * Configuration options for `useSubmission`: the host-independent accessors and
 * hooks the submission flow runs against. The form blueprint supplies props and
 * mounted UX hooks; `useModel` supplies its options and headless equivalents.
 */
export type UseSubmissionOptions = {
  /**
   * The context passed to events, transforms, endpoint functions, and results.
   */
  context$: any

  /**
   * The http instance used for endpoint submissions.
   */
  http: HttpInstance

  /**
   * Returns the current submission payload.
   */
  payload: () => any

  /**
   * Applies (partial) data to the model — backs `setResponse`.
   */
  update: (data: Record<string, any>) => void

  /**
   * Runs the host's submit-time validation (the host decides forcing).
   */
  validate: () => Promise<unknown> | unknown

  /**
   * Whether the model is currently invalid.
   */
  invalid: () => boolean

  /**
   * Whether the host has disabled the submit-time validation floor (the form's
   * `disableValidation()`). Omitted, validation always runs.
   */
  validationDisabled?: () => boolean

  /**
   * Current validation errors keyed by element path.
   */
  errors: () => Record<string, string[]>

  /**
   * Current structured validation issues.
   */
  issues: () => Issue[]

  /**
   * The active endpoint: a handler function, or an already-resolved URL string.
   */
  endpoint: () => EndpointProp | undefined

  /**
   * The HTTP method for the submission request.
   */
  method: () => RequestMethod | undefined

  /**
   * Custom HTTP headers for the submission request.
   */
  headers: () => Record<string, string> | undefined

  /**
   * Whether to send the payload as JSON instead of FormData.
   */
  json: () => boolean | undefined

  /**
   * Whether to encode file uploads as base64.
   */
  base64: () => boolean | undefined

  /**
   * Whether 422 server errors should be applied via `applyServerErrors`.
   */
  setInvalid: () => boolean | undefined

  /**
   * Whether to update the model with the (transformed) server response data.
   */
  setResponse: () => boolean | undefined

  /**
   * The server-error transform; `defaultTransformServerInvalid` when undefined.
   */
  transformServerInvalid?: () =>
    | ((data: any, context$: any) => Record<string, any>)
    | undefined

  /**
   * The response transform; `defaultTransformResponse` when undefined.
   */
  transformResponse?: () => ((data: any, context$: any) => any) | undefined

  /**
   * Fires a submission event synchronously.
   */
  fire: (e: any, ...args: any[]) => any

  /**
   * Fires a submission event asynchronously, honoring `false` cancellation.
   */
  fireAsync: (e: any, ...args: any[]) => Promise<any>

  /**
   * Returns a cancellation reason from host state (e.g. `loading`/`disabled`),
   * or undefined when the host allows submission. An in-flight submission is
   * always canceled regardless.
   */
  cancelReason?: () => 'loading' | 'disabled' | undefined

  /**
   * Runs after a client-side validation failure (e.g. focus/scroll to the first
   * error).
   */
  onClientInvalid?: () => Promise<void> | void

  /**
   * Applies 422 server errors to the host's error surface (element message
   * bags on a mounted form; the instance's server errors headlessly). Only
   * called when `setInvalid()` is true.
   *
   * @param errors The coerced server errors keyed by element path.
   */
  applyServerErrors?: (errors: Record<string, string[]>) => Promise<void> | void

  /**
   * Runs right after the `success` event, before `setResponse` is applied
   * (the form shows its success message and runs reset/clear-on-success here).
   *
   * @param result The success result.
   */
  onSuccess?: (result: SubmitSuccess) => Promise<void> | void

  /**
   * Runs at the very end of a successful submission, after `setResponse`
   * (the form scrolls to top and redirects here).
   *
   * @param result The success result.
   */
  onAfterSuccess?: (result: SubmitSuccess) => Promise<void> | void
}

/**
 * The default `transformServerInvalid`: a 422 body's `errors` key, or the body
 * itself.
 *
 * @param data The raw error response data.
 */
export function defaultTransformServerInvalid(
  data: Record<string, any> | null
) {
  return data?.errors || data || {}
}

/**
 * The default `transformResponse`: the response body's `payload` key.
 *
 * @param data The raw response payload.
 */
export function defaultTransformResponse(data: any) {
  return data?.payload || {}
}

/**
 * The host-independent submission flow shared by the form blueprint and
 * `useModel`: cancellation guards, the submit-time validation floor, the
 * `submit` event / endpoint dispatch chain, request encoding, and the
 * success / fail / server-invalid / canceled result handling with their
 * events. Hosts contribute state and UX through the options' accessors and
 * hooks; everything here is component-free.
 *
 * @param options The host accessors and hooks the flow runs against.
 */
export function useSubmission(options: UseSubmissionOptions) {
  const { context$, http: $http, fire, fireAsync } = options

  let abortController: AbortController | null = null

  /**
   * The number of times the form has been submitted.
   */
  const submits = ref(0)

  /**
   * Whether the form is currently being submitted.
   */
  const submitting = ref(false)

  /**
   * Whether the form is currently being validated.
   */
  const validating = ref(false)

  /**
   * The HTTP response from the most recent submission.
   */
  const response = ref<HttpResponse | undefined>()

  /**
   * The result object from the most recent submission attempt.
   */
  const result = ref<SubmitResult | undefined>()

  /**
   * Validates and submits the form, returning a result describing the outcome.
   */
  const submit = async (): Promise<SubmitResult | undefined> => {
    submits.value++

    result.value = undefined
    response.value = undefined

    const cancelReason = options.cancelReason?.()

    if (cancelReason !== undefined || submitting.value) {
      result.value = {
        type: 'canceled',
        reason: cancelReason ?? 'submitting',
        context$,
      }

      fire('canceled', result.value)

      return result.value
    }

    if (!options.validationDisabled?.()) {
      validating.value = true
      // Submission always validates as a floor: an untouched form can never
      // submit unvalidated. The host's `validate` decides whether to force a
      // full re-validation (e.g. `validateOn: ['submit']`), and the host's
      // `validationDisabled` (the form's `disableValidation()`) is the only
      // full opt-out.
      await options.validate()
      validating.value = false
    }

    if (options.invalid()) {
      result.value = {
        type: 'invalid',
        source: 'client',
        errors: options.errors(),
        issues: options.issues(),
        context$,
      }

      fire('clientInvalid', result.value)

      await options.onClientInvalid?.()

      return result.value
    }

    submitting.value = true
    abortController = new AbortController()

    try {
      const submitResponse = await fireAsync(
        'submit',
        options.payload(),
        context$
      )

      if (submitResponse === false) {
        result.value = {
          type: 'canceled',
          reason: 'prevented',
          context$,
        }

        fire('canceled', result.value)

        return result.value
      }

      const endpoint = options.endpoint()

      if (submitResponse !== true) {
        response.value = submitResponse as HttpResponse
      } else if (typeof endpoint === 'function') {
        const endpointResult = await endpoint(options.payload(), context$)

        if (endpointResult === false) {
          result.value = {
            type: 'canceled',
            reason: 'prevented',
            context$,
          }

          fire('canceled', result.value)

          return result.value
        }

        if (typeof endpointResult === 'string') {
          response.value = await $http.request({
            url: endpointResult,
            method: options.method(),
            data: options.payload(),
            headers: options.headers(),
            signal: abortController.signal,
            requestType: options.json() ? 'json' : 'form',
            base64: options.base64(),
          })
        } else if (endpointResult) {
          response.value = endpointResult as HttpResponse
        }
      } else if (endpoint) {
        response.value = await $http.request({
          url: endpoint,
          method: options.method(),
          data: options.payload(),
          headers: options.headers(),
          signal: abortController.signal,
          requestType: options.json() ? 'json' : 'form',
          base64: options.base64(),
        })
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        const data = error.response?.data || null

        if (error.reason === 'abort') {
          result.value = {
            type: 'fail',
            reason: 'abort',
            status: null,
            message: error.message,
            data: null,
            response: null,
            context$,
          }

          fire('fail', result.value)

          return result.value
        } else if (error.status === 422) {
          // The 422 body is server-controlled and its shape is not trusted:
          // coerce the error map to `Record<string, string[]>` so a string
          // value doesn't iterate per-character and a scalar doesn't throw a
          // `TypeError` from inside error handling.
          const transformServerInvalid =
            options.transformServerInvalid?.() ?? defaultTransformServerInvalid
          const rawServerErrors = transformServerInvalid(data, context$) || {}
          const serverErrors: Record<string, string[]> = {}

          if (isPlainObject(rawServerErrors)) {
            for (const [path, messages] of Object.entries(rawServerErrors)) {
              serverErrors[path] = Array.isArray(messages)
                ? messages.filter((m): m is string => typeof m === 'string')
                : typeof messages === 'string'
                  ? [messages]
                  : []
            }
          }

          result.value = {
            type: 'invalid',
            source: 'server',
            errors: serverErrors,
            issues: Object.entries(serverErrors).flatMap(([path, messages]) =>
              messages.map((message) => ({
                path,
                rule: 'server',
                message,
              }))
            ),
            data,
            response: error.response!,
            context$,
          }

          if (error.response) {
            fire('response', error.response)
          }

          fire('serverInvalid', result.value)

          if (options.setInvalid()) {
            await options.applyServerErrors?.(serverErrors)
          }

          return result.value
        } else {
          result.value = {
            type: 'fail',
            reason: error.reason,
            status: error.status || null,
            message: error.message,
            data,
            response: error.response || null,
            context$,
          }

          if (error.response) {
            fire('response', error.response)
          }

          fire('fail', result.value)

          return result.value
        }
      } else {
        throw new Error(error)
      }
    } finally {
      submitting.value = false
      abortController = null
    }

    if (
      response.value &&
      typeof response.value.status === 'number' &&
      (response.value.status < 200 || response.value.status >= 300)
    ) {
      result.value = {
        type: 'fail',
        reason: 'http',
        status: response.value.status,
        message: `Request failed with status ${response.value.status}`,
        data: response.value.data ?? null,
        response: response.value,
        context$,
      }

      fire('response', response.value)
      fire('fail', result.value)

      return result.value
    }

    if (response.value) {
      result.value = {
        type: 'success',
        data: response.value.data,
        status: response.value.status,
        response: response.value,
        context$,
      }

      fire('response', response.value)
      fire('success', result.value)

      await options.onSuccess?.(result.value)

      if (options.setResponse()) {
        const transformResponse =
          options.transformResponse?.() ?? defaultTransformResponse
        const responseData =
          transformResponse(response.value.data, context$) || {}

        if (Object.keys(responseData).length) {
          options.update(responseData)
        }
      }

      await options.onAfterSuccess?.(result.value)

      return result.value
    }

    return result.value
  }

  /**
   * Aborts the current in-flight submission request.
   */
  const abort = () => {
    abortController?.abort()
  }

  return {
    submits,
    submitting,
    validating,
    response,
    result,
    submit,
    abort,
  }
}
