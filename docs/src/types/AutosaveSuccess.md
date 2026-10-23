```ts
/**
 * Result passed to the `autosaveSuccess` event when a save's response has a
 * 2xx status — the same shape as a submission's success result.
 */
interface AutosaveSuccess {
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
   * The form context instance at the time of the save.
   */
  context$: any
}
```
