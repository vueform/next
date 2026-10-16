```ts
type UnitState = {
  unit: Unit
  status: Ref<UnitStatus>
  raw: Ref<string | undefined>
  /**
   * Whether the current result corresponds to the current model value. Applied
   * by `applyResult` and cleared by the store's write notifications
   * (`markStale`), so no write path can leave a result looking current for a
   * value it never validated.
   */
  validated: Ref<boolean>
  timer: Ref<ReturnType<typeof setTimeout> | undefined>
  active: Ref<boolean>
  runId: number
  scope?: EffectScope
  indexedDeps: string[]
  rejectPending?: (error: Error) => void
}
```
