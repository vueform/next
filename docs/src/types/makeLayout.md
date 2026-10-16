```ts
/**
 * Core factory for all form elements, composing identity, path, conditions,
 * template, layout, columns, and focus.
 *
 * @param options Factory options containing element props.
 */
const makeLayout: (
  config?: unknown
) => (options: MakeViewOptions) => {
  page: ComputedRef<PageProp | undefined>
  label: ComputedRef<string | undefined>
  help: ComputedRef<string>
  description: ComputedRef<string | (string & {}) | undefined>
  helpId: ComputedRef<string>
  descriptionId: ComputedRef<string>
  errorId: ComputedRef<string>
  labelId: ComputedRef<string>
  resolvedColumns: ComputedRef<Record<string, Partial<ResolvedColumns>>>
  genericName: ComputedRef<string>
  updateColumns: (v: any) => any
  focus: (scroll?: boolean | undefined) => Promise<boolean>
  scrollTo: (
    options?: ScrollIntoViewOptions,
    force?: boolean
  ) => Promise<boolean>
}
```
