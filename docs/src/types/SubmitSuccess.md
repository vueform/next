```ts
/**
 * Result returned when form submission succeeds with a server response.
 */
interface SubmitSuccess {
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
```
