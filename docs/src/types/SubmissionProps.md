```ts
/**
 * The submission-related props shared between the form blueprint and
 * `useModel`'s options: endpoint configuration, request encoding, server
 * response handling, and the payload / server-error / response transforms.
 */
interface SubmissionProps {
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
```
