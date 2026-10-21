```ts
/**
 * Returns the internal event emitter of a `useModel` instance, or `undefined`
 * for non-instance values. The form blueprint fires its events into it so
 * instance-level subscriptions keep firing while a form owns submission.
 *
 * @param value The candidate `useModel` instance.
 */
function getModelEvents(value: any): ReturnType<typeof createEvents> | undefined
```
