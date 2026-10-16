```ts
/**
 * Provides click handling, loading state, text props (icon, text, href, to),
 * static messaging, and scoped theme tokens for a button element.
 *
 * @param options Factory options containing element props, events, and
 *   dependencies.
 */
const makeButton: (
  config?: unknown
) => (options: MakeButtonOptions) => {
  icon: ComputedRef<string | undefined>
  text: ComputedRef<string | (string & {}) | undefined>
  href: ComputedRef<string | (string & {}) | undefined>
  to: ComputedRef<string | (string & {}) | undefined>
  severity: ComputedRef<string | (string & {}) | undefined>
  loading: ComputedRef<boolean>
  messageBag: MessageBagInstance
  displayErrors: ComputedRef<string[]>
  errors: ComputedRef<string[]>
  messages: ComputedRef<string[]>
  tokens: ComputedRef<CSSProperties>
  tokenClass: string
  tokenCss: ComputedRef<string>
  nonce: Readonly<Ref<string | undefined, string | undefined>>
  handleClick: (event: MouseEvent) => void
}
```
